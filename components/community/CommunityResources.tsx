"use client";

import { getResources } from "@/lib/actions/resources";
import { ResourceList } from "@/components/resources/ResourceList";
import { UploadResource } from "@/components/resources/UploadResource";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, GraduationCap, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export function CommunityResources() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Defaulting to state rather than immediately picking up URL search params for the internal tab 
    // unless you want to sync the tab's internal state with the URL. 
    // We will use local state for filtering to keep it clean within the tab.
    const [subject, setSubject] = useState("");
    const [semester, setSemester] = useState("all");

    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchResources() {
            setLoading(true);
            const results = await getResources(semester, subject);
            setResources(results);
            setLoading(false);
        }
        fetchResources();
    }, [semester, subject]);

    const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setSemester(formData.get("semester") as string);
        setSubject(formData.get("subject") as string);
    };

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">
                        Academic Resources
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Access PYQs, notes, and study materials shared by peers.</p>
                </div>
                <div className="flex-shrink-0">
                    <UploadResource />
                </div>
            </div>

            {/* Filter Box */}
            <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-amber-400" />
                    <h3 className="font-semibold">Filter Resources</h3>
                </div>
                <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-48">
                        <Select name="semester" defaultValue={semester} onValueChange={setSemester}>
                            <SelectTrigger className="bg-white/5 border-white/10 focus:border-amber-500/50 h-12">
                                <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10">
                                <SelectItem value="all">All Semesters</SelectItem>
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
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <Input
                            name="subject"
                            placeholder="Search for subjects..."
                            className="pl-12 bg-white/5 border-white/10 focus:border-amber-500/50 h-12 placeholder:text-gray-500"
                            defaultValue={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    {/* Filter button removed as state updates trigger effect directly, but keeping for form submission pattern if preferred. Actually, with onValueChange and onChange, we don't strictly need a submit button, but let's keep it for explicit action if they type a subject and press enter. */}
                </form>
            </div>

            {/* Resources */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading resources...</p>
                </div>
            ) : resources.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 rounded-2xl bg-white/[0.02] border border-white/10"
                >
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-6">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No Resources Found</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                        No resources match your filter criteria. Try adjusting your search or be the first to upload!
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                >
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                        <GraduationCap className="w-5 h-5 text-amber-400" />
                        <span className="font-semibold">{resources.length} Resources Found</span>
                    </div>
                    <ResourceList resources={resources} />
                </motion.div>
            )}
        </div>
    );
}
