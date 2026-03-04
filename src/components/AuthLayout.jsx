import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-primary-50 flex flex-col">
            <header className="p-6">
                <Link to="/" className="flex items-center gap-3 text-primary-500 w-fit">
                    <img src="/serveflow-logo.jpg" alt="ServeFlow" className="w-10 h-10 rounded-xl" />
                    <span className="text-xl font-bold tracking-tight text-navy-500">ServeFlow</span>
                </Link>
            </header>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>

            <footer className="p-6 text-center text-sm text-navy-300">
                &copy; {new Date().getFullYear()} ServeFlow. All rights reserved.
            </footer>
        </div>
    );
}
