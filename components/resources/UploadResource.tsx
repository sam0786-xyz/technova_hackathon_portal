"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createResource } from "@/lib/actions/resources";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-none h-11 font-medium shadow-lg shadow-amber-900/20"
            disabled={pending}
        >
            {pending ? "Uploading..." : "Upload Resource"}
        </Button>
    );
}

export function UploadResource() {
    const [open, setOpen] = useState(false);
    const [state, formAction] = useActionState(createResource, null);

    useEffect(() => {
        if (state?.success) {
            const timer = setTimeout(() => {
                setOpen(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state?.success]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Upload Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[95vh] overflow-y-auto bg-zinc-950/90 backdrop-blur-2xl border-white/10 text-white shadow-2xl custom-scrollbar">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-600/10 rounded-full blur-[50px] pointer-events-none" />

                <DialogHeader className="relative z-10">
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                        Upload Resource
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Share academic resources with the community.
                    </DialogDescription>
                </DialogHeader>

                <form action={async (formData) => {
                    await formAction(formData);
                }} className="space-y-4 py-4 relative z-10">

                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-gray-300 font-medium ml-1">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="e.g. Data Structures Notes"
                            required
                            className="bg-white/5 border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-gray-600 h-11"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="resource-type" className="text-gray-300 font-medium ml-1">Type</Label>
                            <Select name="type" defaultValue="Notes">
                                <SelectTrigger id="resource-type" className="bg-white/5 border-white/10 focus:border-amber-500/50 text-white h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="Notes">Notes</SelectItem>
                                    <SelectItem value="PYQ">PYQ</SelectItem>
                                    <SelectItem value="Book">Book</SelectItem>
                                    <SelectItem value="Assignment">Assignment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="resource-semester" className="text-gray-300 font-medium ml-1">Semester</Label>
                            <Select name="semester">
                                <SelectTrigger id="resource-semester" className="bg-white/5 border-white/10 focus:border-amber-500/50 text-white h-11">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="Sem 1">Sem 1</SelectItem>
                                    <SelectItem value="Sem 2">Sem 2</SelectItem>
                                    <SelectItem value="Sem 3">Sem 3</SelectItem>
                                    <SelectItem value="Sem 4">Sem 4</SelectItem>
                                    <SelectItem value="Sem 5">Sem 5</SelectItem>
                                    <SelectItem value="Sem 6">Sem 6</SelectItem>
                                    <SelectItem value="Sem 7">Sem 7</SelectItem>
                                    <SelectItem value="Sem 8">Sem 8</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-gray-300 font-medium ml-1">Subject</Label>
                        <Input
                            id="subject"
                            name="subject"
                            placeholder="e.g. Operating Systems"
                            className="bg-white/5 border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-gray-600 h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file_url" className="text-gray-300 font-medium ml-1">File URL (Drive/Dropbox/etc)</Label>
                        <Input
                            id="file_url"
                            name="file_url"
                            placeholder="https://..."
                            required
                            type="url"
                            className="bg-white/5 border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-gray-600 h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-gray-300 font-medium ml-1">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Additional details..."
                            className="bg-white/5 border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-gray-600 min-h-[80px]"
                        />
                    </div>

                    {state?.error && (
                        <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}

                    {state?.success && (
                        <Alert className="bg-green-500/10 border-green-500/50 text-green-400">
                            <AlertDescription>Uploaded successfully! Pending approval.</AlertDescription>
                        </Alert>
                    )}

                    <div className="pt-2">
                        <SubmitButton />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
