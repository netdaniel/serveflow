import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../services/store';

export function Register() {
    const navigate = useNavigate();
    const { registerOrganization, registerMember, fetchOrganizations, organizationsList } = useStore();
    const [regType, setRegType] = useState('new'); // 'new' or 'join'
    const [formData, setFormData] = useState({
        orgName: '',
        orgId: '',
        adminName: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (regType === 'join') {
            fetchOrganizations();
        }
    }, [regType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (regType === 'new') {
                await registerOrganization(formData);
                navigate('/');
            } else {
                await registerMember({
                    orgId: formData.orgId,
                    name: formData.adminName,
                    email: formData.email,
                    password: formData.password
                });
                navigate('/pending');
            }
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
                <h2 className="text-2xl font-bold text-navy-500">Create Account</h2>
                <p className="text-navy-400 mt-2">Start using ServeFlow today</p>
            </div>

            <div className="flex gap-2 mb-6 p-1 bg-navy-50 rounded-xl">
                <button
                    onClick={() => setRegType('new')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${regType === 'new'
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-navy-400 hover:text-navy-600'
                        }`}
                >
                    New Organization
                </button>
                <button
                    onClick={() => setRegType('join')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${regType === 'join'
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-navy-400 hover:text-navy-600'
                        }`}
                >
                    Join Existing Team
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {regType === 'new' ? (
                    <div>
                        <label className="block text-sm font-medium text-navy-500 mb-1">Organization Name</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Grace Community Church"
                            value={formData.orgName}
                            onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-navy-500 mb-1">Select Church/Organization</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                            value={formData.orgId}
                            onChange={e => setFormData({ ...formData, orgId: e.target.value })}
                        >
                            <option value="">Select an organization...</option>
                            {organizationsList.map(org => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-navy-500 mb-1">
                        {regType === 'new' ? 'Admin Name' : 'Full Name'}
                    </label>
                    <input
                        required
                        type="text"
                        className="w-full px-4 py-2 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. Jane Doe"
                        value={formData.adminName}
                        onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-navy-500 mb-1">Work Email</label>
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
                    <label className="block text-sm font-medium text-navy-500 mb-1">Password</label>
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
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-navy-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-coral-500 hover:text-coral-400">
                    Log in
                </Link>
            </p>
        </div>
    );
}
