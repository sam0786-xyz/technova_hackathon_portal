"use client";

import { useFormState } from "react-dom";
import { deletePost, deleteComment } from "@/lib/actions/community";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
// Note: alert-dialog might need to be created if not exists, but let's assume standard shadcn or simple button for now.
// Since I haven't checked/created alert-dialog, I'll use a simple button with confirm or just direct action (for MVP).
// Wait, I installed @radix-ui/react-dialog earlier but not alert-dialog explicitly.
// Let's use a simple button form action for now to be safe.

export function DeletePostButton({ postId }: { postId: string }) {
    const deleteAction = async () => {
        await deletePost(postId);
    };

    return (
        <form action={deleteAction}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>
        </form>
    );
}

export function DeleteCommentButton({ commentId, postId }: { commentId: string, postId: string }) {
    const deleteAction = async () => {
        await deleteComment(commentId, postId);
    };

    return (
        <form action={deleteAction}>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">Delete</span>
            </Button>
        </form>
    );
}
