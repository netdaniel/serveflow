import React, { useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Layout as LayoutIcon, Users, Calendar, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';
import { useStore } from '../services/store';

const NAV_ITEMS = [
    { icon: LayoutIcon, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Volunteers', path: '/volunteers' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: Settings, label: 'Areas', path: '/roles' },
    { icon: ShieldCheck, label: 'Manage Members', path: '/manage-members' },
];

export function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile, organization, logout, demoMode } = useStore();

    useEffect(() => {
        if (!user) {
            navigate('/landing');
            return;
        }

        if (profile && profile.status === 'pending') {
            navigate('/pending');
        }
    }, [user, profile, navigate]);

    // Also prevent rendering if not logged in. 
    // If profile exists, only block if status is explicitly pending.
    if (!user) return null;
    if (profile && profile.status === 'pending') return null;

    const handleLogout = () => {
        logout();
        navigate('/landing');
    };

    return (
        <div className="flex h-screen bg-navy-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-navy-100 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <img src="/serveflow-logo.jpg" alt="ServeFlow" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                            <h1 className="text-xl font-bold text-navy-500">
                                ServeFlow
                            </h1>
                            <p className="text-xs text-navy-400">{organization?.name || 'Volunteer Scheduling'}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                                    isActive
                                        ? "bg-primary-50 text-primary-600 shadow-sm"
                                        : "text-navy-400 hover:bg-navy-50 hover:text-navy-500"
                                )}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-navy-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-navy-400 hover:text-coral-500 hover:bg-coral-50 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Demo Mode Banner */}
                {demoMode && (
                    <div className="bg-coral-500 text-white px-8 py-3 text-center text-sm font-medium">
                        <span className="inline-flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            Demo Mode - Data won't be saved. Set up Supabase to persist data.
                        </span>
                    </div>
                )}

                <header className="h-16 bg-white border-b border-navy-100 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-navy-500">
                        {NAV_ITEMS.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-navy-500">{user?.name || 'User'}</p>
                                <p className="text-xs text-navy-400">Admin</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 font-bold border border-primary-200">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
