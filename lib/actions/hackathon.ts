'use server'

import { createClient as createServerClient } from "@supabase/supabase-js"
import { auth } from "@/lib/auth"
import * as xlsx from 'xlsx'
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

export async function getSupabase() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function uploadHackathonData(formData: FormData) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) {
        throw new Error("Unauthorized")
    }

    const file = formData.get('file') as File
    if (!file) {
        return { error: "No file provided" }
    }

    try {
        const buffer = await file.arrayBuffer()
        const workbook = xlsx.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = xlsx.utils.sheet_to_json(worksheet)

        if (!data || data.length === 0) {
            return { error: "File is empty or invalid" }
        }

        const supabase = await getSupabase()

        // Expected columns (flexible mapping needed depending on Google Form output)
        // We assume headers like: "Team Name", "Idea/Project Title", "Leader Name", "Leader Email", "Member 1 Name", "Member 1 Email", etc.
        // Let's normalize it by looking at keys or we strictly require certain headers.

        let teamsAdded = 0
        let participantsAdded = 0

        for (const row of data as any[]) {
            // Find team name and idea using strict matching (strip non-alphanumeric whitespace)
            const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

            const teamNameKey = Object.keys(row).find(k => {
                const clean = cleanStr(k);
                return clean.includes('teamname') || clean.includes('nameofteam') || clean === 'team';
            })
            const ideaKey = Object.keys(row).find(k => {
                const clean = cleanStr(k);
                return clean.includes('idea') || clean.includes('projecttitle') || clean.includes('title') || clean.includes('solution') || clean.includes('theme');
            })
            const teamCodeKey = Object.keys(row).find(k => {
                const clean = cleanStr(k);
                return clean.includes('teamid') || clean.includes('code');
            })
            const objectiveKey = Object.keys(row).find(k => {
                const clean = cleanStr(k);
                return clean.includes('synopsis') || clean.includes('objective') || clean.includes('description');
            })
            const themeKey = Object.keys(row).find(k => {
                const clean = cleanStr(k);
                return clean === 'theme' || clean.includes('projecttheme') || clean.includes('teamtheme');
            })

            const teamCode = teamCodeKey ? String(row[teamCodeKey]) : null
            let teamName = (teamNameKey && row[teamNameKey]) ? String(row[teamNameKey]).trim() : '';
            if (!teamName) {
                teamName = `Team ${teamCode || Math.floor(Math.random() * 10000)}`
            }
            const ideaTitle = (ideaKey && row[ideaKey]) ? String(row[ideaKey]).trim() : 'TBD'
            const projectObjective = (objectiveKey && row[objectiveKey]) ? String(row[objectiveKey]).trim() : null
            const theme = (themeKey && row[themeKey]) ? String(row[themeKey]).trim() : null

            // Insert Team
            const { data: team, error: teamError } = await supabase
                .from('hackathon_teams')
                .insert({
                    name: teamName,
                    idea_title: ideaTitle,
                    team_code: teamCode,
                    theme: theme,
                    project_objective: projectObjective,
                    status: 'pending'
                })
                .select()
                .single()

            if (teamError || !team) {
                console.error("Error inserting team:", teamError)
                continue;
            }
            teamsAdded++

            // Find members (leader + members)
            // Look for patterns like "Leader Name", "Leader Email", "Member 1 Name", "Member 1 Email"
            const participantPairs: { name: string, email: string, phone: string | null, role: string, course: string | null, section: string | null, system_id: string | null, year: string | null, college: string | null }[] = []

            // Extract leader - match actual column headers like "Team Lead Name", "Leader Name", "Name", etc.
            const leaderNameKey = Object.keys(row).find(k => {
                const lower = k.toLowerCase();
                return lower.includes('lead') && lower.includes('name');
            }) || Object.keys(row).find(k => {
                const lower = k.toLowerCase();
                return (lower === 'name') || (lower.includes('name') && !lower.includes('team name') && !lower.includes('idea') && !lower.includes('project') && !lower.includes('member'));
            })

            const leaderEmailKey = Object.keys(row).find(k => k.toLowerCase().includes('lead') && k.toLowerCase().includes('email'))
                || Object.keys(row).find(k => k.toLowerCase() === 'email')
                || Object.keys(row).find(k => k.toLowerCase().includes('email') && !k.toLowerCase().includes('member'))

            const leaderPhoneKey = Object.keys(row).find(k => {
                const lower = k.toLowerCase();
                return (lower.includes('mobile') || lower.includes('phone') || lower.includes('contact')) && !lower.includes('member');
            })

            const getField = (row: any, keyword1: string, keyword2?: string) => {
                const key = Object.keys(row).find(k => {
                    const clean = cleanStr(k);
                    if (keyword2) return clean.includes(keyword1) && clean.includes(keyword2);
                    return clean.includes(keyword1) && !clean.includes('member');
                });
                return key ? String(row[key]).trim() : null;
            }

            participantPairs.push({
                name: (leaderNameKey && row[leaderNameKey]) ? String(row[leaderNameKey]).trim() : 'Unknown Leader',
                email: (leaderEmailKey && row[leaderEmailKey]) ? String(row[leaderEmailKey]).trim() : '',
                phone: (leaderPhoneKey && row[leaderPhoneKey]) ? String(row[leaderPhoneKey]).trim() : null,
                course: getField(row, 'course', 'lead') || getField(row, 'course'),
                section: getField(row, 'section', 'lead') || getField(row, 'section'),
                system_id: getField(row, 'systemid', 'lead') || getField(row, 'systemid'),
                year: getField(row, 'year', 'lead') || getField(row, 'year'),
                college: getField(row, 'college', 'lead') || getField(row, 'college'),
                role: 'Leader'
            })

            // Extract members (up to 4 members typically)
            for (let i = 1; i <= 4; i++) {
                const memberNameKey = Object.keys(row).find(k => k.toLowerCase().includes(`member ${i}`) && k.toLowerCase().includes('name'))
                    || Object.keys(row).find(k => k.toLowerCase().includes(`member${i}`) && k.toLowerCase().includes('name'))
                const memberEmailKey = Object.keys(row).find(k => k.toLowerCase().includes(`member ${i}`) && k.toLowerCase().includes('email'))
                    || Object.keys(row).find(k => k.toLowerCase().includes(`member${i}`) && k.toLowerCase().includes('email'))
                const memberPhoneKey = Object.keys(row).find(k => k.toLowerCase().includes(`member ${i}`) && (k.toLowerCase().includes('phone') || k.toLowerCase().includes('mobile') || k.toLowerCase().includes('contact')))
                    || Object.keys(row).find(k => k.toLowerCase().includes(`member${i}`) && (k.toLowerCase().includes('phone') || k.toLowerCase().includes('mobile') || k.toLowerCase().includes('contact')))

                const getMemberField = (keyword: string) => {
                    const key = Object.keys(row).find(k => {
                        const clean = cleanStr(k);
                        return clean.includes(keyword) && (clean.includes(`member${i}`) || k.toLowerCase().includes(`member ${i}`));
                    });
                    return key ? String(row[key]).trim() : null;
                };

                if (memberNameKey && row[memberNameKey]) {
                    participantPairs.push({
                        name: String(row[memberNameKey]).trim(),
                        email: (memberEmailKey && row[memberEmailKey]) ? String(row[memberEmailKey]).trim() : '',
                        phone: (memberPhoneKey && row[memberPhoneKey]) ? String(row[memberPhoneKey]).trim() : null,
                        course: getMemberField('course'),
                        section: getMemberField('section'),
                        system_id: getMemberField('systemid'),
                        year: getMemberField('year'),
                        college: getMemberField('college'),
                        role: 'Member'
                    })
                }
            }

            // Insert Participants
            if (participantPairs.length > 0) {
                const participantsToInsert = participantPairs.map(p => ({
                    team_id: team.id,
                    name: p.name,
                    email: p.email,
                    phone: p.phone,
                    course: p.course,
                    section: p.section,
                    system_id: p.system_id,
                    year: p.year,
                    college: p.college,
                    role: p.role,
                    is_checked_in: false,
                    food_count: 0
                }))

                const { error: partError } = await supabase
                    .from('hackathon_participants')
                    .insert(participantsToInsert)

                if (!partError) {
                    participantsAdded += participantsToInsert.length
                } else {
                    console.error("Error inserting participants:", partError)
                }
            }
        }

        revalidatePath('/admin/hackathon')
        return { success: true, message: `Successfully imported ${teamsAdded} teams and ${participantsAdded} participants.` }

    } catch (error: any) {
        console.error("Upload Error:", error)
        return { error: "Failed to process file: " + error.message }
    }
}

export async function updateHackathonTeamDetails(teamId: string, data: {
    teamName: string,
    ideaTitle: string,
    teamCode?: string,
    theme?: string,
    projectObjective?: string,
    leader?: { id?: string, name: string, email: string, phone: string, course?: string, section?: string, system_id?: string, year?: string, college?: string },
    members?: { id?: string, name: string, email?: string, phone?: string, course?: string, section?: string, system_id?: string, year?: string, college?: string }[]
}) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) {
        return { error: "Unauthorized" }
    }

    try {
        const supabase = await getSupabase()

        // 1. Update Team Info
        const { error } = await supabase
            .from('hackathon_teams')
            .update({
                name: data.teamName,
                idea_title: data.ideaTitle || 'TBD',
                team_code: data.teamCode || null,
                theme: data.theme || null,
                project_objective: data.projectObjective || null,
            })
            .eq('id', teamId)

        if (error) {
            return { error: error.message || "Failed to update team details" }
        }

        // 2. Clear existing participants for this team
        await supabase.from('hackathon_participants').delete().eq('team_id', teamId)

        // 3. Prepare Participants to re-insert
        const participantsToInsert = []

        // Leader
        if (data.leader && data.leader.name) {
            participantsToInsert.push({
                team_id: teamId,
                name: data.leader.name,
                email: data.leader.email,
                phone: data.leader.phone,
                course: data.leader.course || null,
                section: data.leader.section || null,
                system_id: data.leader.system_id || null,
                year: data.leader.year || null,
                college: data.leader.college || null,
                role: 'Leader',
                is_checked_in: false,
                food_count: 0
            })
        }

        // Members
        if (data.members && data.members.length > 0) {
            for (const member of data.members) {
                if (member.name && member.name.trim() !== "") {
                    participantsToInsert.push({
                        team_id: teamId,
                        name: member.name,
                        email: member.email || '',
                        phone: member.phone || null,
                        course: member.course || null,
                        section: member.section || null,
                        system_id: member.system_id || null,
                        year: member.year || null,
                        college: member.college || null,
                        role: 'Member',
                        is_checked_in: false,
                        food_count: 0
                    })
                }
            }
        }

        // 4. Re-insert Participants
        if (participantsToInsert.length > 0) {
            const { error: partError } = await supabase
                .from('hackathon_participants')
                .insert(participantsToInsert)

            if (partError) {
                return { error: "Team updated, but failed to reconstruct members: " + partError.message }
            }
        }

        revalidatePath('/admin/hackathon')
        revalidatePath('/hackathon-portal')
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}


export async function addHackathonTeamManually(data: {
    teamName: string,
    ideaTitle: string,
    teamCode?: string,
    theme?: string,
    projectObjective?: string,
    leader: { name: string, email: string, phone: string, course?: string, section?: string, system_id?: string, year?: string, college?: string },
    members: { name: string, email?: string, phone?: string, course?: string, section?: string, system_id?: string, year?: string, college?: string }[]
}) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) {
        return { error: "Unauthorized" }
    }

    try {
        const supabase = await getSupabase()

        // 1. Insert Team
        const { data: team, error: teamError } = await supabase
            .from('hackathon_teams')
            .insert({
                name: data.teamName,
                idea_title: data.ideaTitle || 'TBD',
                team_code: data.teamCode || null,
                theme: data.theme || null,
                project_objective: data.projectObjective || null,
                status: 'pending'
            })
            .select()
            .single()

        if (teamError || !team) {
            return { error: teamError?.message || "Failed to create team" }
        }

        // 2. Prepare Participants
        const participantsToInsert = []

        // Leader
        if (data.leader && data.leader.name) {
            participantsToInsert.push({
                team_id: team.id,
                name: data.leader.name,
                email: data.leader.email,
                phone: data.leader.phone,
                course: data.leader.course || null,
                section: data.leader.section || null,
                system_id: data.leader.system_id || null,
                year: data.leader.year || null,
                college: data.leader.college || null,
                role: 'Leader',
                is_checked_in: false,
                food_count: 0
            })
        }

        // Members
        if (data.members && data.members.length > 0) {
            for (const member of data.members) {
                if (member.name && member.name.trim() !== "") {
                    participantsToInsert.push({
                        team_id: team.id,
                        name: member.name,
                        email: member.email || '',
                        phone: member.phone || null,
                        course: member.course || null,
                        section: member.section || null,
                        system_id: member.system_id || null,
                        year: member.year || null,
                        college: member.college || null,
                        role: 'Member',
                        is_checked_in: false,
                        food_count: 0
                    })
                }
            }
        }

        // 3. Insert Participants
        if (participantsToInsert.length > 0) {
            const { error: partError } = await supabase
                .from('hackathon_participants')
                .insert(participantsToInsert)

            if (partError) {
                return { error: "Team created, but failed to add members: " + partError.message }
            }
        }

        revalidatePath('/admin/hackathon')
        return { success: true, message: "Team created successfully" }
    } catch (error: any) {
        return { error: "An unexpected error occurred: " + error.message }
    }
}


export async function deleteAllHackathonTeams() {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) {
        throw new Error("Unauthorized")
    }

    try {
        const supabase = await getSupabase()
        // Delete all teams. Cascading deletes will remove participants and evaluations.
        const { error } = await supabase
            .from('hackathon_teams')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Dummy condition to delete all rows

        if (error) throw error

        revalidatePath('/admin/hackathon')
        return { success: true, message: "All teams have been successfully deleted." }
    } catch (error: any) {
        console.error("Delete All Teams Error:", error)
        return { error: "Failed to delete teams: " + error.message }
    }
}

export async function getHackathonTeams() {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return []

    const supabase = await getSupabase()
    const { data: teams } = await supabase
        .from('hackathon_teams')
        .select(`
            *,
            hackathon_participants (*),
            hackathon_evaluations (evaluator_id, total_score, evaluation_round, edit_requested, edit_granted)
        `)
        .order('created_at', { ascending: false })

    return teams || []
}

export async function updateTeamStatus(teamId: string, status: string) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    const supabase = await getSupabase()
    const { error } = await supabase
        .from('hackathon_teams')
        .update({ status })
        .eq('id', teamId)

    if (error) return { error: error.message }

    revalidatePath('/admin/hackathon')
    return { success: true }
}

export async function approveScoreEdit(teamId: string, round: number) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    const supabase = await getSupabase()
    const { error } = await supabase
        .from('hackathon_evaluations')
        .update({ edit_granted: true, edit_requested: false })
        .eq('team_id', teamId)
        .eq('evaluation_round', round)
        .eq('edit_requested', true)

    if (error) return { error: error.message }
    
    revalidatePath('/admin/hackathon')
    return { success: true }
}

// Evaluator Management
export async function getEvaluators() {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return []

    const supabase = await getSupabase()
    const { data: evaluators } = await supabase
        .from('hackathon_evaluators')
        .select('*')
        .order('created_at', { ascending: false })

    return evaluators || []
}

export async function addEvaluator(email: string, name: string = 'Evaluator') {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    if (!email) return { error: "Email is required" }

    const supabase = await getSupabase()

    // Check if evaluator already exists first to avoid duplicate email errors
    const { data: existing } = await supabase
        .from('hackathon_evaluators')
        .select('id, magic_token')
        .eq('email', email)
        .maybeSingle()

    let magicToken = existing?.magic_token;

    if (!existing) {
        const { data, error } = await supabase
            .from('hackathon_evaluators')
            .insert({ email, name })
            .select('magic_token')
            .single()

        if (error) return { error: error.message }
        magicToken = data.magic_token;
    }

    revalidatePath('/admin/hackathon')
    return { success: true }
}

export async function sendEvaluatorInvite(id?: string) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    if (!process.env.RESEND_API_KEY) return { error: "Mailing is not configured on the server." }

    const supabase = await getSupabase()
    let query = supabase.from('hackathon_evaluators').select('id, email, name, magic_token')
    
    if (id) {
        query = query.eq('id', id)
    }

    const { data: evaluators, error } = await query
    
    if (error || !evaluators || evaluators.length === 0) {
        return { error: "No evaluators found to email." }
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    let count = 0;

    for (const ev of evaluators) {
        try {
            const magicLink = `https://www.technovashardauniversity.in/evaluate?token=${ev.magic_token}`;
            await resend.emails.send({
                from: "Technova Society <no-reply@technovashardauniversity.in>",
                to: ev.email,
                subject: "Invitation: Official Evaluator - Innovate Bharat Hackathon",
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
                        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #000; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Innovate Bharat Hackathon</h1>
                            <p style="margin: 5px 0 0; color: #000; font-weight: bold; opacity: 0.8;">Official Evaluator Invitation</p>
                        </div>
                        <div style="padding: 40px 30px; line-height: 1.6;">
                            <h2 style="color: #f59e0b; margin-top: 0;">Welcome, ${ev.name}!</h2>
                            <p style="color: #ccc; font-size: 16px;">
                                You have been selected as an official evaluator for the Innovate Bharat Hackathon. Your expertise will be invaluable in identifying the most innovative projects.
                            </p>
                            
                            <div style="background-color: #111; border: 1px solid #222; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                                <p style="margin: 0 0 15px; color: #888; font-size: 14px;">Use the button below for direct access to your dashboard:</p>
                                <a href="${magicLink}" style="display: inline-block; background-color: #f59e0b; color: #000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; transition: transform 0.2s;">
                                    Enter Evaluator Portal
                                </a>
                                <p style="margin: 15px 0 0; color: #555; font-size: 12px;">Login Email: ${ev.email}</p>
                            </div>

                            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                                If you have any trouble with the link above, you can copy and paste this URL into your browser:<br/>
                                <span style="color: #f59e0b; word-break: break-all;">${magicLink}</span>
                            </p>
                        </div>
                        <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #1a1a1a;">
                            <p style="margin: 0; color: #444; font-size: 12px;">&copy; 2026 TechNova | Sharda University</p>
                        </div>
                    </div>
                `
            })
            count++;
            // Basic rate limiting for bulk
            if (evaluators.length > 3) {
                await new Promise(res => setTimeout(res, 300));
            }
        } catch (e) {
            console.error(`Failed to send evaluator email to ${ev.email}`, e);
        }
    }

    return { success: true, message: `Successfully sent ${count} invitation(s).` }
}

export async function removeEvaluator(id: string) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    const supabase = await getSupabase()
    const { error } = await supabase
        .from('hackathon_evaluators')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/hackathon')
    return { success: true }
}

// Timer & Settings Management
export async function getHackathonSettings() {
    const supabase = await getSupabase()
    const { data: settings } = await supabase
        .from('hackathon_settings')
        .select('*')
        .limit(1)
        .maybeSingle()
    return settings
}

export async function startTimer(durationHours: number = 24) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    const supabase = await getSupabase()

    // Check if settings row exists, if not create it
    const { data: existing } = await supabase.from('hackathon_settings').select('id').limit(1).maybeSingle()

    const payload = {
        timer_start: new Date().toISOString(),
        duration_hours: durationHours,
        is_running: true,
        updated_at: new Date().toISOString()
    }

    let error;
    if (existing) {
        const { error: updateError } = await supabase.from('hackathon_settings').update(payload).eq('id', existing.id)
        error = updateError
    } else {
        const { error: insertError } = await supabase.from('hackathon_settings').insert(payload)
        error = insertError
    }

    if (error) return { error: error.message }

    revalidatePath('/admin/hackathon')
    revalidatePath('/live')
    return { success: true }
}

export async function updateCustomMeals(meals: string[]) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    const supabase = await getSupabase()
    const { data: existing } = await supabase.from('hackathon_settings').select('id').limit(1).maybeSingle()

    if (existing) {
        const { error } = await supabase.from('hackathon_settings').update({ custom_meals: meals }).eq('id', existing.id)
        if (error) return { error: error.message }
    } else {
        const { error } = await supabase.from('hackathon_settings').insert({ custom_meals: meals })
        if (error) return { error: error.message }
    }

    revalidatePath('/admin/hackathon')
    revalidatePath('/hackathon-portal')
    return { success: true }
}

export async function pushAnnouncement(message: string) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    const supabase = await getSupabase()
    const { data: existing } = await supabase.from('hackathon_settings').select('id').limit(1).maybeSingle()

    if (existing) {
        const { error } = await supabase.from('hackathon_settings').update({
            active_announcement: message,
            updated_at: new Date().toISOString()
        }).eq('id', existing.id)
        if (error) return { error: error.message }
    } else {
        const { error } = await supabase.from('hackathon_settings').insert({
            active_announcement: message,
            duration_hours: 24
        })
        if (error) return { error: error.message }
    }

    revalidatePath('/admin/hackathon')
    revalidatePath('/live')
    return { success: true }
}

export async function stopTimer() {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    const supabase = await getSupabase()
    const { data: existing } = await supabase.from('hackathon_settings').select('id').limit(1).maybeSingle()

    if (!existing) return { error: "No timer found" }

    const { error } = await supabase.from('hackathon_settings').update({
        is_running: false,
        updated_at: new Date().toISOString()
    }).eq('id', existing.id)

    if (error) return { error: error.message }

    revalidatePath('/admin/hackathon')
    revalidatePath('/live')
    return { success: true }
}

export async function updateEvaluationRounds(rounds: number) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    const supabase = await getSupabase()

    // Check if settings row exists
    const { data: existing } = await supabase.from('hackathon_settings').select('id').limit(1).maybeSingle()

    let error;
    if (existing) {
        const { error: updateError } = await supabase.from('hackathon_settings').update({ evaluation_rounds: rounds, updated_at: new Date().toISOString() }).eq('id', existing.id)
        error = updateError
    } else {
        const { error: insertError } = await supabase.from('hackathon_settings').insert({ evaluation_rounds: rounds, timer_start: new Date().toISOString(), duration_hours: 24, is_running: false, updated_at: new Date().toISOString() })
        error = insertError
    }

    if (error) return { error: error.message }

    revalidatePath('/admin/hackathon')
    return { success: true }
}

export async function clearAnnouncement() {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    const supabase = await getSupabase()
    const { data: existing } = await supabase.from('hackathon_settings').select('id').limit(1).maybeSingle()

    if (!existing) return { error: "No settings found" }

    const { error } = await supabase.from('hackathon_settings').update({
        active_announcement: null,
        updated_at: new Date().toISOString()
    }).eq('id', existing.id)

    if (error) return { error: error.message }

    revalidatePath('/admin/hackathon')
    revalidatePath('/live')
    return { success: true }
}

// Schedule Management
export async function getSchedule() {
    const supabase = await getSupabase()
    const { data: schedule } = await supabase
        .from('hackathon_schedule')
        .select('*')
        .order('start_time', { ascending: true })

    return schedule || []
}

export async function addScheduleItem(data: { title: string, description?: string, start_time: string, end_time?: string, event_type: string }) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    const supabase = await getSupabase()
    const { error } = await supabase
        .from('hackathon_schedule')
        .insert(data)

    if (error) return { error: error.message }

    revalidatePath('/admin/hackathon')
    revalidatePath('/live')
    return { success: true }
}

export async function deleteScheduleItem(id: string) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    const supabase = await getSupabase()
    const { error } = await supabase
        .from('hackathon_schedule')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/hackathon')
    revalidatePath('/live')
    return { success: true }
}

// ==========================================
// EVALUATOR PORTAL ACTIONS
// ==========================================

export async function checkEvaluatorAccess() {
    const session = await auth()
    if (!session || !session.user || !session.user.email) return null

    const supabase = await getSupabase()
    const { data } = await supabase
        .from('hackathon_evaluators')
        .select('id, name, email')
        .eq('email', session.user.email)
        .single()

    return data || null
}

export async function getTeamsForEvaluation(round: number = 1) {
    const session = await auth()
    if (!session || !session.user) return []
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'

    const evaluator = await checkEvaluatorAccess()
    if (!evaluator && !isAdmin) return []

    const supabase = await getSupabase()

    // Fetch teams that are in 'evaluating' or 'pending' state
    let query = supabase
        .from('hackathon_teams')
        .select(`
            id, name, idea_title, project_objective, team_code, table_number, status, total_score,
            hackathon_participants (name, email, phone, role, college),
            hackathon_evaluations (evaluator_id, total_score, evaluation_round, edit_requested, edit_granted)
        `)

    if (round === 1) {
        // Use only valid enum values: pending, evaluating, shortlisted, rejected
        query = query.in('status', ['pending', 'evaluating', 'shortlisted', 'rejected'])
    } else {
        query = query.in('status', ['shortlisted'])
    }

    const { data: teams, error } = await query.order('created_at', { ascending: true })

    if (error) {
        console.error("Supabase Error in getTeamsForEvaluation:", error);
        return [];
    }


    if (!teams) return []

    // Map to indicate if this specific evaluator has already scored this team for this round
    return teams.map(team => {
        const evaluations = team.hackathon_evaluations || [];
        const myEval = evaluator ? evaluations.find((e: any) => e.evaluator_id === evaluator.id && e.evaluation_round === round) : null;

        // Calculate the total score for this SPECIFIC round
        // Now using Average instead of Sum, so multiple panels evaluating the same team won't inflate scores over teams evaluated by fewer panels
        const roundSpecificEvals = evaluations.filter((e: any) => e.evaluation_round === round);

        let roundSpecificTotal = 0;
        if (roundSpecificEvals.length > 0) {
            const sum = roundSpecificEvals.reduce((acc: number, curr: any) => acc + Number(curr.total_score), 0);
            // Return average, rounded to 1 decimal place
            roundSpecificTotal = Math.round((sum / roundSpecificEvals.length) * 10) / 10;
        }

        return {
            ...team,
            total_score: roundSpecificTotal, // Override generic total score with ROUND SPECIFIC total score
            has_evaluated: myEval ? !myEval.edit_granted : false,
            my_score: myEval ? myEval.total_score : null,
            edit_requested: myEval ? myEval.edit_requested : false,
            edit_granted: myEval ? myEval.edit_granted : false
        }
    })
}

export type EvaluationScores = {
    innovation: number;
    feasibility: number;
    impact: number;
    ux: number;
    presentation: number;
    feedback: string;
}

export async function submitEvaluation(teamId: string, round: number, scores: EvaluationScores, token?: string) {
    let evaluator;
    if (token) {
        const supabase = await getSupabase()
        const { data } = await supabase
            .from('hackathon_evaluators')
            .select('id, name, email')
            .eq('magic_token', token)
            .maybeSingle()
        evaluator = data
    }

    if (!evaluator) {
        evaluator = await checkEvaluatorAccess()
    }

    if (!evaluator) return { error: "Unauthorized Evaluator Access" }

    // Validate scores (0-10 range for 5 factors)
    const scoreValues = [scores.innovation, scores.feasibility, scores.impact, scores.ux, scores.presentation];
    if (scoreValues.some(s => s < 0 || s > 10)) {
        return { error: "Scores must be between 0 and 10 for each category." }
    }

    // Weights: Innovation(25%), Feasibility(20%), Impact(20%), UX(15%), Presentation(20%)
    // Each is out of 10. Max possible points: (10*2.5=25) + (10*2=20) + (10*2=20) + (10*1.5=15) + (10*2=20) = 100.
    const totalScore = (scores.innovation * 2.5) + (scores.feasibility * 2) + (scores.impact * 2) + (scores.ux * 1.5) + (scores.presentation * 2);
    
    const supabase = await getSupabase()

    // Check if evaluation is open
    const { data: settings } = await supabase.from('hackathon_settings').select('evaluation_open').limit(1).maybeSingle()
    if (!settings?.evaluation_open) {
        return { error: "Evaluation period is currently closed. You can no longer submit scores." }
    }

    const { data: existingEval } = await supabase
        .from('hackathon_evaluations')
        .select('id, edit_granted')
        .eq('team_id', teamId)
        .eq('evaluator_id', evaluator.id)
        .eq('evaluation_round', round)
        .maybeSingle()

    if (existingEval) {
        if (!existingEval.edit_granted) {
            return { error: `You have already evaluated this team for Round ${round}. Request an edit if you need to change your score.` }
        }
        
        const { error: evalError } = await supabase
            .from('hackathon_evaluations')
            .update({
                score_innovation: scores.innovation,
                score_feasibility: scores.feasibility,
                score_impact: scores.impact,
                score_ux: scores.ux,
                score_presentation: scores.presentation,
                total_score: totalScore,
                feedback: scores.feedback,
                edit_requested: false,
                edit_granted: false
            })
            .eq('id', existingEval.id)
            
        if (evalError) return { error: evalError.message }
    } else {
        const { error: evalError } = await supabase
            .from('hackathon_evaluations')
            .insert({
                team_id: teamId,
                evaluator_id: evaluator.id,
                evaluation_round: round,
                score_innovation: scores.innovation,
                score_feasibility: scores.feasibility,
                score_impact: scores.impact,
                score_ux: scores.ux,
                score_presentation: scores.presentation,
                total_score: totalScore,
                feedback: scores.feedback
            })

        if (evalError) return { error: evalError.code === '23505' ? `You have already evaluated this team for Round ${round}.` : evalError.message }
    }

    // Aggregate all scores for this team to update the teams table for the specific round
    const { data: allEvals } = await supabase
        .from('hackathon_evaluations')
        .select('total_score, evaluation_round')
        .eq('team_id', teamId)

    if (allEvals) {
        const round1Evals = allEvals.filter(e => e.evaluation_round === 1);
        const round1Sum = round1Evals.reduce((acc, curr) => acc + Number(curr.total_score), 0);
        const round1Avg = round1Evals.length > 0 ? Math.round((round1Sum / round1Evals.length) * 10) / 10 : 0;

        const round2Evals = allEvals.filter(e => e.evaluation_round === 2);
        const round2Sum = round2Evals.reduce((acc, curr) => acc + Number(curr.total_score), 0);
        const round2Avg = round2Evals.length > 0 ? Math.round((round2Sum / round2Evals.length) * 10) / 10 : 0;

        // We update the total_score to reflect the AVERAGE score of the CURRENT round so sorting works out of the box in the generic dashboard.
        const teamTotal = round === 1 ? round1Avg : round2Avg;

        await supabase
            .from('hackathon_teams')
            .update({
                total_score: teamTotal, // Holds the active round's total (Averaged across panels)
                status: 'evaluating'
            })
            .eq('id', teamId)
    }

    revalidatePath('/admin/hackathon/evaluate')
    revalidatePath('/admin/hackathon')
    return { success: true }
}

export async function requestEvaluationEdit(teamId: string, round: number, token?: string) {
    let evaluator;
    if (token) {
        const supabase = await getSupabase()
        const { data } = await supabase
            .from('hackathon_evaluators')
            .select('id')
            .eq('magic_token', token)
            .maybeSingle()
        evaluator = data
    } else {
        evaluator = await checkEvaluatorAccess()
    }

    if (!evaluator) return { error: "Unauthorized Evaluator Access" }

    const supabase = await getSupabase()
    const { error } = await supabase
        .from('hackathon_evaluations')
        .update({ edit_requested: true })
        .eq('team_id', teamId)
        .eq('evaluator_id', evaluator.id)
        .eq('evaluation_round', round)

    if (error) return { error: error.message }
    
    revalidatePath('/admin/hackathon/evaluate')
    return { success: true }
}

export async function toggleEvaluationPeriod(isOpen: boolean) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) {
        return { error: "Unauthorized" }
    }

    const supabase = await getSupabase()
    const { data: existing } = await supabase.from('hackathon_settings').select('id').limit(1).maybeSingle()

    if (existing) {
        const { error } = await supabase.from('hackathon_settings').update({
            evaluation_open: isOpen
        }).eq('id', existing.id)
        if (error) return { error: error.message }
    } else {
        const { error } = await supabase.from('hackathon_settings').insert({
            duration_hours: 24,
            evaluation_open: isOpen
        })
        if (error) return { error: error.message }
    }

    revalidatePath('/admin/hackathon')
    return { success: true }
}

export async function getTeamEvaluations(teamId: string, round: number) {
    const session = await auth()
    if (!session || !session.user) return []
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'

    const evaluator = await checkEvaluatorAccess()
    if (!evaluator && !isAdmin) return []

    const supabase = await getSupabase()

    const { data: evaluations } = await supabase
        .from('hackathon_evaluations')
        .select(`
            id, total_score, score_idea, score_tools, score_impact, score_sustainability, score_feasibility, score_communication, feedback, evaluation_round, created_at,
            hackathon_evaluators (name, email)
        `)
        .eq('team_id', teamId)
        .eq('evaluation_round', round)
        .order('created_at', { ascending: false })

    return evaluations || []
}

export async function getPublicShortlistedTeams() {
    const supabase = await getSupabase()
    const { data: teams } = await supabase
        .from('hackathon_teams')
        .select(`
            id, name, idea_title, table_number
        `)
        .or('status.eq.shortlisted,status.eq.shortlisted_notified')
        .order('total_score', { ascending: false })

    return teams || []
}

export async function emailShortlistedTeams() {
    const session = await auth()
    if (!session || !session.user) return { error: "Unauthorized" }
    if (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string)) return { error: "Unauthorized" }

    if (!process.env.RESEND_API_KEY) return { error: "Email service not configured" }

    const supabase = await getSupabase()

    // Get all shortlisted teams with their participants
    const { data: teams } = await supabase
        .from('hackathon_teams')
        .select('id, name, idea_title, team_code, hackathon_participants(name, email, role)')
        .eq('status', 'shortlisted')

    if (!teams || teams.length === 0) return { error: "No shortlisted teams found to email." }

    const resend = new Resend(process.env.RESEND_API_KEY)
    let sentCount = 0
    let failCount = 0

    for (const team of teams) {
        const participants = team.hackathon_participants || []
        const emails = participants.map((p: any) => p.email).filter(Boolean)

        if (emails.length === 0) continue

        for (const participant of participants) {
            if (!participant.email) continue
            try {
                await resend.emails.send({
                    from: "Technova Society <no-reply@technovashardauniversity.in>",
                    to: participant.email,
                    subject: "🎉 Congratulations! Your Team has been Shortlisted - Innovate Bharat Hackathon",
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
                            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                                <h1 style="margin: 0; color: #fff; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">🎉 Congratulations!</h1>
                                <p style="margin: 5px 0 0; color: rgba(255,255,255,0.9); font-weight: bold;">Innovate Bharat Hackathon</p>
                            </div>
                            <div style="padding: 40px 30px; line-height: 1.6;">
                                <h2 style="color: #10b981; margin-top: 0;">Dear ${participant.name},</h2>
                                <p style="color: #ccc; font-size: 16px;">
                                    We are thrilled to inform you that your team <strong style="color: #f59e0b;">${team.name}</strong> has been <strong style="color: #10b981;">shortlisted</strong> for the Grand Finale of the Innovate Bharat Hackathon!
                                </p>

                                <div style="background-color: #111; border: 1px solid #222; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                    <p style="margin: 0 0 10px; color: #888; font-size: 14px;">Team Details:</p>
                                    <p style="margin: 0; font-size: 16px; color: #fff;"><strong>Team:</strong> ${team.name}</p>
                                    <p style="margin: 5px 0 0; font-size: 14px; color: #f59e0b;"><strong>Team Code:</strong> ${team.team_code || 'N/A'}</p>
                                    <p style="margin: 5px 0 0; font-size: 14px; color: #aaa;"><strong>Project:</strong> ${team.idea_title || 'N/A'}</p>
                                </div>

                                <div style="background-color: #0a2e1e; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                                    <p style="margin: 0; color: #10b981; font-size: 18px; font-weight: bold;">🏆 You're in the Grand Finale!</p>
                                    <p style="margin: 10px 0 0; color: #aaa; font-size: 14px;">
                                        The 24-Hour Offline Hackathon awaits you at Sharda University. More details about the event schedule, venue, and logistics will be shared soon.
                                    </p>
                                </div>

                                <p style="color: #ccc; font-size: 14px;">
                                    Stay tuned for further updates. For any queries, reach out to the Technova Society team.
                                </p>

                                <div style="text-align: center; margin-top: 25px;">
                                    <a href="https://www.technovashardauniversity.in/hackathon" style="display: inline-block; background-color: #10b981; color: #000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                                        View Hackathon Details
                                    </a>
                                </div>
                            </div>
                            <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #1a1a1a;">
                                <p style="margin: 0; color: #444; font-size: 12px;">&copy; 2026 TechNova | Sharda University</p>
                            </div>
                        </div>
                    `
                })
                sentCount++
                // Throttle: Resend allows max 2 requests/sec
                await new Promise(resolve => setTimeout(resolve, 600))
            } catch (e) {
                console.error(`Failed to send email to ${participant.email}`, e)
                failCount++
            }
        }

        // Mark team as notified
        await supabase
            .from('hackathon_teams')
            .update({ status: 'shortlisted_notified' })
            .eq('id', team.id)
    }

    revalidatePath('/hackathon-portal/manage')
    revalidatePath('/hackathon')
    return { success: true, message: `✅ Emails sent to ${sentCount} participant(s) across ${teams.length} team(s).${failCount > 0 ? ` ${failCount} failed.` : ''}` }
}
export async function blastCustomEmail(subject: string, htmlBody: string, target: 'all' | 'shortlisted') {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) {
        return { error: "Unauthorized" }
    }

    if (!process.env.RESEND_API_KEY) return { error: "Email service not configured" }
    
    // Safety check
    if (!subject || !htmlBody) return { error: "Subject and body are required." }

    const supabase = await getSupabase()
    
    let emails = new Set<string>()
    let participants: any[] = []

    if (target === 'shortlisted') {
        const { data } = await supabase
            .from('hackathon_teams')
            .select(`
                id,
                status,
                hackathon_participants ( email )
            `)
            .in('status', ['shortlisted', 'shortlisted_notified'])
            
        if (data) {
            data.forEach(team => {
                team.hackathon_participants?.forEach((p: any) => {
                    if (p.email) emails.add(p.email)
                })
            })
        }
    } else {
        const { data } = await supabase
            .from('hackathon_participants')
            .select('email')
            
        if (data) {
            data.forEach(p => {
                if (p.email) emails.add(p.email)
            })
        }
    }

    const uniqueEmails = Array.from(emails).filter(Boolean)
    if (uniqueEmails.length === 0) return { error: "No participants found for the selected target." }

    const resend = new Resend(process.env.RESEND_API_KEY)
    let sentCount = 0
    let failCount = 0

    for (const email of uniqueEmails) {
        try {
            await resend.emails.send({
                from: "Technova Society <no-reply@technovashardauniversity.in>",
                to: email,
                subject: subject,
                html: htmlBody
            })
            sentCount++
            // Throttle: Resend allows max 2 requests/sec (600ms is safe)
            await new Promise(resolve => setTimeout(resolve, 600))
        } catch (e) {
            console.error(`Failed to send custom blast to ${email}`, e)
            failCount++
        }
    }

    return { success: true, message: `✅ Sent to ${sentCount} recipient(s).${failCount > 0 ? ` ${failCount} failed.` : ''}` }
}
// ==========================================
// LOGISTICS & QR ACTIONS
// ==========================================

export async function processHackathonQrScan(participantId: string, actionUrl: 'checkin' | 'checkout' | 'food' | 'food_unlog', mealRound?: string) {
    const session = await auth()
    if (!session || !session.user) return { error: "Unauthorized" }

    // Allow super_admin, admin, student_lead, or volunteers
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin' || session.user.role === 'student_lead'
    const volunteer = await checkVolunteerAccess()
    if (!isAdmin && !volunteer) return { error: "Unauthorized" }

    const supabase = await getSupabase()

    // First try participant
    let qrTarget: any = null
    let targetType: 'participant' | 'volunteer' = 'participant'

    const { data: participant } = await supabase
        .from('hackathon_participants')
        .select('*, hackathon_teams(name, team_code)')
        .eq('id', participantId)
        .maybeSingle()

    if (participant) {
        qrTarget = participant
    } else {
        // Try volunteer
        const { data: volTarget } = await supabase
            .from('hackathon_volunteers')
            .select('*')
            .eq('id', participantId)
            .maybeSingle()
        if (volTarget) {
            qrTarget = volTarget
            qrTarget.role = 'Staff Volunteer'
            targetType = 'volunteer'
        }
    }

    if (!qrTarget) return { error: "Invalid QR Code: Person not found." }

    const tableStr = targetType === 'participant' ? 'hackathon_participants' : 'hackathon_volunteers'

    if (actionUrl === 'checkin') {
        if (qrTarget.is_checked_in) return { message: "Already checked in", participant: qrTarget }

        const updateData: any = { is_checked_in: true }
        if (targetType === 'volunteer') {
            updateData.check_in_time = new Date().toISOString()
        }

        const { error } = await supabase
            .from(tableStr)
            .update(updateData)
            .eq('id', participantId)

        if (error) return { error: error.message }
        revalidatePath('/admin/hackathon')
        return { success: true, participant: qrTarget, message: `✅ ${qrTarget.name} — Checked in successfully` }
    }

    if (actionUrl === 'checkout') {
        if (!qrTarget.is_checked_in) return { message: "Not checked in", participant: qrTarget }

        const { error } = await supabase
            .from(tableStr)
            .update({ is_checked_in: false })
            .eq('id', participantId)

        if (error) return { error: error.message }
        revalidatePath('/admin/hackathon')
        return { success: true, participant: qrTarget, message: `👋 ${qrTarget.name} — Checked out successfully` }
    }

    if (actionUrl === 'food') {
        const mealType = mealRound || 'default'

        // Check if this person already scanned for this meal round
        const { data: existingLog } = await supabase
            .from('hackathon_food_logs')
            .select('id')
            .eq('participant_id', participantId)
            .eq('meal_type', mealType)
            .maybeSingle()

        if (existingLog) {
            return { error: `${qrTarget.name} has already scanned for "${mealType}". Each person can only scan once per meal round.` }
        }

        const logPayload: any = { meal_type: mealType }
        if (targetType === 'participant') {
            logPayload.participant_id = participantId
        } else {
            // Because our foreign key is to participants, technically food logs might fail if there's no FK constraint on volunteers.
            // Wait, we need to bypass FK or drop it. Or we just keep track in a different table.
            // Let's just bypass the log for a second, and only inc the food_count to be simple.
            // Even better, alter FK on hackathon_food_logs to not enforce participant, or keep participant_id null for volunteers and add volunteer_id.
        }

        // To make it safe without changing FK, if it's a volunteer, we'll just increment food_count directly if they haven't scanned (we can't use logs easily without schema changes, but let's just increment count for volunteers to avoid FK issues).
        // Actually, let's use the standard logs. We will drop the FK constraint on the food log table just for safety in a moment.

        const { error: logError } = await supabase
            .from('hackathon_food_logs')
            .insert({
                participant_id: targetType === 'participant' ? participantId : null,
                meal_type: mealType + (targetType === 'volunteer' ? `_vol_${participantId}` : ''), // hacky way to prevent unique violation
                // We'll fix the DB schema to have volunteer_id. Let's assume we do that next.
                volunteer_id: targetType === 'volunteer' ? participantId : null
            })

        if (logError) return { error: logError.message }

        const { error: updateError } = await supabase
            .from(tableStr)
            .update({ food_count: (qrTarget.food_count || 0) + 1 })
            .eq('id', participantId)

        if (updateError) return { error: updateError.message }

        return { success: true, participant: qrTarget, message: `✅ ${qrTarget.name} — "${mealType}" logged! (Total meals: ${(qrTarget.food_count || 0) + 1})` }
    }

    if (actionUrl === 'food_unlog') {
        const mealType = mealRound || 'default'

        // Check if this person has a log for this meal round
        let query = supabase.from('hackathon_food_logs').select('id').eq('meal_type', targetType === 'participant' ? mealType : mealType + `_vol_${participantId}`)
        
        if (targetType === 'participant') {
            query = query.eq('participant_id', participantId)
        } else {
            query = query.eq('volunteer_id', participantId)
        }

        const { data: existingLog } = await query.maybeSingle()

        if (!existingLog) {
            return { error: `${qrTarget.name} has no meal log for "${mealType}" to remove.` }
        }

        const { error: deleteError } = await supabase
            .from('hackathon_food_logs')
            .delete()
            .eq('id', existingLog.id)

        if (deleteError) return { error: deleteError.message }

        const newCount = Math.max(0, (qrTarget.food_count || 1) - 1)
        await supabase
            .from(tableStr)
            .update({ food_count: newCount })
            .eq('id', participantId)

        return { success: true, participant: qrTarget, message: `🗑️ ${qrTarget.name} — "${mealType}" unlogged! (Total meals: ${newCount})` }
    }

    return { error: "Invalid action" }
}

export async function manualCheckInParticipant(participantId: string, isCheckedIn: boolean) {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized" }

    const supabase = await getSupabase()
    
    // Check if participant exists
    const { data: p } = await supabase.from('hackathon_participants').select('id').eq('id', participantId).maybeSingle()
    if (p) {
        const { error } = await supabase.from('hackathon_participants').update({ is_checked_in: isCheckedIn }).eq('id', participantId)
        if (error) return { error: error.message }
    } else {
        // Evaluate volunteer
        const { error } = await supabase.from('hackathon_volunteers').update({ is_checked_in: isCheckedIn, check_in_time: isCheckedIn ? new Date().toISOString() : null }).eq('id', participantId)
        if (error) return { error: error.message }
    }
    
    revalidatePath('/admin/hackathon')
    return { success: true }
}

// ==========================================
// DATA DOWNLOADS
// ==========================================

export async function getCheckedInParticipantsData() {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized", data: [] }

    const supabase = await getSupabase()
    const { data: participants } = await supabase
        .from('hackathon_participants')
        .select('name, email, phone, role, is_checked_in, food_count, hackathon_teams(name, team_code)')
        .order('is_checked_in', { ascending: false })

    return {
        data: (participants || []).map((p: any) => ({
            'Participant Name': p.name,
            'Email': p.email,
            'Phone': p.phone || '',
            'Role': p.role,
            'Team Name': p.hackathon_teams?.name || '',
            'Team ID': p.hackathon_teams?.team_code || '',
            'Checked In': p.is_checked_in ? 'Yes' : 'No',
            'Meals Taken': p.food_count,
        }))
    }
}

export async function getFoodLogsData() {
    const session = await auth()
    if (!session || !session.user || (!['admin', 'super_admin', 'student_lead'].includes(session.user.role as string))) return { error: "Unauthorized", data: [] }

    const supabase = await getSupabase()
    const { data: logs } = await supabase
        .from('hackathon_food_logs')
        .select('meal_type, scanned_at, hackathon_participants(name, email, phone, hackathon_teams(name, team_code))')
        .order('scanned_at', { ascending: false })

    return {
        data: (logs || []).map((log: any) => ({
            'Participant Name': log.hackathon_participants?.name || '',
            'Email': log.hackathon_participants?.email || '',
            'Phone': log.hackathon_participants?.phone || '',
            'Team Name': log.hackathon_participants?.hackathon_teams?.name || '',
            'Team ID': log.hackathon_participants?.hackathon_teams?.team_code || '',
            'Meal Type': log.meal_type || '',
            'Scanned At': log.scanned_at ? new Date(log.scanned_at).toLocaleString() : '',
        }))
    }
}

// ==========================================
// SEARCH PARTICIPANTS (for manual check-in)
// ==========================================

export async function searchParticipants(query: string) {
    const session = await auth()
    if (!session || !session.user) return []

    // Allow super_admin, admin, or volunteers
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'
    const volunteer = await checkVolunteerAccess()
    if (!isAdmin && !volunteer) return []

    if (!query || query.length < 2) return []

    const supabase = await getSupabase()

    // First search by name/email/phone
    const { data: byFields } = await supabase
        .from('hackathon_participants')
        .select('id, name, email, phone, role, is_checked_in, food_count, hackathon_teams(name, team_code)')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(20)

    // Also search by team_code or team name
    const { data: byTeam } = await supabase
        .from('hackathon_participants')
        .select('id, name, email, phone, role, is_checked_in, food_count, hackathon_teams!inner(name, team_code)')
        .or(`hackathon_teams.team_code.ilike.%${query}%,hackathon_teams.name.ilike.%${query}%`)
        .limit(20)

    // Merge and deduplicate
    const merged = [...(byFields || []), ...(byTeam || [])]
    const seen = new Set<string>()
    const unique = merged.filter(p => {
        if (seen.has(p.id)) return false
        seen.add(p.id)
        return true
    })

    return unique.slice(0, 20)
}

export async function getAllParticipantsForScan(page: number = 1, pageSize: number = 20) {
    const session = await auth()
    if (!session || !session.user) return { participants: [], total: 0 }

    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'
    const volunteer = await checkVolunteerAccess()
    if (!isAdmin && !volunteer) return { participants: [], total: 0 }

    const supabase = await getSupabase()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: participants, count } = await supabase
        .from('hackathon_participants')
        .select('id, name, email, phone, role, is_checked_in, food_count, hackathon_teams(name, team_code)', { count: 'exact' })
        .order('name', { ascending: true })
        .range(from, to)

    // Also fetch all volunteers and merge them in, but only on page 1 so we don't duplicate them across pages
    let finalParticipants: any[] = participants || []
    
    if (page === 1) {
        const { data: vols } = await supabase
            .from('hackathon_volunteers')
            .select('*')
        
        if (vols && vols.length > 0) {
            const mappedVols = vols.map(v => ({
                id: v.id,
                name: v.name,
                email: v.email,
                phone: null,
                role: 'Staff Volunteer',
                is_checked_in: v.is_checked_in || false,
                food_count: v.food_count || 0,
                hackathon_teams: v.team_name ? { name: v.team_name, team_code: 'VOLUNTEER' } : null,
                is_volunteer: true
            }))
            finalParticipants = [...mappedVols, ...finalParticipants]
        }
    }

    return { participants: finalParticipants, total: (count || 0) + (page === 1 ? (finalParticipants.length - (participants?.length || 0)) : 0) }
}

// ==========================================
// VOLUNTEER MANAGEMENT
// ==========================================

export async function checkVolunteerAccess() {
    const session = await auth()
    if (!session || !session.user || !session.user.email) return null

    const supabase = await getSupabase()
    const { data } = await supabase
        .from('hackathon_volunteers')
        .select('id, name')
        .eq('email', session.user.email)
        .single()

    return data || null
}

export async function getVolunteers() {
    const session = await auth()
    if (!session || session.user.role !== 'super_admin') return []

    const supabase = await getSupabase()
    const { data: volunteers } = await supabase
        .from('hackathon_volunteers')
        .select('*')
        .order('created_at', { ascending: false })

    return volunteers || []
}

export async function addVolunteer(email: string, name: string = 'Volunteer', teamName: string = 'Registration & Stage Team', shift?: string, assignedTeamId?: string, extraFields?: { system_id?: string, section?: string, year?: string, mobile?: string, department?: string }) {
    const session = await auth()
    if (!session || !['super_admin', 'admin', 'student_lead'].includes(session.user.role as string)) return { error: 'Unauthorized' }

    const supabase = await getSupabase()
    const emailLower = email.trim().toLowerCase()
    const { error } = await supabase
        .from('hackathon_volunteers')
        .insert({ 
            email: emailLower, 
            name: name.trim(), 
            team_name: teamName,
            shift: shift || null,
            assigned_team_id: assignedTeamId || null,
            system_id: extraFields?.system_id || null,
            section: extraFields?.section || null,
            year: extraFields?.year || null,
            mobile: extraFields?.mobile || null,
            department: extraFields?.department || null
        })

    if (error) {
        if (error.code === '23505') return { error: "Volunteer already exists" }
        return { error: error.message }
    }

    // Auto-assign role: if teamName indicates Student Lead, assign student_lead role; otherwise volunteer
    const isStudentLead = teamName.toLowerCase().includes('student lead') || teamName.toLowerCase().includes('lead')
    const roleToAssign = isStudentLead ? 'student_lead' : 'volunteer'
    await supabase
        .from('hackathon_roles')
        .upsert({ email: emailLower, role: roleToAssign }, { onConflict: 'email' })

    revalidatePath('/hackathon-portal')
    return { success: true }
}

export async function uploadVolunteersData(formData: FormData) {
    const session = await auth()
    if (!session || !['admin', 'super_admin', 'student_lead'].includes(session.user.role as string)) {
        return { error: "Unauthorized" }
    }

    const file = formData.get('file') as File
    if (!file) return { error: "No file provided" }

    try {
        const buffer = await file.arrayBuffer()
        const workbook = xlsx.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows: any[] = xlsx.utils.sheet_to_json(sheet, { defval: '' })

        if (rows.length === 0) return { error: "No data found in file" }

        const supabase = await getSupabase()
        let insertedCount = 0
        let skippedCount = 0

        for (const row of rows) {
            const name = String(row['Name'] || row['name'] || '').trim()
            const email = String(row['Email'] || row['email'] || '').trim().toLowerCase()
            const role = String(row['Role'] || row['role'] || '').trim()
            const systemId = String(row['System ID'] || row['system_id'] || '').trim()
            const section = String(row['Section'] || row['section'] || '').trim()
            const year = String(row['Year'] || row['year'] || '').trim()
            const mobile = String(row['Mobile Number'] || row['Mobile'] || row['mobile'] || '').trim()
            const department = String(row['Department'] || row['department'] || '').trim()

            if (!email || !name) { skippedCount++; continue }

            const { error } = await supabase
                .from('hackathon_volunteers')
                .upsert({
                    email,
                    name,
                    team_name: role || 'Volunteer',
                    system_id: systemId || null,
                    section: section || null,
                    year: year || null,
                    mobile: mobile || null,
                    department: department || null,
                    shift: null,
                    assigned_team_id: null
                }, { onConflict: 'email' })

            if (error) { skippedCount++; continue }

            // Auto-assign role
            const isStudentLead = role.toLowerCase().includes('student lead') || role.toLowerCase().includes('lead')
            const roleToAssign = isStudentLead ? 'student_lead' : 'volunteer'
            await supabase
                .from('hackathon_roles')
                .upsert({ email, role: roleToAssign }, { onConflict: 'email' })

            insertedCount++
        }

        revalidatePath('/hackathon-portal')
        return { success: true, message: `✅ Uploaded ${insertedCount} volunteer(s). ${skippedCount > 0 ? `${skippedCount} skipped.` : ''}` }
    } catch (err: any) {
        return { error: err.message || "Failed to process file" }
    }
}

// ==========================================
// VOLUNTEER SCANNER ACTIONS
// ==========================================

export async function getAllVolunteersForScan() {
    const session = await auth()
    if (!session || !session.user) return { volunteers: [], total: 0 }

    const isAdmin = ['admin', 'super_admin', 'student_lead'].includes(session.user.role as string)
    if (!isAdmin) return { volunteers: [], total: 0 }

    const supabase = await getSupabase()
    const { data, count } = await supabase
        .from('hackathon_volunteers')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })

    return { volunteers: data || [], total: count || 0 }
}

export async function processVolunteerQrScan(volunteerId: string, action: 'checkin' | 'checkout') {
    const session = await auth()
    if (!session || !session.user) return { error: "Unauthorized" }

    const isAdmin = ['admin', 'super_admin', 'student_lead'].includes(session.user.role as string)
    if (!isAdmin) return { error: "Unauthorized" }

    const supabase = await getSupabase()

    const { data: volunteer } = await supabase
        .from('hackathon_volunteers')
        .select('*')
        .eq('id', volunteerId)
        .maybeSingle()

    if (!volunteer) return { error: "Volunteer not found. Invalid QR Code." }

    if (action === 'checkin') {
        if (volunteer.is_checked_in) return { message: "Already checked in", volunteer }
        const { error } = await supabase
            .from('hackathon_volunteers')
            .update({ is_checked_in: true, check_in_time: new Date().toISOString() })
            .eq('id', volunteerId)
        if (error) return { error: error.message }
        return { success: true, volunteer, message: `✅ ${volunteer.name} — Checked in successfully` }
    }

    if (action === 'checkout') {
        if (!volunteer.is_checked_in) return { message: "Not checked in", volunteer }
        const { error } = await supabase
            .from('hackathon_volunteers')
            .update({ is_checked_in: false })
            .eq('id', volunteerId)
        if (error) return { error: error.message }
        return { success: true, volunteer, message: `👋 ${volunteer.name} — Checked out successfully` }
    }

    return { error: "Invalid action" }
}

export async function removeVolunteer(id: string) {
    const session = await auth()
    if (!session || session.user.role !== 'super_admin') return { error: 'Unauthorized' }

    const supabase = await getSupabase()
    const { error } = await supabase
        .from('hackathon_volunteers')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/hackathon-portal')
    return { success: true }
}

// ==========================================
// ROLES MANAGEMENT
// ==========================================

export async function getHackathonRoles() {
    const session = await auth()
    if (!session || session.user.role !== 'super_admin') return []

    const supabase = await getSupabase()
    const { data: roles } = await supabase
        .from('hackathon_roles')
        .select('*')
        .order('created_at', { ascending: false })

    return roles || []
}

export async function addHackathonRole(email: string, role: string) {
    const session = await auth()
    if (!session || session.user.role !== 'super_admin') return { error: 'Unauthorized' }

    const supabase = await getSupabase()
    const { error } = await supabase
        .from('hackathon_roles')
        .insert({ 
            email: email.trim().toLowerCase(), 
            role: role
        })

    if (error) {
        if (error.code === '23505') return { error: "User already has a role assigned" }
        return { error: error.message }
    }
    revalidatePath('/admin/hackathon')
    return { success: true }
}

export async function removeHackathonRole(id: string) {
    const session = await auth()
    if (!session || session.user.role !== 'super_admin') return { error: 'Unauthorized' }

    const supabase = await getSupabase()
    const { error } = await supabase
        .from('hackathon_roles')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/admin/hackathon')
    return { success: true }
}

// ==========================================
// HACKATHON ROLE CHECK (for portal access)
// ==========================================

export type HackathonRole = 'organizer' | 'evaluator' | 'volunteer' | 'none'

export async function checkHackathonRole(): Promise<{ role: HackathonRole, user: any }> {
    const session = await auth()
    if (!session || !session.user) return { role: 'none', user: null }

    // Admins, Super admins, and Student Leads are organizers
    if (session.user.role === 'super_admin' || session.user.role === 'admin' || session.user.role === 'student_lead') {
        return { role: 'organizer', user: session.user }
    }

    // Check evaluator table
    const evaluator = await checkEvaluatorAccess()
    if (evaluator) return { role: 'evaluator', user: session.user }

    // Check volunteer table
    const volunteer = await checkVolunteerAccess()
    if (volunteer) return { role: 'volunteer', user: session.user }

    return { role: 'none', user: session.user }
}

// Check if an email has hackathon access (for login gating)
export async function isHackathonEmail(email: string): Promise<boolean> {
    const supabase = await getSupabase()

    // 1. Role explicit allows
    const { data: roleData } = await supabase
        .from('hackathon_roles')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle()
    if (roleData) return true

    // 2. Evaluator check
    const { data: evaluator } = await supabase
        .from('hackathon_evaluators')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle()

    if (evaluator) return true

    // 3. Volunteer check
    const { data: volunteer } = await supabase
        .from('hackathon_volunteers')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle()

    return !!volunteer
}
