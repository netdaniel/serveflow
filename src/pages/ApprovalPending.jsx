import React from 'react';
import { useStore } from '../services/store';
import { Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ApprovalPending() {
    const { logout, profile } = useStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/landing');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-primary-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-navy-100 p-8 text-center">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6">
                    <Clock size={40} className="animate-pulse" />
                </div>

                <h1 className="text-2xl font-bold text-navy-600 mb-4">Registration Pending</h1>

                <p className="text-navy-400 mb-8 leading-relaxed">
                    Thanks for joining <span className="font-bold text-primary-600">{profile?.organizations?.name || 'the team'}</span>!
                    Your account is currently waiting for administrator approval.
                    You'll be able to access the dashboard once an admin has reviewed your request.
                </p>

                <div className="space-y-4">
                    <div className="p-4 bg-navy-50 rounded-2xl text-sm text-navy-500 italic">
                        "Wait for the Lord; be strong and take heart and wait for the Lord." - Psalm 27:14
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full py-4 flex items-center justify-center gap-2 bg-white text-navy-500 font-bold rounded-2xl hover:bg-navy-50 border border-navy-100 transition-all"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
