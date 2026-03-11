"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addComment } from "@/lib/actions/community";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { CommunityComment } from "@/types/custom";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Posting..." : "Post Comment"}
        </Button>
    );
}

import { DeleteCommentButton } from "./DeleteButtons";

export function CommentSection({ postId, comments, userId }: { postId: string, comments: CommunityComment[], userId?: string }) {
    const [state, formAction] = useActionState(addComment, null);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>

            {userId ? (
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="postId" value={postId} />
                    <Textarea
                        name="content"
                        placeholder="Add a comment..."
                        required
                        className="min-h-[80px]"
                    />
                    <div className="flex justify-end">
                        <SubmitButton />
                    </div>
                    {state?.error && (
                        <p className="text-sm text-destructive">{state.error}</p>
                    )}
                </form>
            ) : (
                <div className="rounded-lg bg-muted p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Please log in to comment.</p>
                </div>
            )}

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4 p-4 rounded-lg bg-muted/50 group relative">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.users?.image || ""} />
                            <AvatarFallback>{comment.users?.name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">{comment.users?.name || "Anonymous"}</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-sm text-foreground/90">{comment.content}</p>
                        </div>
                        {userId && comment.user_id === userId && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DeleteCommentButton commentId={comment.id} postId={postId} />
                            </div>
                        )}
                    </div>
                ))}
                {comments.length === 0 && (
                    <p className="text-muted-foreground text-sm">No comments yet.</p>
                )}
            </div>
        </div>
    );
}
