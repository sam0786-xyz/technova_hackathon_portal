"use client";

import { getProjects, getCurrentUserId } from "@/lib/actions/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Rocket, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CommunityShowcase() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

    const fetchProjects = async () => {
        const results = await getProjects();
        setProjects(results);
        setLoading(false);
    };

    useEffect(() => {
        fetchProjects();
        getCurrentUserId().then(setCurrentUserId);
    }, []);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                        Project Showcase
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Explore amazing projects built by the Technova community.</p>
                </div>
                <Link href="/showcase/new">
                    <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <Plus className="w-4 h-4 mr-2" />
                        Submit Project
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading projects...</p>
                </div>
            ) : projects.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-24 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-dashed border-white/10"
                >
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-6">
                        <Rocket className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-bold mb-3">No Projects Yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                        Be the first to showcase your work to the world! Share your projects and inspire others.
                    </p>
                    <Link href="/showcase/new">
                        <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Submit Your First Project
                        </Button>
                    </Link>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {projects.map((project: any, idx: number) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <ProjectCard
                                project={project}
                                currentUserId={currentUserId}
                                onDelete={fetchProjects}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
