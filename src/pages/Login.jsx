import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../services/store';

export function Login() {
    const navigate = useNavigate();
    const { login, loading } = useStore();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/'); // Redirect to dashboard
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-navy-100">
            <div className="mb-8 text-center">
                <img src="/serveflow-logo.jpg" alt="ServeFlow" className="w-16 h-16 rounded-xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-navy-500">Welcome Back</h2>
                <p className="text-navy-400 mt-2">Sign in to ServeFlow</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-navy-500 mb-1">Email Address</label>
                    <input
                        required
                        type="email"
                        className="w-full px-4 py-2 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="name@organization.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="block text-sm font-medium text-navy-500">Password</label>
                        <a href="#" className="text-sm font-medium text-coral-500 hover:text-coral-400">Forgot?</a>
                    </div>
                    <input
                        required
                        type="password"
                        className="w-full px-4 py-2 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-navy-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-coral-500 hover:text-coral-400">
                    Get started
                </Link>
            </p>
        </div>
    );
}
