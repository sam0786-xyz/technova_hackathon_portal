import { CommunityPost } from "@/types/custom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { DeletePostButton } from "./DeleteButtons";

export function PostList({ posts, userId }: { posts: CommunityPost[], userId?: string }) {
    if (posts.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No posts yet. Be the first to start a conversation!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <div key={post.id} className="relative group">
                    <Link href={`/community/${post.id}`} className="block">
                        <Card className="hover:bg-accent/50 transition-colors">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="flex items-center space-x-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={post.users?.image || ""} />
                                        <AvatarFallback>{post.users?.name?.[0] || "?"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-sm font-medium">{post.users?.name || "Anonymous"}</div>
                                        <div className="text-xs text-muted-foreground flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                                {post.category && (
                                    <Badge variant="secondary">{post.category}</Badge>
                                )}
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {post.content}
                                </p>
                                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    {post._count?.community_comments ?? 0} comments
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    {userId && post.user_id === userId && (
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DeletePostButton postId={post.id} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
