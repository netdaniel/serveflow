import React, { useEffect, useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Layout as LayoutIcon, Users, Calendar, Settings, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { useStore } from '../services/store';

export function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile, organization, logout, demoMode, canEdit } = useStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Filter nav items based on user role
    const navItems = [
        { icon: LayoutIcon, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Volunteers', path: '/volunteers' },
        { icon: Calendar, label: 'Schedule', path: '/schedule' },
        { icon: Settings, label: 'Areas', path: '/roles' },
        // Only show Manage Members for admins
        ...(canEdit ? [{ icon: ShieldCheck, label: 'Manage Members', path: '/manage-members' }] : []),
    ];

    useEffect(() => {
        if (!user) {
            navigate('/landing');
            return;
        }

        if (profile && profile.status === 'pending') {
            navigate('/pending');
        }
    }, [user, profile, navigate]);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

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
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-white border-r border-navy-100 flex-col">
                <SidebarContent 
                    organization={organization} 
                    navItems={navItems} 
                    handleLogout={handleLogout} 
                />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside className={cn(
                "lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-navy-100 flex-col z-50 transform transition-transform duration-300",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between p-4 border-b border-navy-100">
                    <div className="flex items-center gap-3">
                        <img src="/serveflow-logo.jpg" alt="ServeFlow" className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                            <h1 className="text-lg font-bold text-navy-500">ServeFlow</h1>
                        </div>
                    </div>
                    <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 text-navy-400 hover:text-navy-600"
                    >
                        <X size={24} />
                    </button>
                </div>
                <SidebarContent 
                    organization={organization} 
                    navItems={navItems} 
                    handleLogout={handleLogout}
                    isMobile
                />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto w-full">
                {/* Demo Mode Banner */}
                {demoMode && (
                    <div className="bg-coral-500 text-white px-4 lg:px-8 py-3 text-center text-sm font-medium">
                        <span className="inline-flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            Demo Mode - Data won't be saved. Set up Supabase to persist data.
                        </span>
                    </div>
                )}

                <header className="h-16 bg-white border-b border-navy-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-navy-500 hover:bg-navy-50 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg font-semibold text-navy-500">
                            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-navy-500">{user?.name || 'User'}</p>
                            <p className="text-xs text-navy-400">{canEdit ? 'Admin' : 'Team Member'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 font-bold border border-primary-200">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

// Extracted sidebar content component
function SidebarContent({ organization, navItems, handleLogout, isMobile }) {
    const location = useLocation();
    
    return (
        <>
            {!isMobile && (
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
            )}

            <nav className="flex-1 px-4 space-y-1 py-4">
                {navItems.map((item) => {
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

            <div className="p-4 border-t border-navy-100 mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-navy-400 hover:text-coral-500 hover:bg-coral-50 rounded-xl transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </>
    );
}
