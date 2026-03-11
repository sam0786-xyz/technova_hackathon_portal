import { User, Phone, Mail, ShieldCheck } from "lucide-react"

interface POCCardProps {
    name: string
    email?: string | null
    phone?: string | null
    role?: string | null
}

export function POCCard({ name, email, phone, role }: POCCardProps) {
    // Show fallback message if no POC is assigned
    if (!name) {
        return (
            <div className="bg-white rounded-xl shadow-xl p-6 mt-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                    <div className="bg-gray-50 p-2 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">Event Coordinator</h3>
                </div>
                <p className="text-gray-500 text-sm">No coordinator assigned for this event.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-xl p-6 mt-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Event Coordinator</h3>
            </div>

            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="bg-gray-50 p-2 rounded-full mt-0.5">
                        <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Point of Contact</p>
                        <p className="font-medium text-gray-900">{name}</p>
                        {role && (
                            <p className="text-sm font-bold uppercase tracking-wider text-blue-600 mt-0.5">{role}</p>
                        )}
                    </div>
                </div>

                {email && (
                    <div className="flex items-start gap-3">
                        <div className="bg-gray-50 p-2 rounded-full mt-0.5">
                            <Mail className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Email</p>
                            <a href={`mailto:${email}`} className="font-medium text-blue-600 hover:text-blue-700 break-all block">
                                {email}
                            </a>
                        </div>
                    </div>
                )}

                {phone && (
                    <div className="flex items-start gap-3">
                        <div className="bg-gray-50 p-2 rounded-full mt-0.5">
                            <Phone className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Phone</p>
                            <a href={`tel:${phone}`} className="font-medium text-blue-600 hover:text-blue-700">
                                {phone}
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
