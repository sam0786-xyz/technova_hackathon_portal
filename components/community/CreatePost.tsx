"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPost } from "@/lib/actions/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Posting..." : "Create Post"}
        </Button>
    );
}

export function CreatePost() {
    const [state, formAction] = useActionState(createPost, null);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Start a Discussion</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="What's on your mind?"
                            required
                            minLength={5}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" defaultValue="General">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Hackathon">Hackathon</SelectItem>
                                <SelectItem value="Project">Project</SelectItem>
                                <SelectItem value="Question">Question</SelectItem>
                                <SelectItem value="Resource">Resource</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            name="content"
                            placeholder="Share your thoughts..."
                            required
                            minLength={10}
                            className="min-h-[100px]"
                        />
                    </div>

                    {state?.error && (
                        <Alert variant="destructive">
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}

                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
