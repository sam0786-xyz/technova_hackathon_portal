"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Building2, Mail, User, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export function PartnershipForm() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto"
        >
            <div className="p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-blue-500/20 transition-all duration-500">
                <form action="mailto:technova@sharda.ac.in" method="post" encType="text/plain" autoComplete="on" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-400" />
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Your Name"
                                required
                                autoComplete="name"
                                className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 placeholder:text-gray-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company" className="text-gray-300 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-purple-400" />
                                Company
                            </Label>
                            <Input
                                id="company"
                                name="company"
                                placeholder="Your Company"
                                required
                                autoComplete="organization"
                                className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-emerald-400" />
                            Work Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@company.com"
                            required
                            autoComplete="email"
                            className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 placeholder:text-gray-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="interest" className="text-gray-300">Area of Interest</Label>
                        <Input
                            id="interest"
                            name="interest"
                            placeholder="Sponsorship, Mentorship, Recruiting..."
                            className="bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 placeholder:text-gray-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-gray-300 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-amber-400" />
                            Message
                        </Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Tell us how you'd like to collaborate..."
                            className="min-h-[120px] bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 placeholder:text-gray-600 resize-none"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-[1.02]"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send Inquiry
                    </Button>
                </form>
            </div>
        </motion.div>
    );
}
