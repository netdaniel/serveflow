import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { UserCheck, UserX, Clock, Search } from 'lucide-react';
import { supabase } from '../services/supabase';

export function ManageMembers() {
    const { profile, updateMemberStatus, demoMode } = useStore();
    const [pendingMembers, setPendingMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPendingMembers = async () => {
        if (!profile?.org_id) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('org_id', profile.org_id)
                .eq('status', 'pending');

            if (error) {
                if (error.message?.includes('column "status" does not exist') || error.code === 'PGRST204') {
                    console.log('Status column missing, no pending members available');
                    setPendingMembers([]);
                    return;
                }
                throw error;
            }
            setPendingMembers(data || []);
        } catch (err) {
            console.error('Error fetching pending members:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingMembers();
    }, [profile?.org_id]);

    const handleAction = async (userId, status) => {
        try {
            await updateMemberStatus(userId, status);
            setPendingMembers(prev => prev.filter(m => m.id !== userId));
        } catch (err) {
            alert('Failed to update member status');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-navy-600">Pending Requests</h2>
                    <p className="text-navy-400">Review and approve new team members</p>
                </div>
                <div className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl font-bold text-sm">
                    {pendingMembers.length} Request{pendingMembers.length !== 1 ? 's' : ''}
                </div>
            </div>

            {pendingMembers.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-navy-200">
                    <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center text-navy-300 mx-auto mb-4">
                        <Clock size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-navy-500">No Pending Requests</h3>
                    <p className="text-navy-400 mt-1">When new members join your church, they'll appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingMembers.map((member) => (
                        <div key={member.id} className="bg-white p-6 rounded-3xl border border-navy-100 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 font-bold text-xl">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-navy-600 text-lg">{member.name}</h4>
                                    <p className="text-sm text-navy-400">Requested on {new Date(member.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleAction(member.id, 'rejected')}
                                    className="p-3 text-coral-500 hover:bg-coral-50 rounded-2xl transition-all group"
                                    title="Reject Request"
                                >
                                    <UserX size={24} />
                                </button>
                                <button
                                    onClick={() => handleAction(member.id, 'approved')}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 shadow-lg shadow-primary-200 transition-all active:scale-95"
                                >
                                    <UserCheck size={20} />
                                    Approve Member
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
