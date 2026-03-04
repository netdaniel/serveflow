import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Users, Calendar, Shield, Zap } from 'lucide-react';

export function Landing() {
    return (
        <div className="min-h-screen bg-navy-50 font-sans selection:bg-primary-100 selection:text-primary-600">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-navy-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/serveflow-logo.jpg" alt="ServeFlow" className="w-10 h-10 rounded-xl" />
                        <span className="text-xl font-bold bg-gradient-to-r from-navy-600 to-primary-600 bg-clip-text text-transparent">ServeFlow</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-navy-400 font-medium">
                        <a href="#features" className="hover:text-primary-500 transition-colors">Features</a>
                        <a href="#pricing" className="hover:text-primary-500 transition-colors">Pricing</a>
                        <a href="#testimonials" className="hover:text-primary-500 transition-colors">Success Stories</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-navy-500 font-semibold hover:text-primary-500 transition-colors">Log In</Link>
                        <Link to="/register" className="bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-600 shadow-lg shadow-primary-200 transition-all active:scale-95">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-100/30 blur-[120px] -z-10 rounded-full"></div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-navy-600 mb-6 leading-tight tracking-tight">
                        Empower Your Team. <br />
                        <span className="text-primary-500 italic">Simplify Your Roster.</span>
                    </h1>
                    <p className="text-xl text-navy-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        The modern scheduling solution for churches and non-profits.
                        Spend less time on spreadsheets and more time on your mission.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-500 text-white text-lg font-bold rounded-2xl hover:bg-primary-600 shadow-xl shadow-primary-200 transition-all flex items-center justify-center gap-3 group">
                            Start Free Trial <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-navy-600 text-lg font-bold rounded-2xl hover:bg-navy-50 border border-navy-100 transition-all">
                            Explore Features
                        </a>
                    </div>

                    {/* App Preview */}
                    <div className="mt-20 relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-coral-500 rounded-3xl blur opacity-25"></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-navy-100 aspect-video md:aspect-[21/9] flex items-center justify-center">
                            <img src="/serveflow-logo.jpg" alt="Dashboard Preview" className="w-32 h-32 opacity-20" />
                            <div className="absolute bottom-6 left-6 text-left">
                                <div className="p-4 bg-white/90 backdrop-blur rounded-xl shadow-xl border border-navy-50">
                                    <p className="text-sm font-bold text-navy-600">Upcoming Sunday</p>
                                    <p className="text-xs text-primary-500 font-medium">95% Positions Filled</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-primary-600 font-bold tracking-widest uppercase text-sm">Powerful Tools</span>
                        <h2 className="text-4xl font-extrabold text-navy-600 mt-2">Everything You Need to Lead</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        {[
                            { icon: Users, title: 'Team Management', desc: 'Easily organize volunteers by role, skill, and availability.' },
                            { icon: Calendar, title: 'Smart Scheduling', desc: 'Avoid conflicts and double-bookings with our intelligent builder.' },
                            { icon: Zap, title: 'Quick Notifications', desc: 'Reach your whole team instantly via email and app alerts.' }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-navy-50/50 hover:bg-white border border-transparent hover:border-navy-100 transition-all hover:shadow-xl group">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-500 mb-6 shadow-sm border border-navy-50 group-hover:scale-110 transition-transform">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-navy-600 mb-3 break-words">{item.title}</h3>
                                <p className="text-navy-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-navy-50/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-primary-50 overflow-hidden relative">
                        <div className="bg-primary-500 p-8 text-center text-white">
                            <h3 className="text-2xl font-bold mb-2">Unlimited Access</h3>
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-4xl font-extrabold">R120</span>
                                <span className="text-primary-100">/month</span>
                            </div>
                        </div>
                        <div className="p-8">
                            <ul className="space-y-4 mb-10">
                                {[
                                    'Unlimited Volunteers',
                                    'Multi-Area Management',
                                    'Automatic Conflict Checks',
                                    'Secure Data Storage',
                                    'Priority Support'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-navy-500 font-medium">
                                        <CheckCircle2 size={18} className="text-primary-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register" className="block text-center w-full py-4 bg-navy-600 text-white font-bold rounded-2xl hover:bg-navy-700 transition-all shadow-xl shadow-navy-100">
                                Start Your Journey
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-navy-100 bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 grayscale brightness-50">
                        <img src="/serveflow-logo.jpg" alt="ServeFlow" className="w-8 h-8 rounded-lg" />
                        <span className="text-lg font-bold text-navy-500">ServeFlow</span>
                    </div>
                    <p className="text-navy-300 text-sm italic">Designed for those who serve. Built for impact.</p>
                    <p className="text-navy-400 text-sm">© {new Date().getFullYear()} ServeFlow. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
