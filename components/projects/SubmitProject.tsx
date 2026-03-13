"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createProject } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Submitting..." : "Submit Project"}
        </Button>
    );
}

export function SubmitProjectForm() {
    const [state, formAction] = useFormState(createProject, null);

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Submit Your Project</CardTitle>
                <CardDescription>
                    Showcase your hard work to the community.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Project Title</Label>
                        <Input id="title" name="title" placeholder="My Awesome Project" required minLength={3} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="What does your project do?"
                            required
                            minLength={10}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tech_stack">Tech Stack (comma separated)</Label>
                            <Input id="tech_stack" name="tech_stack" placeholder="React, Next.js, Firebase..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image_url">Image URL</Label>
                            <Input id="image_url" name="image_url" placeholder="https://..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="project_url">Live Demo URL</Label>
                            <Input id="project_url" name="project_url" placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="repo_url">GitHub/Repo URL</Label>
                            <Input id="repo_url" name="repo_url" placeholder="https://github.com/..." />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="video_url">Video Demo URL (YouTube/Loom)</Label>
                        <Input id="video_url" name="video_url" placeholder="https://..." />
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
