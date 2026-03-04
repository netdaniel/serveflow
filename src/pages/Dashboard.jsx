import React from 'react';
import { Users, Calendar, Settings, ArrowRight } from 'lucide-react';
import { useStore } from '../services/store';
import { Link } from 'react-router-dom';

function QuickActionCard({ icon: Icon, title, description, to, color }) {
    return (
        <Link to={to} className="group block bg-white p-6 rounded-2xl shadow-sm border border-navy-100 hover:shadow-md transition-all duration-200">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={24} className="text-white" />
            </div>
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-navy-500 text-lg group-hover:text-primary-500 transition-colors">{title}</h3>
                <ArrowRight size={20} className="text-navy-200 group-hover:text-primary-400 transition-colors" />
            </div>
            <p className="text-navy-400 text-sm mt-2">{description}</p>
        </Link>
    );
}

export function Dashboard() {
    const { user, volunteers, events, roles } = useStore();

    const stats = [
        { label: 'Total Volunteers', value: volunteers.length, icon: Users, color: 'text-primary-500', bg: 'bg-primary-50' },
        { label: 'Upcoming Services', value: events.length, icon: Calendar, color: 'text-coral-500', bg: 'bg-coral-50' },
        { label: 'Ministry Areas', value: roles.length, icon: Settings, color: 'text-navy-500', bg: 'bg-navy-50' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-coral-400 opacity-20 rounded-full -ml-8 -mb-8 blur-2xl"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'}!</h1>
                    <p className="text-primary-100 max-w-xl">
                        Here's what's happening in your ServeFlow dashboard today. You have {volunteers.length} active volunteers and {events.length} upcoming services scheduled.
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-navy-100 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon size={24} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-navy-400 text-sm font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-navy-500">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-navy-500 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <QuickActionCard
                        icon={Users}
                        title="Add Volunteer"
                        description="Register a new team member to your roster."
                        to="/volunteers"
                        color="bg-primary-500"
                    />
                    <QuickActionCard
                        icon={Calendar}
                        title="Schedule Service"
                        description="Plan your next service or event."
                        to="/schedule"
                        color="bg-coral-500"
                    />
                    <QuickActionCard
                        icon={Settings}
                        title="Manage Areas"
                        description="Configure ministry roles and groups."
                        to="/roles"
                        color="bg-navy-500"
                    />
                </div>
            </div>
        </div>
    );
}
