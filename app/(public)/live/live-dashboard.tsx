"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Clock, Calendar, Trophy, Sparkles, Flame, AlertTriangle, Zap } from "lucide-react";
import { format, differenceInSeconds } from "date-fns";

export default function LiveDashboardClient({
    initialSettings,
    initialSchedule,
    initialShortlisted
}: {
    initialSettings: any;
    initialSchedule: any[];
    initialShortlisted: any[];
}) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isFinished, setIsFinished] = useState(false);
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [totalDurationSeconds, setTotalDurationSeconds] = useState(0);

    // Auto refresh data every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 10000);
        return () => clearInterval(interval);
    }, [router]);

    // Timer Logic
    useEffect(() => {
        if (!initialSettings?.timer_start || !initialSettings?.is_running) return;

        const startTime = new Date(initialSettings.timer_start);
        const durationMs = initialSettings.duration_hours * 60 * 60 * 1000;
        const endTime = new Date(startTime.getTime() + durationMs);
        setTotalDurationSeconds(Math.floor(durationMs / 1000));

        const calculateTimeLeft = () => {
            const now = new Date();
            const diffSeconds = differenceInSeconds(endTime, now);

            if (diffSeconds <= 0) {
                setIsFinished(true);
                setTotalSeconds(0);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                setIsFinished(false);
                setTotalSeconds(diffSeconds);
                setTimeLeft({
                    hours: Math.floor(diffSeconds / 3600),
                    minutes: Math.floor((diffSeconds % 3600) / 60),
                    seconds: diffSeconds % 60
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [initialSettings]);

    const progressPercent = totalDurationSeconds > 0 ? Math.max(0, Math.min(100, ((totalDurationSeconds - totalSeconds) / totalDurationSeconds) * 100)) : 0;
    const totalHoursLeft = totalSeconds / 3600;

    // Urgency levels
    const urgency = useMemo(() => {
        if (isFinished) return 'finished';
        if (totalHoursLeft <= 0.5) return 'critical'; // <30 min
        if (totalHoursLeft <= 2) return 'urgent';     // <2 hrs
        if (totalHoursLeft <= 6) return 'warning';     // <6 hrs
        return 'normal';
    }, [totalHoursLeft, isFinished]);

    const urgencyConfig = {
        normal: {
            glow: 'from-emerald-500/10 via-transparent to-teal-500/10',
            textColor: 'text-emerald-400',
            borderColor: 'border-emerald-500/20',
            progressColor: 'bg-emerald-500',
            progressGlow: 'shadow-[0_0_15px_rgba(52,211,153,0.5)]',
            label: 'Hackathon Live',
            dotColor: 'bg-emerald-500',
            timeGlow: 'drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]',
            secondsColor: 'text-emerald-400',
        },
        warning: {
            glow: 'from-amber-500/10 via-transparent to-yellow-500/10',
            textColor: 'text-amber-400',
            borderColor: 'border-amber-500/20',
            progressColor: 'bg-amber-500',
            progressGlow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
            label: '⚡ Less than 6 Hours Left!',
            dotColor: 'bg-amber-500',
            timeGlow: 'drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]',
            secondsColor: 'text-amber-400',
        },
        urgent: {
            glow: 'from-orange-500/15 via-red-500/5 to-orange-500/15',
            textColor: 'text-orange-400',
            borderColor: 'border-orange-500/30',
            progressColor: 'bg-gradient-to-r from-orange-500 to-red-500',
            progressGlow: 'shadow-[0_0_20px_rgba(249,115,22,0.6)]',
            label: '🔥 Final 2 Hours — Push It!',
            dotColor: 'bg-orange-500',
            timeGlow: 'drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]',
            secondsColor: 'text-orange-400',
        },
        critical: {
            glow: 'from-red-500/20 via-red-600/10 to-red-500/20',
            textColor: 'text-red-400',
            borderColor: 'border-red-500/40',
            progressColor: 'bg-gradient-to-r from-red-500 to-pink-500',
            progressGlow: 'shadow-[0_0_25px_rgba(239,68,68,0.8)]',
            label: '🚨 FINAL MINUTES — SUBMIT NOW!',
            dotColor: 'bg-red-500',
            timeGlow: 'drop-shadow-[0_0_40px_rgba(239,68,68,0.7)]',
            secondsColor: 'text-red-500',
        },
        finished: {
            glow: 'from-amber-500/20 via-transparent to-orange-500/20',
            textColor: 'text-amber-400',
            borderColor: 'border-amber-500/30',
            progressColor: 'bg-amber-500',
            progressGlow: '',
            label: 'TIME IS UP!',
            dotColor: 'bg-amber-500',
            timeGlow: '',
            secondsColor: 'text-amber-400',
        },
    };

    const cfg = urgencyConfig[urgency];

    const now = new Date();
    const sortedSchedule = [...initialSchedule].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    return (
        <div className="container mx-auto px-4 max-w-7xl space-y-8 animate-in fade-in duration-1000">

            {/* ANNOUNCEMENT BANNER */}
            {initialSettings?.active_announcement && (
                <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 rounded-2xl p-[2px] shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-pulse-slow">
                    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 flex items-center justify-center gap-4 text-center">
                        <Megaphone className="w-8 h-8 text-white animate-bounce" />
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">
                            {initialSettings.active_announcement}
                        </h2>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* TIMER SECTION */}
                <div className="lg:col-span-2 space-y-8">
                    <div className={`bg-white/5 border ${cfg.borderColor} rounded-3xl p-8 md:p-12 relative overflow-hidden group transition-colors duration-500`}>
                        {/* Animated background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${cfg.glow} opacity-50 transition-all duration-500`} />

                        {/* Urgency pulse ring for critical/urgent */}
                        {(urgency === 'critical' || urgency === 'urgent') && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className={`absolute inset-4 rounded-3xl border-2 ${urgency === 'critical' ? 'border-red-500/30' : 'border-orange-500/20'} animate-ping`} style={{ animationDuration: urgency === 'critical' ? '1s' : '2s' }} />
                            </div>
                        )}

                        <div className="relative z-10 flex flex-col items-center justify-center text-center">
                            {/* Status Badge */}
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 ${cfg.textColor} font-mono text-sm uppercase tracking-widest mb-6 border border-white/5 transition-colors duration-500`}>
                                <span className={`w-2 h-2 rounded-full ${cfg.dotColor} ${urgency === 'critical' ? 'animate-ping' : 'animate-pulse'}`} />
                                {initialSettings?.is_running ? cfg.label : "Timer Paused or Not Started"}
                                {urgency === 'urgent' && <Flame className="w-4 h-4 animate-pulse" />}
                                {urgency === 'critical' && <AlertTriangle className="w-4 h-4 animate-bounce" />}
                            </div>

                            {/* Timer Digits */}
                            <div className={`flex items-center justify-center gap-4 md:gap-8 font-mono ${urgency === 'critical' ? 'animate-pulse' : ''}`}>
                                <div className="flex flex-col items-center">
                                    <span className={`text-7xl md:text-9xl font-black text-white tracking-tighter ${cfg.timeGlow} transition-all duration-500`}>
                                        {String(timeLeft.hours).padStart(2, '0')}
                                    </span>
                                    <span className="text-gray-500 text-sm md:text-base font-sans uppercase tracking-[0.2em] mt-2">Hours</span>
                                </div>
                                <span className={`text-5xl md:text-7xl font-light text-white/20 -mt-8 ${urgency === 'critical' ? 'animate-pulse text-red-500/40' : ''}`}>:</span>
                                <div className="flex flex-col items-center">
                                    <span className={`text-7xl md:text-9xl font-black text-white tracking-tighter ${cfg.timeGlow} transition-all duration-500`}>
                                        {String(timeLeft.minutes).padStart(2, '0')}
                                    </span>
                                    <span className="text-gray-500 text-sm md:text-base font-sans uppercase tracking-[0.2em] mt-2">Minutes</span>
                                </div>
                                <span className={`text-5xl md:text-7xl font-light text-white/20 -mt-8 ${urgency === 'critical' ? 'animate-pulse text-red-500/40' : ''}`}>:</span>
                                <div className="flex flex-col items-center">
                                    <span className={`text-7xl md:text-9xl font-black ${cfg.secondsColor} tracking-tighter ${cfg.timeGlow} transition-all duration-500`}>
                                        {String(timeLeft.seconds).padStart(2, '0')}
                                    </span>
                                    <span className="text-gray-500 text-sm md:text-base font-sans uppercase tracking-[0.2em] mt-2">Seconds</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {initialSettings?.is_running && (
                                <div className="w-full mt-10 space-y-3">
                                    <div className="flex justify-between text-xs font-mono text-gray-500">
                                        <span>START</span>
                                        <span className={cfg.textColor}>{progressPercent.toFixed(1)}% elapsed</span>
                                        <span>{initialSettings.duration_hours}h END</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden relative">
                                        <div
                                            className={`h-full rounded-full ${cfg.progressColor} ${cfg.progressGlow} transition-all duration-1000 ease-linear`}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                        {/* Moving dot at progress end */}
                                        <div
                                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${cfg.dotColor} border-2 border-black ${cfg.progressGlow} transition-all duration-1000`}
                                            style={{ left: `calc(${progressPercent}% - 8px)` }}
                                        />
                                    </div>

                                    {/* Milestone markers */}
                                    <div className="relative w-full h-6">
                                        {[25, 50, 75].map(pct => (
                                            <div key={pct} className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${pct}%` }}>
                                                <div className={`w-px h-3 ${progressPercent >= pct ? 'bg-white/30' : 'bg-white/10'}`} />
                                                <span className={`text-[10px] font-mono mt-0.5 ${progressPercent >= pct ? 'text-white/40' : 'text-white/15'}`}>{pct}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Motivational messages */}
                            {urgency === 'warning' && (
                                <div className="mt-6 px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium flex items-center gap-2">
                                    <Zap className="w-4 h-4 shrink-0" /> Keep building! You&apos;re past the halfway mark. Focus on polishing your project!
                                </div>
                            )}
                            {urgency === 'urgent' && (
                                <div className="mt-6 px-6 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-bold flex items-center gap-2 animate-pulse">
                                    <Flame className="w-5 h-5 shrink-0" /> Final stretch! Start preparing your demo and presentation NOW!
                                </div>
                            )}
                            {urgency === 'critical' && (
                                <div className="mt-6 px-6 py-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-black text-base flex items-center gap-3 animate-bounce" style={{ animationDuration: '2s' }}>
                                    <AlertTriangle className="w-6 h-6 shrink-0 animate-pulse" /> MINUTES LEFT! Submit your code and prepare your pitch!
                                </div>
                            )}

                            {/* TIME IS UP overlay */}
                            {isFinished && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-3xl">
                                    <h2 className="text-6xl font-black text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-bounce mb-4">
                                        ⏰ TIME IS UP!
                                    </h2>
                                    <p className="text-white/80 text-lg font-medium">Step away from your keyboards!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SHORTLISTED TEAMS (Shows only if there are any) */}
                    {initialShortlisted.length > 0 && (
                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-3xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="w-8 h-8 text-amber-400" />
                                <h3 className="text-2xl font-bold text-white">Shortlisted Teams</h3>
                                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {initialShortlisted.map((team, idx) => (
                                    <div key={team.id} className="bg-black/40 border border-amber-500/30 rounded-xl p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold font-mono">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white">{team.name}</h4>
                                            {team.table_number && <p className="text-sm text-amber-400/80">Table {team.table_number}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* SCHEDULE SECTION */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <Calendar className="w-6 h-6 text-blue-400" />
                            <h3 className="text-xl font-bold text-white tracking-wide">Live Schedule</h3>
                        </div>

                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:w-0.5 before:bg-white/10">
                            {sortedSchedule.map(ev => {
                                const start = new Date(ev.start_time);
                                const end = ev.end_time ? new Date(ev.end_time) : new Date(start.getTime() + 60 * 60 * 1000);
                                const isPast = now > end;
                                const isCurrent = now >= start && now <= end;

                                return (
                                    <div key={ev.id} className={`relative flex items-stretch gap-4 ${isPast ? 'opacity-50' : ''}`}>
                                        <div className="flex flex-col items-center mt-1">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-[3px] border-[#121212] z-10 ${isCurrent ? 'bg-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.5)]' :
                                                isPast ? 'bg-gray-600' : 'bg-blue-500'
                                                }`}>
                                                {isCurrent && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                                            </div>
                                        </div>
                                        <div className={`flex-1 rounded-xl p-4 border ${isCurrent ? 'bg-emerald-500/10 border-emerald-500/20' :
                                            isPast ? 'bg-white/5 border-transparent' : 'bg-black/40 border-white/5 hover:border-white/10 transition-colors'
                                            }`}>
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <h5 className={`font-bold text-lg ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                                                    {ev.title}
                                                </h5>
                                                {isCurrent && <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full shrink-0">Now</span>}
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm font-mono ${isCurrent ? 'text-emerald-300' : 'text-gray-400'}`}>
                                                <Clock className="w-3.5 h-3.5" />
                                                {format(start, "h:mm a")}
                                                {ev.end_time && ` - ${format(new Date(ev.end_time), "h:mm a")}`}
                                            </div>
                                            {ev.description && <p className="text-gray-400 mt-2 text-sm">{ev.description}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                            {sortedSchedule.length === 0 && (
                                <p className="text-gray-500 text-sm ml-8">No events scheduled yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
