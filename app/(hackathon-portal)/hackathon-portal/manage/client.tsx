"use client";

import { useState, useRef, useEffect } from "react";
import {
    uploadHackathonData, getHackathonTeams, deleteAllHackathonTeams,
    getEvaluators, addEvaluator, removeEvaluator,
    getHackathonSettings, startTimer, stopTimer, pushAnnouncement, clearAnnouncement,
    getSchedule, addScheduleItem, deleteScheduleItem, updateTeamStatus, toggleEvaluationPeriod,
    getCheckedInParticipantsData, getFoodLogsData,
    getVolunteers, addVolunteer, removeVolunteer, uploadVolunteersData,
    addHackathonTeamManually, updateHackathonTeamDetails, updateCustomMeals,
    updateEvaluationRounds, emailShortlistedTeams, blastCustomEmail,
    getHackathonRoles, addHackathonRole, removeHackathonRole, approveScoreEdit, sendEvaluatorInvite
} from "@/lib/actions/hackathon";
import { Upload, FileDown, CheckCircle, AlertCircle, Users, Cpu, Clock, Calendar, Trash2, QrCode, StopCircle, X, Mail, Star, Download, UserCheck, Plus, ChevronLeft, ChevronRight, Edit, Shield, Utensils, Settings, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import EvaluatorDashboardClient from "@/app/(admin)/admin/hackathon/evaluate/client";

const ITEMS_PER_PAGE = 10;

export default function HackathonManageClient() {
    const [currentPage, setCurrentPage] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [teams, setTeams] = useState<any[]>([]);
    const [evaluators, setEvaluators] = useState<any[]>([]);
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [evaluationRounds, setEvaluationRounds] = useState(2);
    const [searchQuery, setSearchQuery] = useState("");
    const [sendingEmails, setSendingEmails] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState("ALL");
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [evalEmail, setEvalEmail] = useState("");
    const [volEmail, setVolEmail] = useState("");
    const [volName, setVolName] = useState("");
    const [volTeam, setVolTeam] = useState("Registration & Stage Team");
    const [volShift, setVolShift] = useState("Whole Day");
    const [roleEmail, setRoleEmail] = useState("");
    const [roleType, setRoleType] = useState("admin");
    const [announcement, setAnnouncement] = useState("");
    const [sendingQr, setSendingQr] = useState(false);
    const [deletingTeams, setDeletingTeams] = useState(false);
    const [showManualAdd, setShowManualAdd] = useState(false);
    const [addingManualMode, setAddingManualMode] = useState(false);
    
    // Custom Email Blast states
    const [customEmailSubject, setCustomEmailSubject] = useState("");
    const [customEmailBody, setCustomEmailBody] = useState("");
    const [customEmailTarget, setCustomEmailTarget] = useState<'all' | 'shortlisted'>('all');
    const [blastingEmail, setBlastingEmail] = useState(false);

    // Team Edit states
    const [editingTeam, setEditingTeam] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({
        teamName: '',
        ideaTitle: '',
        teamCode: '',
        theme: '',
        projectObjective: '',
        leader: { id: '', name: '', email: '', phone: '', course: '', section: '', system_id: '', year: '', college: '' },
        members: [{ id: '', name: '', email: '', phone: '', course: '', section: '', system_id: '', year: '', college: '' }, { id: '', name: '', email: '', phone: '', course: '', section: '', system_id: '', year: '', college: '' }, { id: '', name: '', email: '', phone: '', course: '', section: '', system_id: '', year: '', college: '' }, { id: '', name: '', email: '', phone: '', course: '', section: '', system_id: '', year: '', college: '' }]
    });

    const [customMeals, setCustomMeals] = useState<string[]>(["Breakfast - Day 1", "Lunch - Day 1", "Snacks - Day 1", "Dinner - Day 1", "Breakfast - Day 2", "Lunch - Day 2"]);
    const [newMeal, setNewMeal] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [teamsData, evaluatorsData, volunteersData, settingsData, scheduleData, rolesData] = await Promise.all([
            getHackathonTeams(),
            getEvaluators(),
            getVolunteers(),
            getHackathonSettings(),
            getSchedule(),
            getHackathonRoles()
        ]);
        setTeams(teamsData);
        setEvaluators(evaluatorsData);
        setVolunteers(volunteersData);
        setSettings(settingsData);
        setSchedule(scheduleData);
        setRoles(rolesData);
        if (settingsData?.custom_meals && Array.isArray(settingsData.custom_meals)) {
            setCustomMeals(settingsData.custom_meals);
        }
        setLoading(false);
    }

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        setUploading(true);

        const formData = new FormData(e.currentTarget);
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            setMessage({ type: 'error', text: 'Please select a valid CSV or XLSX file.' });
            setUploading(false);
            return;
        }

        try {
            const result = await uploadHackathonData(formData);
            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: result.message || 'Upload successful!' });
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                loadData();
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'An unexpected error occurred.' });
        } finally {
            setUploading(false);
        }
    };

    const handleAddManualTeam = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAddingManualMode(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);

        const data = {
            teamName: formData.get('teamName') as string,
            ideaTitle: formData.get('ideaTitle') as string,
            teamCode: formData.get('teamCode') as string,
            theme: formData.get('theme') as string,
            leader: {
                name: formData.get('leaderName') as string,
                email: formData.get('leaderEmail') as string,
                phone: formData.get('leaderPhone') as string,
                course: formData.get('leaderCourse') as string,
                section: formData.get('leaderSection') as string,
                system_id: formData.get('leaderSystemId') as string,
                year: formData.get('leaderYear') as string,
                college: formData.get('leaderCollege') as string
            },
            members: [
                { 
                    name: formData.get('m1Name') as string, email: formData.get('m1Email') as string, phone: formData.get('m1Phone') as string,
                    course: formData.get('m1Course') as string, section: formData.get('m1Section') as string, system_id: formData.get('m1SystemId') as string, year: formData.get('m1Year') as string, college: formData.get('m1College') as string 
                },
                { 
                    name: formData.get('m2Name') as string, email: formData.get('m2Email') as string, phone: formData.get('m2Phone') as string,
                    course: formData.get('m2Course') as string, section: formData.get('m2Section') as string, system_id: formData.get('m2SystemId') as string, year: formData.get('m2Year') as string, college: formData.get('m2College') as string 
                },
                { 
                    name: formData.get('m3Name') as string, email: formData.get('m3Email') as string, phone: formData.get('m3Phone') as string,
                    course: formData.get('m3Course') as string, section: formData.get('m3Section') as string, system_id: formData.get('m3SystemId') as string, year: formData.get('m3Year') as string, college: formData.get('m3College') as string 
                },
                { 
                    name: formData.get('m4Name') as string, email: formData.get('m4Email') as string, phone: formData.get('m4Phone') as string,
                    course: formData.get('m4Course') as string, section: formData.get('m4Section') as string, system_id: formData.get('m4SystemId') as string, year: formData.get('m4Year') as string, college: formData.get('m4College') as string 
                },
            ].filter(m => m.name && m.name.trim() !== '')
        };

        const res = await addHackathonTeamManually(data);
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: "Team added manually!" });
            setShowManualAdd(false);
            loadData();
        }
        setAddingManualMode(false);
    };

    async function handleUpdateTeam(e: React.FormEvent) {
        e.preventDefault();
        if (!editingTeam) return;

        setMessage(null);
        try {
            const res = await updateHackathonTeamDetails(editingTeam.id, editFormData);
            if (res.error) {
                setMessage({ type: 'error', text: res.error });
            } else {
                setMessage({ type: 'success', text: "Team updated successfully." });
                setEditingTeam(null);
                loadData();
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Failed to update team." });
        }
    }

    const handleSaveMeals = async () => {
        setMessage(null);
        try {
            const res = await updateCustomMeals(customMeals);
            if (res.error) setMessage({ type: 'error', text: res.error });
            else setMessage({ type: 'success', text: "Meal rounds updated successfully." });
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message || "Failed to save meal rounds." });
        }
    };

    const handleDeleteAllTeams = async () => {
        if (!confirm("🚨 WARNING 🚨\n\nThis will permanently delete ALL teams, evaluations, and participants from this hackathon. This cannot be undone.\n\nAre you absolutely sure you want to proceed?")) return;

        setDeletingTeams(true);
        setMessage(null);

        try {
            const res = await deleteAllHackathonTeams();
            if (res.error) {
                setMessage({ type: 'error', text: res.error });
            } else {
                setMessage({ type: 'success', text: "All teams have been successfully cleared." });
                loadData();
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Failed to delete teams." });
        } finally {
            setDeletingTeams(false);
        }
    };

    const handleAddEvaluator = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!evalEmail) return;

        const res = await addEvaluator(evalEmail);
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setEvalEmail("");
            setMessage({ type: 'success', text: "Evaluator added successfully." });
            loadData();
        }
    };

    const handleRemoveEvaluator = async (id: string) => {
        await removeEvaluator(id);
        loadData();
    };

    const handleSendEvaluatorInvite = async (evalId?: string) => {
        setSendingEmails(true);
        setMessage(null);
        try {
            const res = await sendEvaluatorInvite(evalId);
            if (!res.success) throw new Error(res.error || 'Failed to send invite(s)');
            setMessage({ type: 'success', text: res.message || 'Invitation(s) sent successfully' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        }
        setSendingEmails(false);
    };

    const handleStartTimer = async () => {
        if (!confirm("Are you sure you want to start the 24-hour timer? This will be visible on the public dashboard.")) return;
        const res = await startTimer(24);
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: "Timer started successfully!" });
            loadData();
        }
    };

    const handleStopTimer = async () => {
        if (!confirm("Are you sure you want to stop the timer?")) return;
        const res = await stopTimer();
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: "Timer stopped." });
            loadData();
        }
    };

    const handleClearAnnouncement = async () => {
        const res = await clearAnnouncement();
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: "Announcement cleared." });
            loadData();
        }
    };

    const handleDeleteScheduleItem = async (id: string) => {
        if (!confirm("Delete this schedule item?")) return;
        const res = await deleteScheduleItem(id);
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: "Schedule item deleted." });
            loadData();
        }
    };

    const handlePushAnnouncement = async () => {
        if (!announcement) return;
        const res = await pushAnnouncement(announcement);
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: "Announcement pushed to live dashboard." });
            setAnnouncement("");
            loadData();
        }
    };

    const handleToggleEvaluationPeriod = async () => {
        const newState = !settings?.evaluation_open;
        if (!confirm(`Are you sure you want to ${newState ? 'OPEN' : 'CLOSE'} the evaluation period?`)) return;

        const res = await toggleEvaluationPeriod(newState);
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: `Evaluation period ${newState ? 'OPENED' : 'CLOSED'}.` });
            loadData();
        }
    };

    const handleAddSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            start_time: new Date(formData.get('start_time') as string).toISOString(),
            end_time: formData.get('end_time') ? new Date(formData.get('end_time') as string).toISOString() : undefined,
            event_type: formData.get('event_type') as string,
        };

        const res = await addScheduleItem(data);
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: "Schedule item added." });
            (e.target as HTMLFormElement).reset();
            loadData();
        }
    }
    const handleToggleShortlist = async (teamId: string, currentStatus: string) => {
        const newStatus = (currentStatus === 'shortlisted' || currentStatus === 'shortlisted_notified') ? 'evaluating' : 'shortlisted';
        const res = await updateTeamStatus(teamId, newStatus);
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            loadData();
        }
    };

    const downloadCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) {
            setMessage({ type: 'error', text: 'No data to download.' });
            return;
        }
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    const handleDownloadCheckIn = async () => {
        const result = await getCheckedInParticipantsData();
        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            downloadCSV(result.data, `checkin_data_${new Date().toISOString().split('T')[0]}.csv`);
        }
    };

    const handleDownloadFoodLogs = async () => {
        const result = await getFoodLogsData();
        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            downloadCSV(result.data, `food_logs_${new Date().toISOString().split('T')[0]}.csv`);
        }
    };

    const handleDownloadVolunteers = () => {
        if (!volunteers || volunteers.length === 0) {
            setMessage({ type: 'error', text: 'No volunteers to download.' });
            return;
        }
        
        const exportData = volunteers.map((v: any) => ({
            'Name': v.name,
            'Email': v.email,
            'Role Team': v.team_name,
            'Shift': v.shift || '',
            'Checked In': v.is_checked_in ? 'Yes' : 'No',
            'Check-in Time': v.check_in_time ? new Date(v.check_in_time).toLocaleString() : '',
            'Meals Scanned': v.food_count || 0,
        }));
        
        downloadCSV(exportData, `volunteers_${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                        Hackathon Management
                    </h1>
                    <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">Manage teams, evaluators, logistics, and the 24hr live timer.</p>
                </div>

                <div className="flex gap-3 flex-wrap">
                    <Link
                        href="/hackathon-portal/scan"
                        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium transition-colors w-fit shadow-xl text-sm md:text-base"
                    >
                        <QrCode className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" /> Logistics Scanner
                    </Link>
                    <button
                        onClick={handleDownloadCheckIn}
                        className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 text-blue-400 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                    >
                        <Download className="w-4 h-4" /> Check-in Data
                    </button>
                    <button
                        onClick={handleDownloadFoodLogs}
                        className="flex items-center gap-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/20 text-orange-400 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                    >
                        <Download className="w-4 h-4" /> Food Logs
                    </button>
                </div>
            </div>

            <Tabs defaultValue="teams" className="w-full">
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${message.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                        {message.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                        <p className="text-sm">{message.text}</p>
                    </div>
                )}
                <TabsList className="bg-white/[0.03] border border-white/10 p-1 rounded-xl mb-6 md:mb-8 flex overflow-x-auto h-auto gap-1 md:gap-2">
                    <TabsTrigger value="teams" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 rounded-lg px-3 md:px-6 py-2 md:py-2.5 text-xs md:text-base whitespace-nowrap">
                        <Users className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Teams & Import
                    </TabsTrigger>
                    <TabsTrigger value="evaluators" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 rounded-lg px-3 md:px-6 py-2 md:py-2.5 text-xs md:text-base whitespace-nowrap">
                        <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Evaluators & Grading
                    </TabsTrigger>
                    <TabsTrigger value="volunteers" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 rounded-lg px-3 md:px-6 py-2 md:py-2.5 text-xs md:text-base whitespace-nowrap">
                        <UserCheck className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Volunteers
                    </TabsTrigger>
                    <TabsTrigger value="timer" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 rounded-lg px-3 md:px-6 py-2 md:py-2.5 text-xs md:text-base whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Timer & Live
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 rounded-lg px-3 md:px-6 py-2 md:py-2.5 text-xs md:text-base whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Schedule
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 rounded-lg px-3 md:px-6 py-2 md:py-2.5 text-xs md:text-base whitespace-nowrap">
                        <Settings className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Settings
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400 rounded-lg px-3 md:px-6 py-2 md:py-2.5 text-xs md:text-base whitespace-nowrap">
                        <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Roles
                    </TabsTrigger>
                </TabsList>

                {/* Teams & Import Tab */}
                <TabsContent value="teams" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Upload Section */}
                        <div className="lg:col-span-1 border border-zinc-800 bg-zinc-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-xl h-fit w-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-semibold text-white">Import Data</h2>
                            </div>

                            <p className="text-sm text-gray-400 mb-6">
                                Upload an Excel (.xlsx) or CSV file downloaded from Google Forms. Ensure columns include 'Team Name', 'Idea', 'Leader Name', 'Leader Email', etc.
                            </p>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="w-full overflow-hidden">
                                    <input
                                        type="file"
                                        name="file"
                                        accept=".csv, .xlsx"
                                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-white/10 file:bg-white/5 file:text-white file:font-semibold hover:file:bg-white/10 cursor-pointer"
                                        ref={fileInputRef}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={uploading || deletingTeams}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Importing...
                                        </>
                                    ) : (
                                        "Upload & Sync Teams"
                                    )}
                                </button>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => window.open('/api/admin/hackathon-template', '_blank')}
                                        className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-medium py-2 rounded-xl transition-all text-sm flex justify-center items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Download Template
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowManualAdd(true)}
                                        className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 font-medium py-2 rounded-xl transition-all text-sm flex justify-center items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Add Manually
                                    </button>
                                </div>

                                {teams.length > 0 && (
                                    <div className="pt-4 border-t border-white/10 mt-4">
                                        <button
                                            type="button"
                                            onClick={handleDeleteAllTeams}
                                            disabled={uploading || deletingTeams}
                                            className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-500 font-medium py-2 text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                        >
                                            {deletingTeams ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                                    Deleting All Teams...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4" /> Clear All Teams Data
                                                </>
                                            )}
                                        </button>
                                        <p className="text-xs text-center text-red-400 mt-2">Danger: Deletes all teams & scores.</p>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Teams List */}
                        <div className="lg:col-span-2 border border-zinc-800 bg-zinc-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white">Registered Teams</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-sm font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                        {teams.length} Teams
                                    </div>
                                    {teams.length > 0 && (
                                        <button
                                            onClick={async () => {
                                                if (!confirm(`This will email QR codes to ALL participants across ${teams.length} teams. Continue?`)) return;
                                                setSendingQr(true);
                                                setMessage(null);
                                                try {
                                                    const res = await fetch('/api/admin/hackathon-qr-emails', { method: 'POST' });
                                                    const data = await res.json();
                                                    if (data.error) {
                                                        setMessage({ type: 'error', text: data.error });
                                                    } else {
                                                        setMessage({ type: 'success', text: `QR codes emailed! ${data.sent} sent, ${data.failed} failed.` });
                                                    }
                                                } catch (err: any) {
                                                    setMessage({ type: 'error', text: err.message || 'Failed to send QR emails.' });
                                                } finally {
                                                    setSendingQr(false);
                                                }
                                            }}
                                            disabled={sendingQr}
                                            className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {sendingQr ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Mail className="w-3.5 h-3.5" /> Email QR Codes
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-gray-400">Loading teams...</p>
                                    </div>
                                ) : teams.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                                        <FileDown className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                                        <p className="text-gray-400">No teams found. Import a file to get started.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="flex flex-col gap-6">
                                            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
                                                <Users className="w-12 h-12 text-gray-500 mb-4 opacity-50" />
                                                <p className="text-gray-400 text-sm max-w-sm">
                                                    Team Details are now managed securely inside the <strong className="text-white">Evaluators & Grading</strong> tab. Here is the imported overview:
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center text-center">
                                                    <h3 className="text-3xl font-bold text-blue-400 mb-2">{teams.length}</h3>
                                                    <p className="text-xs font-semibold text-blue-400/80 uppercase tracking-wide">Total Teams</p>
                                                </div>
                                                <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-center">
                                                    <h3 className="text-3xl font-bold text-amber-400 mb-2">{teams.filter(t => t.status === 'pending').length}</h3>
                                                    <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-wide">Pending</p>
                                                </div>
                                                <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center text-center">
                                                    <h3 className="text-3xl font-bold text-purple-400 mb-2">{teams.filter(t => t.status === 'evaluating').length}</h3>
                                                    <p className="text-xs font-semibold text-purple-400/80 uppercase tracking-wide">Evaluating</p>
                                                </div>
                                                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                                                    <h3 className="text-3xl font-bold text-emerald-400 mb-2">{teams.filter(t => t.status === 'shortlisted').length}</h3>
                                                    <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wide">Shortlisted</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Final Evaluation Results Table */}
                                        <div className="mt-8">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                    <Star className="w-5 h-5 text-amber-500" />
                                                    Final Evaluation Results
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                                    <div className="text-sm text-gray-400 hidden md:block">
                                                        Sorted by Highest Score · {teams.filter(t => t.status === 'shortlisted' || t.status === 'shortlisted_notified').length} shortlisted
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => {
                                                            const shortlistedTeams = teams.filter(t => t.status === 'shortlisted' || t.status === 'shortlisted_notified')
                                                                .sort((a, b) => {
                                                                    const getAvg = (t: any) => {
                                                                        const evals = t.hackathon_evaluations || [];
                                                                        const r1 = evals.filter((e: any) => e.round === 1);
                                                                        const r2 = evals.filter((e: any) => e.round === 2);
                                                                        const r1Avg = r1.length > 0 ? r1.reduce((sum: number, e: any) => sum + Number(e.total_score), 0) / r1.length : 0;
                                                                        const r2Avg = r2.length > 0 ? r2.reduce((sum: number, e: any) => sum + Number(e.total_score), 0) / r2.length : 0;
                                                                        return r1Avg + r2Avg;
                                                                    }
                                                                    return getAvg(b) - getAvg(a);
                                                                });

                                                            if (shortlistedTeams.length === 0) {
                                                                setMessage({ type: 'error', text: 'No shortlisted teams to download.' });
                                                                return;
                                                            }

                                                            // Generate CSV Content
                                                            const headers = ['Rank', 'Team Code', 'Team Name', 'Project Title', 'Final Score', 'Leader Name', 'Leader Email', 'Leader Phone', 'Status'];
                                                            const csvRows = [headers.join(',')];

                                                            let rank = 1;
                                                            shortlistedTeams.forEach(team => {
                                                                const leader = team.hackathon_participants?.find((p: any) => p.role?.toLowerCase() === 'leader') || team.hackathon_participants?.[0] || {};
                                                                const evals = team.hackathon_evaluations || [];
                                                                const r1 = evals.filter((e: any) => e.round === 1);
                                                                const r2 = evals.filter((e: any) => e.round === 2);
                                                                const r1Avg = r1.length > 0 ? r1.reduce((sum: number, e: any) => sum + Number(e.total_score), 0) / r1.length : 0;
                                                                const r2Avg = r2.length > 0 ? r2.reduce((sum: number, e: any) => sum + Number(e.total_score), 0) / r2.length : 0;
                                                                const finalScore = r1Avg + r2Avg;

                                                                const row = [
                                                                    rank++,
                                                                    `"${team.team_code || ''}"`,
                                                                    `"${team.name || ''}"`,
                                                                    `"${(team.idea_title || '').replace(/"/g, '""')}"`,
                                                                    finalScore.toFixed(2),
                                                                    `"${leader.name || ''}"`,
                                                                    `"${leader.email || ''}"`,
                                                                    `"${leader.phone || ''}"`,
                                                                    team.status
                                                                ];
                                                                csvRows.push(row.join(','));
                                                            });

                                                            const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
                                                            const encodedUri = encodeURI(csvContent);
                                                            const link = document.createElement("a");
                                                            link.setAttribute("href", encodedUri);
                                                            link.setAttribute("download", `shortlisted_teams_${new Date().toISOString().split('T')[0]}.csv`);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                        }}
                                                        disabled={teams.filter(t => t.status === 'shortlisted' || t.status === 'shortlisted_notified').length === 0}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-40 border border-white/10"
                                                    >
                                                        <FileDown className="w-3.5 h-3.5" />
                                                        Export CSV
                                                    </button>

                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm('This will send congratulatory emails to ALL shortlisted teams. Continue?')) return;
                                                            setSendingEmails(true);
                                                            try {
                                                                const res = await emailShortlistedTeams();
                                                                if (res.error) {
                                                                    setMessage({ type: 'error', text: res.error });
                                                                } else {
                                                                    setMessage({ type: 'success', text: res.message || 'Emails sent!' });
                                                                    loadData();
                                                                }
                                                            } catch {
                                                                setMessage({ type: 'error', text: 'Failed to send emails.' });
                                                            }
                                                            setSendingEmails(false);
                                                        }}
                                                        disabled={sendingEmails || teams.filter(t => t.status === 'shortlisted').length === 0}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                                    >
                                                        <Send className="w-3.5 h-3.5" />
                                                        {sendingEmails ? 'Sending...' : 'Email Shortlist'}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 shadow-2xl">
                                                <table className="w-full text-sm text-left text-gray-400">
                                                    <thead className="text-xs text-gray-400 uppercase bg-black/40 border-b border-white/10">
                                                        <tr>
                                                            <th className="px-4 py-4 font-semibold">Rank</th>
                                                            <th className="px-4 py-4 font-semibold">Team Name</th>
                                                            <th className="px-4 py-4 font-semibold">Project Title</th>
                                                            <th className="px-4 py-4 font-semibold text-center">Round 1 Score</th>
                                                            <th className="px-4 py-4 font-semibold text-center">Round 2 Score</th>
                                                            <th className="px-4 py-4 font-semibold text-center">Final Score</th>
                                                            <th className="px-4 py-4 font-semibold">Status</th>
                                                            <th className="px-4 py-4 font-semibold text-right">Shortlist Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(() => {
                                                            const sortedTeams = [...teams].sort((a, b) => {
                                                                const getAvg = (t: any) => {
                                                                    const evals = t.hackathon_evaluations || [];
                                                                    const r1 = evals.filter((e: any) => e.evaluation_round === 1);
                                                                    const r2 = evals.filter((e: any) => e.evaluation_round === 2);
                                                                    const r1Avg = r1.length ? r1.reduce((sum: number, e: any) => sum + Number(e.total_score), 0) / r1.length : 0;
                                                                    const r2Avg = r2.length ? r2.reduce((sum: number, e: any) => sum + Number(e.total_score), 0) / r2.length : 0;
                                                                    return r1Avg + r2Avg;
                                                                };
                                                                return getAvg(b) - getAvg(a);
                                                            });
                                                            const paginatedTeams = sortedTeams.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                                                            return paginatedTeams.map((team, i) => {
                                                                const index = (currentPage - 1) * ITEMS_PER_PAGE + i;
                                                                return (
                                                                    <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                                        <td className="px-4 py-4">
                                                                            <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${index === 0 ? 'bg-amber-500/20 text-amber-500' : index === 1 ? 'bg-gray-300/20 text-gray-300' : index === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-white/5 text-gray-400'}`}>
                                                                                {index + 1}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-4 font-bold text-white relative group">
                                                                            <div className="flex items-center gap-2">
                                                                                {team.name}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const participants = team.hackathon_participants || [];
                                                                                        const leader = participants.find((p: any) => p.role === 'Leader') || { id: '', name: '', email: '', phone: '' };
                                                                                        const members = participants.filter((p: any) => p.role === 'Member');

                                                                                        // Pad members to 4
                                                                                        const paddedMembers = [...members];
                                                                                        while (paddedMembers.length < 4) paddedMembers.push({ id: '', name: '', email: '', phone: '' });

                                                                                        setEditFormData({
                                                                                            teamName: team.name,
                                                                                            ideaTitle: team.idea_title,
                                                                                            teamCode: team.team_code || '',
                                                                                            theme: team.theme || '',
                                                                                            projectObjective: team.project_objective || '',
                                                                                            leader,
                                                                                            members: paddedMembers.slice(0, 4)
                                                                                        });
                                                                                        setEditingTeam(team);
                                                                                    }}
                                                                                    className="opacity-0 group-hover:opacity-100 p-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded transition-all"
                                                                                    title="Edit Team"
                                                                                >
                                                                                    <Edit className="w-3.5 h-3.5" />
                                                                                </button>
                                                                                {(() => {
                                                                                    const pendingEdits = team.hackathon_evaluations?.filter((e: any) => e.edit_requested) || [];
                                                                                    if (pendingEdits.length === 0) return null;
                                                                                    return (
                                                                                        <button 
                                                                                            onClick={async () => {
                                                                                                if (!window.confirm(`Approve ${pendingEdits.length} edit request(s) for ${team.name}?`)) return;
                                                                                                for (const edit of pendingEdits) {
                                                                                                    await approveScoreEdit(team.id, edit.evaluation_round);
                                                                                                }
                                                                                                loadData();
                                                                                            }}
                                                                                            className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                                                                                            title="Approve Evaluator Score Edit"
                                                                                        >
                                                                                            <AlertCircle className="w-3 h-3" /> Approve Edit
                                                                                        </button>
                                                                                    )
                                                                                })()}
                                                                            </div>
                                                                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                                                                <span className="font-mono text-amber-500">{team.team_code}</span>
                                                                                <span>•</span>
                                                                                <span>Leader: {team.hackathon_participants?.find((p: any) => p.role === 'Leader')?.name || 'Unknown'}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-4 font-medium text-emerald-400 max-w-xs truncate" title={team.project_objective}>
                                                                            {team.idea_title}
                                                                        </td>
                                                                        <td className="px-4 py-4 font-mono text-center">
                                                                            {(() => {
                                                                                const r1 = team.hackathon_evaluations?.filter((e: any) => e.evaluation_round === 1) || [];
                                                                                const total = r1.reduce((sum: number, ev: any) => sum + Number(ev.total_score), 0);
                                                                                return <span className={total > 0 ? "text-amber-400 font-bold" : "text-gray-600"} title={r1.length ? `Rated by ${r1.length} evaluator(s)` : ''}>{total > 0 ? (total / r1.length).toFixed(1) : '-'}</span>;
                                                                            })()}
                                                                        </td>
                                                                        <td className="px-4 py-4 font-mono text-center border-l border-white/5">
                                                                            {(() => {
                                                                                const r2 = team.hackathon_evaluations?.filter((e: any) => e.evaluation_round === 2) || [];
                                                                                const total = r2.reduce((sum: number, ev: any) => sum + Number(ev.total_score), 0);
                                                                                return <span className={total > 0 ? "text-amber-400 font-bold" : "text-gray-600"} title={r2.length ? `Rated by ${r2.length} evaluator(s)` : ''}>{total > 0 ? (total / r2.length).toFixed(1) : '-'}</span>;
                                                                            })()}
                                                                        </td>
                                                                        <td className="px-4 py-4 font-mono text-center border-l border-white/5">
                                                                            {(() => {
                                                                                const evals = team.hackathon_evaluations || [];
                                                                                const r1 = evals.filter((e: any) => e.evaluation_round === 1);
                                                                                const r2 = evals.filter((e: any) => e.evaluation_round === 2);
                                                                                const r1Avg = r1.length ? r1.reduce((sum: number, ev: any) => sum + Number(ev.total_score), 0) / r1.length : 0;
                                                                                const r2Avg = r2.length ? r2.reduce((sum: number, ev: any) => sum + Number(ev.total_score), 0) / r2.length : 0;
                                                                                const finalScore = r1Avg + r2Avg;
                                                                                return <span className={finalScore > 0 ? "text-emerald-400 font-bold text-base" : "text-gray-600"} title={`R1: ${r1Avg.toFixed(1)} + R2: ${r2Avg.toFixed(1)}`}>{finalScore > 0 ? finalScore.toFixed(1) : '—'}</span>;
                                                                            })()}
                                                                        </td>
                                                                        <td className="px-4 py-4">
                                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border w-fit ${team.status === 'pending' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                                                                team.status === 'evaluating' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                                    (team.status === 'shortlisted' || team.status === 'shortlisted_notified') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                                                }`}>
                                                                                {team.status === 'shortlisted_notified' ? '✅ NOTIFIED' : team.status.toUpperCase()}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-4 text-right">
                                                                            <button
                                                                                onClick={() => handleToggleShortlist(team.id, team.status)}
                                                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${(team.status === 'shortlisted' || team.status === 'shortlisted_notified')
                                                                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30'
                                                                                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                                                                    }`}
                                                                            >
                                                                                {(team.status === 'shortlisted' || team.status === 'shortlisted_notified') ? 'Remove from Shortlist' : 'Mark as Shortlisted'}
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            });
                                                        })()}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination Controls */}
                                            {(() => {
                                                const totalPages = Math.ceil(teams.length / ITEMS_PER_PAGE);
                                                if (totalPages <= 1) return null;
                                                return (
                                                    <div className="flex items-center justify-between mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
                                                        <span className="text-sm text-gray-400">
                                                            Showing <span className="text-white font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-white font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, teams.length)}</span> of <span className="text-white font-medium">{teams.length}</span> teams
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                                disabled={currentPage === 1}
                                                                className="p-2 rounded-lg bg-black/50 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                            >
                                                                <ChevronLeft className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                                disabled={currentPage === totalPages}
                                                                className="p-2 rounded-lg bg-black/50 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                        </div>

                                        {/* Custom Email Blast Section */}
                                        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                                                <Mail className="w-5 h-5 text-blue-400" />
                                                Custom Email Blast
                                            </h3>
                                            <div className="grid gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-2">Subject Line</label>
                                                    <input 
                                                        type="text" 
                                                        value={customEmailSubject} 
                                                        onChange={e => setCustomEmailSubject(e.target.value)} 
                                                        placeholder="e.g. Important Update for Innovate Bharat Hackathon"
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white placeholder-gray-600"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-2">Message Body</label>
                                                    <textarea 
                                                        value={customEmailBody} 
                                                        onChange={e => setCustomEmailBody(e.target.value)} 
                                                        placeholder="Hello team,\n\nHere's an important update regarding the hackathon..."
                                                        rows={6}
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white placeholder-gray-600 text-sm"
                                                    />
                                                </div>
                                                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                                    <div className="flex gap-4">
                                                        <button 
                                                            onClick={() => setCustomEmailTarget('all')}
                                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${customEmailTarget === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                                        >
                                                            All Participants
                                                        </button>
                                                        <button 
                                                            onClick={() => setCustomEmailTarget('shortlisted')}
                                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${customEmailTarget === 'shortlisted' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                                        >
                                                            Shortlisted Teams Only
                                                        </button>
                                                    </div>
                                                    <button 
                                                        onClick={async () => {
                                                            if (!customEmailSubject || !customEmailBody) {
                                                                setMessage({ type: 'error', text: 'Subject and Body are required!' });
                                                                return;
                                                            }
                                                            if (!confirm(`Send custom email blast to ${customEmailTarget === 'all' ? 'EVERY participant' : 'SHORTLISTED teams'}? This action cannot be undone.`)) return;
                                                            
                                                            setBlastingEmail(true);
                                                            try {
                                                                const res = await blastCustomEmail(customEmailSubject, customEmailBody, customEmailTarget);
                                                                if (res.error) {
                                                                    setMessage({ type: 'error', text: res.error });
                                                                } else {
                                                                    setMessage({ type: 'success', text: res.message || 'Emails sent successfully!' });
                                                                    setCustomEmailSubject('');
                                                                    setCustomEmailBody('');
                                                                }
                                                            } catch {
                                                                setMessage({ type: 'error', text: 'Failed to send custom email blast.' });
                                                            }
                                                            setBlastingEmail(false);
                                                        }}
                                                        disabled={blastingEmail}
                                                        className="px-6 py-2 rounded-xl text-sm font-bold bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        {blastingEmail ? 'Blasting...' : 'Send Email Blast'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Edit Team Modal */}
                            {editingTeam && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                                    <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
                                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/90 rounded-t-2xl">
                                            <h3 className="text-xl font-semibold text-white">Edit Team Details</h3>
                                            <button onClick={() => setEditingTeam(null)} className="text-gray-400 hover:text-white transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleUpdateTeam} className="p-6 space-y-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Team Name</label>
                                                    <input required type="text" value={editFormData.teamName} onChange={e => setEditFormData({ ...editFormData, teamName: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Team Code</label>
                                                    <input type="text" value={editFormData.teamCode || ''} onChange={e => setEditFormData({ ...editFormData, teamCode: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Theme</label>
                                                    <input type="text" value={editFormData.theme || ''} onChange={e => setEditFormData({ ...editFormData, theme: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Idea / Project Title</label>
                                                    <input required type="text" value={editFormData.ideaTitle} onChange={e => setEditFormData({ ...editFormData, ideaTitle: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Project Objective</label>
                                                    <textarea value={editFormData.projectObjective} onChange={e => setEditFormData({ ...editFormData, projectObjective: e.target.value })} rows={3} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-white/10">
                                                <h4 className="text-sm font-medium text-blue-400 pb-2">Edit Team Leader</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Name *</label>
                                                        <input required type="text" value={editFormData.leader.name} onChange={e => setEditFormData({ ...editFormData, leader: { ...editFormData.leader, name: e.target.value } })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Email *</label>
                                                        <input required type="email" value={editFormData.leader.email} onChange={e => setEditFormData({ ...editFormData, leader: { ...editFormData.leader, email: e.target.value } })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Phone *</label>
                                                        <input required type="tel" value={editFormData.leader.phone || ''} onChange={e => setEditFormData({ ...editFormData, leader: { ...editFormData.leader, phone: e.target.value } })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Course</label>
                                                        <input type="text" value={editFormData.leader.course || ''} onChange={e => setEditFormData({ ...editFormData, leader: { ...editFormData.leader, course: e.target.value } })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Section (Optional for Shardans)</label>
                                                        <input type="text" value={editFormData.leader.section || ''} onChange={e => setEditFormData({ ...editFormData, leader: { ...editFormData.leader, section: e.target.value } })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">System ID (Optional for Shardans)</label>
                                                        <input type="text" value={editFormData.leader.system_id || ''} onChange={e => setEditFormData({ ...editFormData, leader: { ...editFormData.leader, system_id: e.target.value } })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Year</label>
                                                        <input type="text" value={editFormData.leader.year || ''} onChange={e => setEditFormData({ ...editFormData, leader: { ...editFormData.leader, year: e.target.value } })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs text-gray-400 mb-1">College</label>
                                                        <input type="text" value={editFormData.leader.college || ''} onChange={e => setEditFormData({ ...editFormData, leader: { ...editFormData.leader, college: e.target.value } })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-white/10">
                                                <h4 className="text-sm font-medium text-blue-400 pb-2">Edit Members (Optional)</h4>
                                                {editFormData.members.map((member, idx) => (
                                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-3 rounded-lg border border-white/5">
                                                        <div>
                                                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">M{idx + 1} Name</label>
                                                            <input type="text" value={member.name} onChange={e => {
                                                                const newMembers = [...editFormData.members];
                                                                newMembers[idx].name = e.target.value;
                                                                setEditFormData({ ...editFormData, members: newMembers });
                                                            }} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">M{idx + 1} Email</label>
                                                            <input type="email" value={member.email} onChange={e => {
                                                                const newMembers = [...editFormData.members];
                                                                newMembers[idx].email = e.target.value;
                                                                setEditFormData({ ...editFormData, members: newMembers });
                                                            }} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">M{idx + 1} Phone</label>
                                                            <input type="tel" value={member.phone || ''} onChange={e => {
                                                                const newMembers = [...editFormData.members];
                                                                newMembers[idx].phone = e.target.value;
                                                                setEditFormData({ ...editFormData, members: newMembers });
                                                            }} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">M{idx + 1} Course</label>
                                                            <input type="text" value={member.course || ''} onChange={e => {
                                                                const newMembers = [...editFormData.members];
                                                                newMembers[idx].course = e.target.value;
                                                                setEditFormData({ ...editFormData, members: newMembers });
                                                            }} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">M{idx + 1} Section</label>
                                                            <input type="text" value={member.section || ''} onChange={e => {
                                                                const newMembers = [...editFormData.members];
                                                                newMembers[idx].section = e.target.value;
                                                                setEditFormData({ ...editFormData, members: newMembers });
                                                            }} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">M{idx + 1} System ID</label>
                                                            <input type="text" value={member.system_id || ''} onChange={e => {
                                                                const newMembers = [...editFormData.members];
                                                                newMembers[idx].system_id = e.target.value;
                                                                setEditFormData({ ...editFormData, members: newMembers });
                                                            }} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">M{idx + 1} Year</label>
                                                            <input type="text" value={member.year || ''} onChange={e => {
                                                                const newMembers = [...editFormData.members];
                                                                newMembers[idx].year = e.target.value;
                                                                setEditFormData({ ...editFormData, members: newMembers });
                                                            }} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">M{idx + 1} College</label>
                                                            <input type="text" value={member.college || ''} onChange={e => {
                                                                const newMembers = [...editFormData.members];
                                                                newMembers[idx].college = e.target.value;
                                                                setEditFormData({ ...editFormData, members: newMembers });
                                                            }} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                                                <button type="button" onClick={() => setEditingTeam(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
                                                    Cancel
                                                </button>
                                                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors">
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Manual Add Modal */}
                            {showManualAdd && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                                    <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl my-8">
                                        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/90 backdrop-blur-md rounded-t-2xl">
                                            <h3 className="text-xl font-semibold text-white">Add Team Manually</h3>
                                            <button onClick={() => setShowManualAdd(false)} className="text-gray-400 hover:text-white transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleAddManualTeam} className="p-6 space-y-6">
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-medium text-emerald-400 border-b border-white/10 pb-2">Team Details</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Team Name *</label>
                                                        <input required type="text" name="teamName" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Team Code *</label>
                                                        <input required type="text" name="teamCode" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Theme</label>
                                                        <input type="text" name="theme" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs text-gray-400 mb-1">Idea / Project Title *</label>
                                                        <input required type="text" name="ideaTitle" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-sm font-medium text-blue-400 border-b border-white/10 pb-2">Team Leader</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Name *</label>
                                                        <input required type="text" name="leaderName" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Email *</label>
                                                        <input required type="email" name="leaderEmail" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Phone *</label>
                                                        <input required type="tel" name="leaderPhone" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Course</label>
                                                        <input type="text" name="leaderCourse" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Section (Optional for Shardans)</label>
                                                        <input type="text" name="leaderSection" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">System ID (Optional for Shardans)</label>
                                                        <input type="text" name="leaderSystemId" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Year</label>
                                                        <input type="text" name="leaderYear" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs text-gray-400 mb-1">College</label>
                                                        <input type="text" name="leaderCollege" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-sm font-medium text-purple-400 border-b border-white/10 pb-2">Team Members (Optional)</h4>
                                                {[1, 2, 3, 4].map((num) => (
                                                    <div key={num} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Member {num} Name</label>
                                                            <input type="text" name={`m${num}Name`} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Email</label>
                                                            <input type="email" name={`m${num}Email`} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Phone</label>
                                                            <input type="tel" name={`m${num}Phone`} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Course</label>
                                                            <input type="text" name={`m${num}Course`} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Section</label>
                                                            <input type="text" name={`m${num}Section`} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">System ID</label>
                                                            <input type="text" name={`m${num}SystemId`} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Year</label>
                                                            <input type="text" name={`m${num}Year`} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs text-gray-400 mb-1">College</label>
                                                            <input type="text" name={`m${num}College`} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="sticky bottom-0 bg-zinc-900 border-t border-white/10 pt-4 pb-2 pb-safe">
                                                <button
                                                    type="submit"
                                                    disabled={addingManualMode}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                                >
                                                    {addingManualMode ? "Adding..." : "Add Team"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </TabsContent>

                {/* Evaluators Tab */}
                <TabsContent value="evaluators" className="mt-0 space-y-8">
                    {/* Evaluation Period Toggle */}
                    <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">Global Evaluation Period</h2>
                            <p className="text-gray-400 text-sm">When open, evaluators can submit scores. When closed, they can only view final peer-reviewed results.</p>
                        </div>
                        <button
                            onClick={handleToggleEvaluationPeriod}
                            className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${settings?.evaluation_open
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                }`}
                        >
                            {settings?.evaluation_open ? 'PERIOD IS OPEN' : 'PERIOD IS CLOSED'}
                        </button>
                    </div>

                    <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 max-w-md">
                                <h2 className="text-xl font-bold text-white mb-2">Evaluator Management</h2>
                                <p className="text-gray-400 text-sm mb-6">Add evaluator emails here so they can securely access the evaluation portal to score teams. They will log in using this email.</p>

                                <form onSubmit={handleAddEvaluator} className="flex gap-3">
                                    <input
                                        type="email"
                                        value={evalEmail}
                                        onChange={(e) => setEvalEmail(e.target.value)}
                                        placeholder="Evaluator Email (e.g. judge@company.com)"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-amber-500 text-white"
                                        required
                                    />
                                    <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-6 py-2 rounded-xl text-white font-medium transition-colors whitespace-nowrap">
                                        Add
                                    </button>
                                </form>
                                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                    <p className="text-sm text-blue-400 font-medium mb-1">Evaluator Portal Link</p>
                                    <p className="text-xs text-gray-400 mb-2">Share this secure link with your evaluators after adding them:</p>
                                    <div className="flex items-center gap-2 bg-black/50 p-2.5 rounded-lg border border-white/5 overflow-hidden">
                                        <code className="text-xs text-amber-400 select-all flex-1 truncate overflow-hidden break-all">https://www.technovashardauniversity.in/hackathon-portal</code>
                                        <Link href="/hackathon-portal/evaluate" target="_blank" className="text-blue-400 hover:text-blue-300 text-xs underline whitespace-nowrap flex-shrink-0">
                                            Open Portal
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 border-l border-white/10 pl-0 md:pl-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Current Evaluators</h3>
                                    {evaluators.length > 0 && (
                                        <button
                                            onClick={() => handleSendEvaluatorInvite()}
                                            disabled={sendingEmails}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                            Send to All
                                        </button>
                                    )}
                                </div>
                                {evaluators.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">No evaluators added yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {evaluators.map(ev => (
                                            <div key={ev.id} className="group flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                                                <div>
                                                    <p className="font-medium text-white">{ev.name}</p>
                                                    <p className="text-xs text-gray-400">{ev.email}</p>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleSendEvaluatorInvite(ev.id)}
                                                        disabled={sendingEmails}
                                                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                        title="Send Magic Link"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveEvaluator(ev.id)}
                                                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                        title="Remove Evaluator"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
                        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                            <Star className="w-6 h-6 text-amber-500" />
                            <div>
                                <h2 className="text-xl font-bold text-white">Evaluate Teams</h2>
                                <p className="text-sm text-gray-400">Score teams based on the 6-point rubric. You must be added as an evaluator above first.</p>
                            </div>
                        </div>
                        <EvaluatorDashboardClient initialTeams={[]} evaluationOpen={settings?.evaluation_open ?? false} />
                    </div>
                </TabsContent>

                {/* Volunteers Tab */}
                <TabsContent value="volunteers" className="mt-0 border border-zinc-800 bg-zinc-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 max-w-md">
                            <h2 className="text-xl font-bold text-white mb-2">Volunteer Management</h2>
                            <p className="text-gray-400 text-sm mb-6">Add student volunteers who can scan QR codes for check-in, checkout, and meals. They will log in with their Sharda University email.</p>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!volEmail) return;
                                const res = await addVolunteer(volEmail, volName || 'Volunteer', volTeam, volShift, undefined);
                                if (res.error) {
                                    setMessage({ type: 'error', text: res.error });
                                } else {
                                    setVolEmail("");
                                    setVolName("");
                                    setVolShift("Whole Day");
                                    setMessage({ type: 'success', text: "Volunteer added successfully." });
                                    loadData();
                                }
                            }} className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={volName}
                                        onChange={(e) => setVolName(e.target.value)}
                                        placeholder="Volunteer Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 text-white"
                                    />
                                    <select
                                        value={volTeam}
                                        onChange={(e) => setVolTeam(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 text-white"
                                    >
                                        <option value="Registration & Stage Team">Registration & Stage Team</option>
                                        <option value="Media Team">Media Team</option>
                                        <option value="Hospitality Team">Hospitality Team</option>
                                        <option value="Food Team">Food Team</option>
                                        <option value="Judging & Evaluation Team">Judging & Evaluation Team</option>
                                        <option value="Discipline & ERT Team">Discipline & ERT Team</option>
                                    </select>
                                    <select
                                        value={volShift}
                                        onChange={(e) => setVolShift(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 text-white"
                                    >
                                        <option value="Morning">Morning Shift</option>
                                        <option value="Night">Night Shift</option>
                                        <option value="Whole Day">Whole Day Shift</option>
                                    </select>
                                </div>
                                <div className="flex gap-3">
                                    <input
                                        type="email"
                                        value={volEmail}
                                        onChange={(e) => setVolEmail(e.target.value)}
                                        placeholder="student@ug.sharda.ac.in"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 text-white"
                                        required
                                    />
                                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-xl text-white font-medium transition-colors whitespace-nowrap">
                                        Add
                                    </button>
                                </div>
                            </form>

                            {/* Bulk Upload */}
                            <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                                <p className="text-sm text-violet-400 font-bold mb-1">📁 Bulk Upload Volunteers</p>
                                <p className="text-xs text-gray-400 mb-3">Upload an Excel file with columns: S.No, Name, Role, System ID, Section, Year, Mobile Number, Department, Email</p>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const file = formData.get('volFile') as File;
                                    if (!file || file.size === 0) {
                                        setMessage({ type: 'error', text: 'Please select a valid Excel file.' });
                                        return;
                                    }
                                    setUploading(true);
                                    setMessage(null);
                                    try {
                                        const uploadFormData = new FormData();
                                        uploadFormData.append('file', file);
                                        const result = await uploadVolunteersData(uploadFormData);
                                        if (result.error) {
                                            setMessage({ type: 'error', text: result.error });
                                        } else {
                                            setMessage({ type: 'success', text: result.message || 'Volunteers uploaded!' });
                                            loadData();
                                        }
                                    } catch (err: any) {
                                        setMessage({ type: 'error', text: err.message || 'Upload failed.' });
                                    } finally {
                                        setUploading(false);
                                    }
                                }} className="flex gap-2">
                                    <input
                                        type="file"
                                        name="volFile"
                                        accept=".xlsx,.xls,.csv"
                                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white file:mr-3 file:px-3 file:py-1 file:rounded-md file:bg-violet-600 file:text-white file:border-0 file:text-xs file:cursor-pointer"
                                    />
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-white text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </form>
                            </div>

                            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <p className="text-sm text-emerald-400 font-medium mb-1">Scanner Links</p>
                                <p className="text-xs text-gray-400 mb-2">Share these links with respective roles:</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 bg-black/50 p-2.5 rounded-lg border border-white/5 overflow-hidden">
                                        <code className="text-xs text-emerald-400 select-all flex-1 truncate">Participant Scanner</code>
                                        <Link href="/hackathon-portal/scan" target="_blank" className="text-green-400 hover:text-green-300 text-xs underline whitespace-nowrap flex-shrink-0">
                                            Open
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-2 bg-black/50 p-2.5 rounded-lg border border-white/5 overflow-hidden">
                                        <code className="text-xs text-violet-400 select-all flex-1 truncate">Volunteer Scanner</code>
                                        <Link href="/hackathon-portal/volunteer-scan" target="_blank" className="text-violet-400 hover:text-violet-300 text-xs underline whitespace-nowrap flex-shrink-0">
                                            Open
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 border-l border-white/10 pl-0 md:pl-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Current Volunteers</h3>
                                <button
                                    type="button"
                                    onClick={handleDownloadVolunteers}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-emerald-400 transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download CSV
                                </button>
                            </div>
                            
                            {volunteers.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No volunteers added yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {volunteers.map((v: any) => (
                                        <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                            <div>
                                                <p className="font-medium text-white flex flex-wrap items-center gap-2">
                                                    {v.name}
                                                    {v.team_name && (
                                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase tracking-wider font-bold">
                                                            {v.team_name}
                                                        </span>
                                                    )}
                                                    {v.shift && (
                                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] uppercase tracking-wider font-bold">
                                                            {v.shift} Shift
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                                    <span>{v.email}</span>
                                                    {v.mobile && <span>• Phone: {v.mobile}</span>}
                                                    {v.system_id && <span>• Sys ID: {v.system_id}</span>}
                                                    {v.department && <span>• {v.department} {v.section ? `(${v.section})` : ''} {v.year && `- Yr ${v.year}`}</span>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => { await removeVolunteer(v.id); loadData(); }}
                                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                title="Remove Volunteer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Timer Tab */}
                <TabsContent value="timer" className="mt-0 border border-zinc-800 bg-zinc-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Clock className={`w-16 h-16 mb-4 ${settings?.is_running ? 'text-emerald-500 animate-pulse' : 'text-blue-500/50'}`} />
                        <h2 className="text-2xl font-bold text-white mb-2">Live Timer Controls</h2>
                        <p className="text-gray-400 max-w-md mb-8">Start the 24-hour countdown and push real-time announcements to the public dashboard.</p>

                        <div className="w-full max-w-md space-y-4">
                            {settings?.is_running ? (
                                <div className="space-y-4 w-full mb-6">
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                        <p className="font-bold flex justify-center items-center gap-2">
                                            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" /></span> Timer is actively running!
                                        </p>
                                        <p className="text-xs mt-1 text-center">Started at: {new Date(settings.timer_start).toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={handleStopTimer}
                                        className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 py-3 rounded-xl text-red-400 font-bold text-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <StopCircle className="w-5 h-5" /> STOP TIMER
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleStartTimer}
                                    className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-white font-bold text-lg transition-colors shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                >
                                    START 24HR TIMER
                                </button>
                            )}

                            <div className="pt-6 border-t border-white/10 text-left">
                                <label className="block text-sm text-gray-400 mb-2">Live Announcement Banner</label>
                                <textarea
                                    value={announcement}
                                    onChange={(e) => setAnnouncement(e.target.value)}
                                    placeholder={settings?.active_announcement || "Type an announcement to display across all screens..."}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-blue-500 resize-none h-24 text-white"
                                />
                                <button
                                    onClick={handlePushAnnouncement}
                                    className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-xl text-white mt-2 transition-colors"
                                >
                                    Push Notification
                                </button>
                                {settings?.active_announcement && (
                                    <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Currently showing: "{settings.active_announcement}"
                                        </p>
                                        <button
                                            onClick={handleClearAnnouncement}
                                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Clear Announcement"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>


                        </div>
                    </div>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="mt-0 border border-zinc-800 bg-zinc-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white mb-2">Event Schedule</h2>
                            <p className="text-gray-400 text-sm mb-6">Manage checkpoints, meal times, and pitch timings for the live dashboard timeline.</p>

                            <form onSubmit={handleAddSchedule} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Title</label>
                                        <input type="text" name="title" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Type</label>
                                        <select name="event_type" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white [&>option]:bg-zinc-900">
                                            <option value="Activity">Activity</option>
                                            <option value="Meal">Meal</option>
                                            <option value="Evaluation">Evaluation</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Start Time</label>
                                        <input type="datetime-local" name="start_time" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">End Time (Optional)</label>
                                        <input type="datetime-local" name="end_time" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Description (Optional)</label>
                                    <input type="text" name="description" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                                </div>
                                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 px-6 py-2.5 rounded-xl text-white font-medium transition-colors">
                                    Add Schedule Item
                                </button>
                            </form>
                        </div>

                        <div className="flex-1 lg:border-l border-white/10 lg:pl-8">
                            <h3 className="text-lg font-semibold text-white mb-4">Live Timeline</h3>
                            {schedule.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No events scheduled.</p>
                            ) : (
                                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                                    {schedule.map(item => (
                                        <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-zinc-900 bg-purple-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                                            <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors shadow">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-white text-sm">{item.title}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${item.event_type === 'Meal' ? 'bg-orange-500/20 text-orange-400' :
                                                            item.event_type === 'Evaluation' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                            }`}>
                                                            {item.event_type}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDeleteScheduleItem(item.id)}
                                                            className="p-1 rounded-md text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                                            title="Delete event"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <time className="block text-xs font-medium text-emerald-400 mb-2">
                                                    {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </time>
                                                {item.description && <div className="text-gray-400 text-xs">{item.description}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-0 border border-zinc-800 bg-zinc-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
                    <div className="max-w-xl">
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-yellow-400" /> Platform Settings
                        </h2>
                        <p className="text-gray-400 text-sm mb-8">Manage global platform configurations and tracking schemas.</p>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                <Utensils className="w-4 h-4 text-orange-400" /> Verify & Track Custom Meals
                            </h3>
                            <p className="text-xs text-gray-400 mb-6">Define exactly which meals food volunteers can scan and distribute. This syncs directly to all volunteers' Verify & Track dropdowns.</p>

                            <div className="space-y-3 mb-6">
                                {customMeals.map((meal, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-black/40 border border-white/10 px-4 py-3 rounded-xl hover:border-orange-500/30 transition-colors">
                                        <span className="text-sm font-medium text-orange-100/90">{meal}</span>
                                        <button
                                            onClick={() => setCustomMeals(customMeals.filter((_, i) => i !== idx))}
                                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300 p-1.5 rounded-lg transition-colors"
                                            title="Delete Meal Round"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {customMeals.length === 0 && (
                                    <p className="text-sm text-gray-500 italic py-4 text-center border border-dashed border-white/10 rounded-xl">No meals currently defined.</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMeal}
                                    onChange={(e) => setNewMeal(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newMeal.trim() !== '') {
                                            if (!customMeals.includes(newMeal.trim())) setCustomMeals([...customMeals, newMeal.trim()]);
                                            setNewMeal('');
                                        }
                                    }}
                                    placeholder="Add a new meal (e.g. Day 3 Breakfast)"
                                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                                <button
                                    onClick={() => {
                                        if (newMeal.trim() !== '' && !customMeals.includes(newMeal.trim())) {
                                            setCustomMeals([...customMeals, newMeal.trim()]);
                                            setNewMeal('');
                                        }
                                    }}
                                    className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-orange-500/20"
                                >
                                    Add Meal
                                </button>
                            </div>

                            <button
                                onClick={handleSaveMeals}
                                className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-white mt-6 font-bold transition-colors border border-white/10 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" /> Save Meal Rounds
                            </button>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6 relative overflow-hidden">
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-400" /> Evaluation Rounds
                            </h3>
                            <p className="text-xs text-gray-400 mb-6">Set how many rounds of evaluation are required for this hackathon (e.g., 1 for screening, 2 for grand finale).</p>

                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={evaluationRounds}
                                    onChange={(e) => setEvaluationRounds(parseInt(e.target.value) || 1)}
                                    className="w-24 bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-amber-500 transition-colors"
                                />
                                <button
                                    onClick={async () => {
                                        const res = await updateEvaluationRounds(evaluationRounds);
                                        if (res.success) {
                                            setMessage({ type: 'success', text: `Max evaluation rounds updated to ${evaluationRounds}` });
                                        } else {
                                            setMessage({ type: 'error', text: res.error || "Failed to update rounds" });
                                        }
                                    }}
                                    className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-amber-500/20"
                                >
                                    Update Rounds
                                </button>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Roles Management Tab */}
                <TabsContent value="roles" className="mt-0">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-1/3 bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden h-fit">
                            <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-rose-400" /> Assign Role
                            </h3>
                            <p className="text-xs text-gray-400 mb-6">Assign special permissions to users based on their email. Super Admins always have full access.</p>
                            
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setMessage(null);
                                const res = await addHackathonRole(roleEmail, roleType);
                                if (res.success) {
                                    setMessage({ type: 'success', text: 'Role assigned successfully' });
                                    setRoleEmail('');
                                    loadData();
                                } else {
                                    setMessage({ type: 'error', text: res.error || 'Failed to assign role' });
                                }
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">User Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={roleEmail}
                                        onChange={(e) => setRoleEmail(e.target.value)}
                                        placeholder="admin@example.com"
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Role Type</label>
                                    <select
                                        value={roleType}
                                        onChange={(e) => setRoleType(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors appearance-none"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="student_lead">Student Lead</option>
                                        <option value="volunteer">Volunteer</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-rose-500/20"
                                >
                                    Assign Role
                                </button>
                            </form>
                        </div>

                        <div className="flex-1 border border-white/10 bg-zinc-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
                            <h3 className="text-xl font-semibold text-white mb-6">Assigned Roles</h3>
                            {roles.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No custom roles assigned yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {roles.map((r, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors gap-4">
                                            <div>
                                                <p className="font-semibold text-white text-sm">{r.email}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                                        r.role === 'admin' ? 'bg-amber-500/20 text-amber-400' :
                                                        r.role === 'student_lead' ? 'bg-purple-500/20 text-purple-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                        {r.role.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Assigned {new Date(r.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const res = await removeHackathonRole(r.id);
                                                    if (res.success) {
                                                        setMessage({ type: 'success', text: 'Role removed' });
                                                        loadData();
                                                    } else {
                                                        setMessage({ type: 'error', text: res.error || 'Failed to remove role' });
                                                    }
                                                }}
                                                className="self-end md:self-auto p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-colors group"
                                                title="Remove Role"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
