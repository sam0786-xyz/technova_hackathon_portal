"use client";

import { useState, useEffect, Fragment } from "react";
import { submitEvaluation, getTeamsForEvaluation, getTeamEvaluations, requestEvaluationEdit } from "@/lib/actions/hackathon";
import { Search, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Cpu, Users, Star, Layers, Mail, Phone, Lock, Filter } from "lucide-react";

const THEMES = [
    { code: 'ALL', label: 'All Themes' },
    { code: 'AIIS', label: 'AIIS' },
    { code: 'WASI', label: 'WASI' },
    { code: 'CSAB', label: 'CSAB' },
    { code: 'DSSA', label: 'DSSA' },
    { code: 'SISI', label: 'SISI' },
    { code: 'SCHI', label: 'SCHI' },
];

const ITEMS_PER_PAGE = 10;

export default function EvaluatorDashboardClient({ initialTeams, evaluationOpen = true, evaluationRounds = 2, evaluatorToken }: { initialTeams: any[], evaluationOpen?: boolean, evaluationRounds?: number, evaluatorToken?: string }) {
    const [round, setRound] = useState<number>(1);
    const [teams, setTeams] = useState<any[]>(initialTeams || []);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTheme, setSelectedTheme] = useState("ALL");
    const [selectedCollege, setSelectedCollege] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
    const [scores, setScores] = useState({ innovation: 3, feasibility: 3, impact: 3, ux: 3, presentation: 3, feedback: "" });
    const [submitting, setSubmitting] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [peerReviews, setPeerReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // Fetch teams when round changes
    useEffect(() => {
        const fetchTeams = async () => {
            setLoadingTeams(true);
            try {
                const fetchedTeams = await getTeamsForEvaluation(round);
                setTeams(fetchedTeams);
                setExpandedTeam(null);
            } catch (error) {
                console.error("Failed to fetch teams:", error);
            } finally {
                setLoadingTeams(false);
            }
        };

        if (round !== 1 || !initialTeams) {
            fetchTeams();
        }
    }, [round, initialTeams]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedTheme, selectedCollege]);

    // Extract theme prefix from a team_code (alphabetic portion only, e.g. "AIIS1000" -> "AIIS")
    const getThemePrefix = (code: string) => (code || '').match(/^[A-Za-z]+/)?.[0]?.toUpperCase() || '';

    // Filter by theme + college + search query (including team_code)
    const filteredTeams = (teams || []).filter(t => {
        const teamTheme = getThemePrefix(t?.team_code || '');
        const matchesTheme = selectedTheme === 'ALL' || teamTheme === selectedTheme;
        
        // College filter: check if any participant in the team belongs to the selected college
        const matchesCollege = selectedCollege === 'ALL' || 
            (t?.hackathon_participants || []).some((p: any) => (p.college || '').toLowerCase() === selectedCollege.toLowerCase());
        
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query ||
            (t?.name || "").toLowerCase().includes(query) ||
            (t?.idea_title || "").toLowerCase().includes(query) ||
            (t?.team_code || "").toLowerCase().includes(query) ||
            (t?.table_number || "").toLowerCase().includes(query);
        return matchesTheme && matchesCollege && matchesSearch;
    }).sort((a, b) => !evaluationOpen ? (b.total_score || 0) - (a.total_score || 0) : 0);

    // Pagination
    const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
    const paginatedTeams = filteredTeams.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Theme counts
    const themeCounts = THEMES.reduce((acc, theme) => {
        if (theme.code === 'ALL') {
            acc[theme.code] = (teams || []).length;
        } else {
            acc[theme.code] = (teams || []).filter(t => getThemePrefix(t?.team_code || '') === theme.code).length;
        }
        return acc;
    }, {} as Record<string, number>);

    // Extract unique colleges
    const uniqueColleges = Array.from(new Set(
        (teams || []).flatMap(t => 
            (t.hackathon_participants || []).map((p: any) => (p.college || '').trim()).filter(Boolean)
        )
    )).sort();

    // Allow free typing: store raw string, validate only on blur
    const handleScoreChange = (field: string, value: string) => {
        // Allow empty string or just a decimal point temporarily
        if (value === "" || value === ".") {
            setScores({ ...scores, [field]: value as any });
            return;
        }

        // Regex to match a number between 0 and 10, with up to one decimal place
        // e.g. "5", "5.", "5.0", "4.9", "10"
        if (/^([0-9](\.[0-9]?)?|10(\.0?)?)$/.test(value)) {
            setScores({ ...scores, [field]: value as any });
        }
    };

    const handleScoreBlur = (field: string) => {
        const raw = (scores as any)[field];
        const num = parseFloat(raw);
        if (isNaN(num) || raw === '' || raw === '.') {
            setScores({ ...scores, [field]: 5 }); // Reset to default
        } else {
            setScores({ ...scores, [field]: Math.round(Math.min(10, Math.max(0, num)) * 10) / 10 });
        }
    };

    const handleExpand = async (teamId: string) => {
        if (expandedTeam === teamId) {
            setExpandedTeam(null);
        } else {
            setExpandedTeam(teamId);
            setScores(prev => ({ ...prev, innovation: 5, feasibility: 5, impact: 5, ux: 5, presentation: 5, feedback: "" }));
            setMessage(null);

            if (!evaluationOpen) {
                setLoadingReviews(true);
                try {
                    const reviews = await getTeamEvaluations(teamId, round);
                    setPeerReviews(reviews);
                } catch (error) {
                    console.error("Failed to load peer reviews:", error);
                } finally {
                    setLoadingReviews(false);
                }
            }
        }
    };

    const handleSubmit = async (teamId: string) => {
        const sumScores = (Number(scores.innovation)*2.5) + (Number(scores.feasibility)*2) + (Number(scores.impact)*2) + (Number(scores.ux)*1.5) + (Number(scores.presentation)*2);
        
        const confirmMsg = `Are you sure you want to submit?\n\nInnovation: ${scores.innovation}/10 (25%)\nFeasibility: ${scores.feasibility}/10 (20%)\nImpact: ${scores.impact}/10 (20%)\nUX: ${scores.ux}/10 (15%)\nPresentation: ${scores.presentation}/10 (20%)\n\nFinal Score: ${sumScores.toFixed(1)} / 100`;
        if (!window.confirm(confirmMsg)) return;

        setSubmitting(true);
        setMessage(null);

        try {
            const res = await submitEvaluation(teamId, round, scores, evaluatorToken);
            if (res.error) {
                setMessage({ type: 'error', text: res.error });
            } else {
                setMessage({ type: 'success', text: "Evaluation submitted successfully!" });
                const sumScores = (Number(scores.innovation)*2.5) + (Number(scores.feasibility)*2) + (Number(scores.impact)*2) + (Number(scores.ux)*1.5) + (Number(scores.presentation)*2);
                setTeams(teams.map(t => t.id === teamId ? { ...t, has_evaluated: true, my_score: sumScores } : t));
                setTimeout(() => setExpandedTeam(null), 2000);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: "Failed to submit evaluation." });
        } finally {
            setSubmitting(false);
        }
    };

    // Render a score input field inline (NOT as a sub-component to avoid focus loss)
    const renderScoreInput = (label: string, field: string, description: string) => (
        <div key={field} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
                {label}
                <span className="text-amber-400 font-bold text-lg">{(scores as any)[field]}/10</span>
            </label>
            <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                inputMode="decimal"
                value={(scores as any)[field]}
                onChange={(e) => handleScoreChange(field, e.target.value)}
                onBlur={() => handleScoreBlur(field)}
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-center text-white text-lg font-bold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                placeholder="0.0 - 10.0"
            />
            <p className="text-xs text-gray-500 mt-2">{description}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Round Selector */}
            <div className={`flex bg-white/5 border border-white/10 rounded-xl p-1 w-full flex-wrap md:flex-nowrap mx-auto mb-8`}>
                {Array.from({ length: evaluationRounds }, (_, i) => i + 1).map((r) => (
                    <button
                        key={r}
                        onClick={() => setRound(r)}
                        className={`flex-1 min-w-[120px] md:px-8 py-2.5 rounded-lg text-sm font-medium transition-all ${round === r ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Round {r}
                    </button>
                ))}
            </div>

            {/* Theme Filter Pills */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
                {THEMES.map(theme => (
                    <button
                        key={theme.code}
                        onClick={() => setSelectedTheme(theme.code)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${selectedTheme === theme.code
                            ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {theme.label}
                        <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${selectedTheme === theme.code ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-500'
                            }`}>
                            {themeCounts[theme.code] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* College Filter */}
            {uniqueColleges.length > 0 && (
                <div className="flex justify-center mb-4">
                    <select
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 appearance-none cursor-pointer min-w-[200px]"
                    >
                        <option value="ALL">All Colleges</option>
                        {uniqueColleges.map(college => (
                            <option key={college} value={college}>{college}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Search + Stats */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by team name, ID, or project..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 text-white transition-colors"
                    />
                </div>
                <div className="flex gap-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-gray-400">To Evaluate ({filteredTeams.filter(t => !t.has_evaluated).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-gray-400">Completed ({filteredTeams.filter(t => t.has_evaluated).length})</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {loadingTeams ? (
                    <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
                        Loading teams for Round {round}...
                    </div>
                ) : filteredTeams.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                        No teams found{selectedTheme !== 'ALL' ? ` for theme ${selectedTheme}` : ''}{searchQuery ? ` matching "${searchQuery}"` : ''}.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 shadow-2xl">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-400 uppercase bg-black/40 border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-5 font-semibold">S.No</th>
                                        <th className="px-4 py-5 font-semibold">Team ID</th>
                                        <th className="px-4 py-5 font-semibold">Team Name</th>
                                        <th className="px-4 py-5 font-semibold">Project Title</th>
                                        <th className="px-4 py-5 font-semibold">Team Lead</th>
                                        <th className="px-4 py-5 font-semibold w-64">Project Objective (Short Synopsis)</th>
                                        <th className="px-4 py-5 font-semibold">Mobile Number</th>
                                        <th className="px-4 py-5 font-semibold">Email</th>
                                        <th className="px-4 py-5 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTeams.map((team, index) => {
                                        const leader = team.hackathon_participants?.find((p: any) => p.role?.toLowerCase() === 'leader') || team.hackathon_participants?.[0] || {};
                                        const isExpanded = expandedTeam === team.id;
                                        const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                                        return (
                                            <Fragment key={team.id}>
                                                <tr
                                                    onClick={() => handleExpand(team.id)}
                                                    className={`border-b border-white/5 cursor-pointer transition-all ${team.has_evaluated ? 'bg-emerald-500/5 hover:bg-emerald-500/10' :
                                                        isExpanded ? 'bg-amber-500/10 hover:bg-amber-500/20' :
                                                            'hover:bg-white/10'
                                                        }`}
                                                >
                                                    <td className="px-4 py-4 whitespace-nowrap">{globalIndex}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap font-mono text-amber-400 bg-amber-500/10 font-bold rounded m-2 table-cell border-y-8 border-transparent bg-clip-padding">{team.team_code || '---'}</td>
                                                    <td className="px-4 py-4 font-bold text-white whitespace-nowrap">{team.name}</td>
                                                    <td className="px-4 py-4 font-medium text-emerald-400">{team.idea_title}</td>
                                                    <td className="px-4 py-4 text-purple-400 whitespace-nowrap"><span className="flex items-center gap-2"><Users className="w-4 h-4" />{leader.name || '---'}</span></td>
                                                    <td className="px-4 py-4 max-w-xs truncate" title={team.project_objective}>{team.project_objective || 'No objective provided.'}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap"><div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{leader.phone || '---'}</div></td>
                                                    <td className="px-4 py-4 whitespace-nowrap"><div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{leader.email || '---'}</div></td>
                                                    <td className="px-4 py-4 text-right whitespace-nowrap">
                                                        {!evaluationOpen ? (
                                                            <span className="text-gray-400 font-bold flex items-center justify-end gap-1.5"><Lock className="w-4 h-4" /> Final: {team.total_score || 0}</span>
                                                        ) : team.has_evaluated ? (
                                                            <span className="text-emerald-400 font-bold flex items-center justify-end gap-1.5"><CheckCircle className="w-4 h-4" /> {team.my_score}/100</span>
                                                        ) : (
                                                            <span className="text-amber-500 font-semibold flex items-center justify-end gap-1 hover:text-amber-400">Evaluate <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Evaluation Closed / Peer Reviews State */}
                                                {isExpanded && !evaluationOpen && (
                                                    <tr>
                                                        <td colSpan={9} className="p-0 border-b border-gray-500/20 shadow-inner">
                                                            <div className="p-6 md:p-8 bg-black/40">
                                                                <div className="mb-6 bg-red-500/10 border border-red-500/20 p-5 rounded-2xl shadow-lg flex items-start gap-4 text-red-400">
                                                                    <Lock className="w-6 h-6 flex-shrink-0" />
                                                                    <div>
                                                                        <h4 className="font-bold mb-1">Evaluation Period Closed</h4>
                                                                        <p className="text-sm">You can no longer submit scores for <strong className="text-white">{team.name}</strong>. Below are the final peer reviews from all evaluators.</p>
                                                                    </div>
                                                                </div>

                                                                {loadingReviews ? (
                                                                    <div className="text-center py-8">
                                                                        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
                                                                        <p className="text-gray-400 text-sm">Loading peer reviews...</p>
                                                                    </div>
                                                                ) : peerReviews.length === 0 ? (
                                                                    <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                                                        <p className="text-gray-500 text-sm italic">No evaluations were submitted for this team.</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-4">
                                                                        {peerReviews.map((rev: any) => (
                                                                            <div key={rev.id} className="bg-white/5 border border-white/10 rounded-xl p-5 shadow">
                                                                                <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                                                                                    <div>
                                                                                        <h5 className="font-bold text-white text-lg">{rev.hackathon_evaluators?.name || 'Unknown Evaluator'}</h5>
                                                                                        <p className="text-xs text-gray-500">{new Date(rev.created_at).toLocaleString()}</p>
                                                                                    </div>
                                                                                    <div className="flex flex-col items-end">
                                                                                        <div className="text-2xl font-black text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-xl border border-amber-500/20">
                                                                                            {rev.total_score}<span className="text-sm text-amber-500/50">/100</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 text-xs font-mono text-center">
                                                                                    <div className="bg-black/30 p-2 rounded border border-white/5"><span className="block text-gray-500 mb-1">INNOV</span><span className="text-emerald-400 font-bold text-base">{rev.score_innovation}</span><span className="text-gray-600">/5</span></div>
                                                                                    <div className="bg-black/30 p-2 rounded border border-white/5"><span className="block text-gray-500 mb-1">FEAS</span><span className="text-emerald-400 font-bold text-base">{rev.score_feasibility}</span><span className="text-gray-600">/5</span></div>
                                                                                    <div className="bg-black/30 p-2 rounded border border-white/5"><span className="block text-gray-500 mb-1">IMPACT</span><span className="text-emerald-400 font-bold text-base">{rev.score_impact}</span><span className="text-gray-600">/5</span></div>
                                                                                    <div className="bg-black/30 p-2 rounded border border-white/5"><span className="block text-gray-500 mb-1">UX</span><span className="text-emerald-400 font-bold text-base">{rev.score_ux}</span><span className="text-gray-600">/5</span></div>
                                                                                    <div className="bg-black/30 p-2 rounded border border-white/5"><span className="block text-gray-500 mb-1">PRES</span><span className="text-emerald-400 font-bold text-base">{rev.score_presentation}</span><span className="text-gray-600">/5</span></div>
                                                                                </div>
                                                                                {rev.feedback && (
                                                                                    <div className="bg-black/30 rounded-lg p-4 text-sm text-gray-300 border-l-2 border-emerald-500">
                                                                                        <strong className="text-xs text-emerald-500/70 block mb-1 uppercase tracking-wider">Reviewer Feedback</strong>
                                                                                        {rev.feedback}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}

                                                {/* Evaluation Form (Expanded, Open State) */}
                                                {isExpanded && evaluationOpen && !team.has_evaluated && (
                                                    <tr>
                                                        <td colSpan={9} className="p-0 border-b border-amber-500/20 shadow-inner">
                                                            <div className="p-6 md:p-8 bg-black/40">

                                                                {/* Project Objective Full Detail */}
                                                                <div className="mb-6 bg-white/5 border border-white/10 p-5 rounded-2xl shadow-lg">
                                                                    <h4 className="text-emerald-400 text-sm font-bold mb-3 flex items-center gap-2 uppercase tracking-wide"><Cpu className="w-4 h-4" /> Project Objective & Synopsis</h4>
                                                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{team.project_objective || 'No detailed objective provided by the team.'}</p>
                                                                </div>

                                                                <div className="mb-8 text-sm text-gray-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col items-start gap-4 shadow-lg">
                                                                    <div className="flex items-start gap-4">
                                                                        <Star className="w-6 h-6 text-amber-500 flex-shrink-0 animate-pulse mt-0.5" />
                                                                        <p>You are evaluating <strong className="text-amber-400 text-lg">{team.name}</strong>. Enter scores from <strong className="text-white">1.0 to 5.0</strong> for each category. This cannot be undone once submitted.</p>
                                                                    </div>
                                                                </div>

                                                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                                                    {renderScoreInput("Innovation", "innovation", "Uniqueness, novelty, and creative approach. (25%)")}
                                                                    {renderScoreInput("Feasibility", "feasibility", "Technical viability and implementation plan. (20%)")}
                                                                    {renderScoreInput("Impact", "impact", "Potential reach and tangible benefits. (20%)")}
                                                                    {renderScoreInput("User Experience (UX)", "ux", "Design, ease of use, and overall UI. (15%)")}
                                                                    {renderScoreInput("Presentation", "presentation", "Clarity, pitch delivery, and communication. (20%)")}
                                                                </div>

                                                                <div className="space-y-3 mb-6">
                                                                    <label className="text-sm font-medium text-gray-300">General Feedback (Optional)</label>
                                                                    <textarea
                                                                        value={scores.feedback}
                                                                        onChange={(e) => setScores({ ...scores, feedback: e.target.value })}
                                                                        placeholder="Leave a note about what you liked or what could be improved..."
                                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-amber-500 text-white resize-none h-24"
                                                                    />
                                                                </div>

                                                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                                    <div className="text-2xl font-black text-white">
                                                                        Total: <span className="text-amber-500">{((Number(scores.innovation)*5) + (Number(scores.feasibility)*4) + (Number(scores.impact)*4) + (Number(scores.ux)*3) + (Number(scores.presentation)*4)).toFixed(1)}</span><span className="text-gray-500 text-lg">/100</span>
                                                                    </div>

                                                                    <button
                                                                        onClick={() => handleSubmit(team.id)}
                                                                        disabled={submitting}
                                                                        className="bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                                                                    >
                                                                        {submitting ? (
                                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                        ) : (
                                                                            <Star className="w-4 h-4 fill-current" />
                                                                        )}
                                                                        {submitting ? "Submitting..." : "Submit Score"}
                                                                    </button>
                                                                </div>

                                                                {message && (
                                                                    <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${message.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                                                                        {message.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                                                                        <p className="text-sm">{message.text}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}

                                                {/* Already Evaluated State (Open State) */}
                                                {isExpanded && evaluationOpen && team.has_evaluated && (
                                                    <tr>
                                                        <td colSpan={9} className="p-0 border-b border-emerald-500/20 shadow-inner">
                                                            <div className="p-8 bg-black/40 text-center">
                                                                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                                                <h4 className="text-lg font-bold text-white mb-1">Evaluation Submitted</h4>
                                                                <p className="text-gray-400 mb-6">You gave this team a total score of <span className="text-emerald-400 font-bold">{team.my_score}</span>. Thank you for your review.</p>
                                                                
                                                                {team.edit_requested ? (
                                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-lg text-sm font-medium border border-amber-500/20">
                                                                        <AlertCircle className="w-4 h-4" /> Edit Request Pending Approval
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!window.confirm("Are you sure you want to request an edit to your score? An admin will need to approve this request.")) return;
                                                                            setSubmitting(true);
                                                                            const res = await requestEvaluationEdit(team.id, round, evaluatorToken);
                                                                            if (res.success) {
                                                                                setTeams(teams.map(t => t.id === team.id ? { ...t, edit_requested: true } : t));
                                                                            } else {
                                                                                setMessage({ type: 'error', text: res.error || "Failed to request edit" });
                                                                            }
                                                                            setSubmitting(false);
                                                                        }}
                                                                        disabled={submitting}
                                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
                                                                    >
                                                                        <Lock className="w-4 h-4" /> Request Score Edit
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4">
                                <p className="text-sm text-gray-500">
                                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredTeams.length)} of {filteredTeams.length} teams
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${currentPage === page
                                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
