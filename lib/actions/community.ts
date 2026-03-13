'use server'

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";

const createPostSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    category: z.string().optional(),
});

export async function createPost(prevState: any, formData: FormData) {
    const supabase = await createClient();

    // Get current user
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
        return { error: "You must be logged in to post." };
    }

    const result = createPostSchema.safeParse({
        title: formData.get("title"),
        content: formData.get("content"),
        category: formData.get("category"),
    });

    if (!result.success) {
        return { error: result.error.issues[0]?.message || "Validation failed" };
    }

    const { title, content, category } = result.data;

    // Insert post
    // Note: We are using next_auth.users as the reference, but Supabase Auth user object has the ID.
    // We assume the ID from supabase.auth.getUser() matches the one in next_auth.users or we handle the mapping.
    // If using @auth/supabase-adapter, the user.id from session should match.
    // However, next-auth and supabase auth might be separate. 
    // Let's verify how auth is handled. If using NextAuth with Supabase Adapter, 
    // we usually access the session via auth() from next-auth/next or similar.
    // But here we are importing createClient from lib/supabase/server which implies Supabase Auth.

    // Checking if we need to use NextAuth session instead.
    // Since the migration uses references to next_auth.users, we should probably use the ID from the NextAuth session.

    // Let's rely on the user.id from Supabase if they are synced, OR check existing code.
    // For now, I will use the user.id from supabase.auth.getUser() assuming they are the same or standard Supabase Auth is primary.
    // If the user uses NextAuth for login, they might not have a Supabase Auth session.
    // I will check `lib/auth/auth.ts` or similar if it exists later. 
    // For now I'll write defensive code.

    // Use admin client to bypass RLS since we verified auth via NextAuth
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from('community_posts').insert({
        user_id: user.id,
        title,
        content,
        category
    });

    if (error) {
        console.error("Error creating post:", error);
        return { error: "Failed to create post" };
    }

    revalidatePath('/community');
    redirect('/community');
}

export async function getPosts() {
    const supabase = await createClient();
    const { data: posts, error } = await supabase
        .from('community_posts')
        .select(`
            *,
            _count:community_comments(count)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching posts:", error);
        return [];
    }

    // Manually fetch user details
    const userIds = Array.from(new Set(posts.map((p: any) => p.user_id)));
    const supabaseAdmin = createAdminClient();
    const { data: users } = await supabaseAdmin
        .schema('next_auth')
        .from('users')
        .select('id, name, image')
        .in('id', userIds);

    const userMap = new Map(users?.map((u: any) => [u.id, u]));

    const postsWithUsers = posts.map((post: any) => ({
        ...post,
        users: userMap.get(post.user_id) || { name: 'Unknown', image: null },
        _count: {
            community_comments: post._count?.[0]?.count || 0
        }
    }));

    return postsWithUsers;
}

export async function getPost(id: string) {
    const supabase = await createClient();
    const { data: post, error } = await supabase
        .from('community_posts')
        .select(`
            *,
            community_comments (
                id,
                content,
                created_at,
                user_id
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching post:", error);
        return null;
    }

    // Fetch users for post and comments
    const userIds = new Set([post.user_id]);
    post.community_comments?.forEach((c: any) => userIds.add(c.user_id));

    const supabaseAdmin = createAdminClient();
    const { data: users } = await supabaseAdmin
        .schema('next_auth')
        .from('users')
        .select('id, name, image')
        .in('id', Array.from(userIds));

    const userMap = new Map(users?.map((u: any) => [u.id, u]));

    // Attach user to post
    const postWithUser = {
        ...post,
        users: userMap.get(post.user_id) || { name: 'Unknown', image: null },
        community_comments: post.community_comments?.map((c: any) => ({
            ...c,
            users: userMap.get(c.user_id) || { name: 'Unknown', image: null }
        }))
    };

    if (postWithUser.community_comments) {
        postWithUser.community_comments.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return postWithUser;
}

const createCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty"),
    postId: z.string().uuid(),
});

export async function addComment(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
        return { error: "You must be logged in to comment." };
    }

    const result = createCommentSchema.safeParse({
        content: formData.get("content"),
        postId: formData.get("postId"),
    });

    if (!result.success) {
        return { error: result.error.issues[0]?.message || "Validation failed" };
    }

    const { content, postId } = result.data;

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from('community_comments').insert({
        user_id: user.id,
        post_id: postId,
        content
    });

    if (error) {
        console.error("Error adding comment:", error);
        return { error: "Failed to add comment" };
    }

    revalidatePath(`/community/${postId}`);
    return { success: true };
}

export async function deletePost(postId: string) {
    const supabaseAdmin = createAdminClient();
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
        return { error: "You must be logged in." };
    }

    // Check ownership
    const { data: post } = await supabaseAdmin.from('community_posts').select('user_id').eq('id', postId).single();
    if (!post || post.user_id !== user.id) {
        // Allow admin to delete? For now strict ownership.
        return { error: "Not authorized to delete this post." };
    }

    const { error } = await supabaseAdmin.from('community_posts').delete().eq('id', postId);

    if (error) {
        return { error: "Failed to delete post." };
    }

    revalidatePath('/community');
    redirect('/community');
}



export async function deleteComment(commentId: string, postId: string) {
    const supabaseAdmin = createAdminClient();
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
        return { error: "You must be logged in." };
    }

    // Check ownership
    const { data: comment } = await supabaseAdmin.from('community_comments').select('user_id').eq('id', commentId).single();
    if (!comment || comment.user_id !== user.id) {
        return { error: "Not authorized to delete this comment." };
    }

    const { error } = await supabaseAdmin.from('community_comments').delete().eq('id', commentId);

    if (error) {
        return { error: "Failed to delete comment." };
    }

    revalidatePath(`/community/${postId}`);
    return { success: true };
}
