import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Sparkles, Trophy, Megaphone, Users, Globe, Camera, Award, Mic } from "lucide-react";

const sponsorshipTiers = [
    {
        tier: "Gold",
        color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        iconColor: "text-yellow-400",
        bgGlow: "from-yellow-500/20 to-transparent",
        benefits: [
            { icon: Trophy, text: "Title Sponsor for flagship events" },
            { icon: Megaphone, text: "Prime logo placement on all materials" },
            { icon: Mic, text: "Speaking opportunity at major events" },
            { icon: Users, text: "Dedicated networking session" },
            { icon: Globe, text: "Featured on website homepage" },
            { icon: Camera, text: "Full event photo & video coverage" },
        ]
    },
    {
        tier: "Silver",
        color: "bg-slate-300/10 text-slate-300 border-slate-300/20",
        iconColor: "text-slate-300",
        bgGlow: "from-slate-400/10 to-transparent",
        benefits: [
            { icon: Star, text: "Co-sponsor branding on events" },
            { icon: Megaphone, text: "Logo on event banners & posters" },
            { icon: Users, text: "Access to talent pool for recruitment" },
            { icon: Globe, text: "Featured on sponsors page" },
            { icon: Award, text: "Social media shoutouts" },
        ]
    },
    {
        tier: "Bronze",
        color: "bg-orange-700/10 text-orange-600 border-orange-700/20",
        iconColor: "text-orange-500",
        bgGlow: "from-orange-700/10 to-transparent",
        benefits: [
            { icon: Sparkles, text: "Logo on event materials" },
            { icon: Globe, text: "Mention on website" },
            { icon: Users, text: "Workshop hosting opportunity" },
            { icon: Award, text: "Certificate of appreciation" },
        ]
    }
];

export function SponsorShowcase() {
    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Partner With Us</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Support the next generation of tech leaders and gain visibility among 1000+ students and tech enthusiasts.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {sponsorshipTiers.map((tier) => (
                        <Card
                            key={tier.tier}
                            className={`relative overflow-hidden bg-black/40 border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] group`}
                        >
                            {/* Background glow effect */}
                            <div className={`absolute inset-0 bg-gradient-to-b ${tier.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <CardContent className="p-6 relative z-10">
                                {/* Tier Header */}
                                <div className="text-center mb-6">
                                    <Badge
                                        variant="outline"
                                        className={`px-6 py-2 text-lg font-bold ${tier.color} uppercase tracking-widest mb-4`}
                                    >
                                        {tier.tier}
                                    </Badge>
                                    <p className="text-sm text-gray-400">Sponsorship Tier</p>
                                </div>

                                {/* Benefits List */}
                                <ul className="space-y-4">
                                    {tier.benefits.map((benefit, idx) => (
                                        <li key={idx} className="flex items-start gap-3 group/item">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${tier.iconColor} group-hover/item:bg-white/10 transition-colors`}>
                                                <benefit.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-gray-300 text-sm leading-relaxed pt-1">
                                                {benefit.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-muted-foreground mb-4">
                        Interested in supporting the next generation of tech leaders?
                    </p>
                    <a
                        href="mailto:technova@sharda.ac.in?subject=Sponsorship%20Inquiry"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:scale-105 transition-transform"
                    >
                        <Megaphone className="w-5 h-5" />
                        Become a Sponsor
                    </a>
                </div>
            </div>
        </section>
    );
}
