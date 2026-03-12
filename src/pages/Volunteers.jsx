import React, { useState, useRef } from 'react';
import { useStore } from '../services/store';
import { Search, Plus, User, Mail, Phone, Tag, Upload } from 'lucide-react';
import { cn } from '../utils/cn';
import { Modal } from '../components/Modal';

export function Volunteers() {
    const { volunteers, roles, groups, addVolunteer, updateVolunteer, deleteVolunteer, canEdit } = useStore();
    const [filter, setFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', roleIds: [] });
    const fileInputRef = useRef(null);

    const filteredVolunteers = volunteers.filter(v =>
        v.name.toLowerCase().includes(filter.toLowerCase()) ||
        v.email.toLowerCase().includes(filter.toLowerCase())
    );

    const getRoleName = (roleId) => roles.find(r => r.id === roleId)?.name || roleId;

    const handleEdit = (volunteer) => {
        setEditingId(volunteer.id);
        setFormData({
            name: volunteer.name,
            email: volunteer.email,
            phone: volunteer.phone,
            roleIds: volunteer.roles
        });
        setIsModalOpen(true);
    };

    const handleDelete = (volunteerId) => {
        if (window.confirm('Are you sure you want to remove this volunteer? This action cannot be undone.')) {
            deleteVolunteer(volunteerId);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: '', email: '', phone: '', roleIds: [] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return;

        if (editingId) {
            updateVolunteer(editingId, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                roles: formData.roleIds
            });
        } else {
            addVolunteer({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                roles: formData.roleIds
            });
        }

        handleClose();
    };

    const toggleRole = (roleId) => {
        setFormData(prev => ({
            ...prev,
            roleIds: prev.roleIds.includes(roleId)
                ? prev.roleIds.filter(id => id !== roleId)
                : [...prev.roleIds, roleId]
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

            const nameIndex = headers.indexOf('name');
            const emailIndex = headers.indexOf('email');
            const phoneIndex = headers.indexOf('phone');

            if (nameIndex === -1 || emailIndex === -1) {
                alert('CSV must contain "Name" and "Email" headers.');
                return;
            }

            let count = 0;
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const values = line.split(',').map(v => v.trim());
                if (values.length < 2) continue;

                const volunteer = {
                    name: values[nameIndex],
                    email: values[emailIndex],
                    phone: phoneIndex !== -1 ? values[phoneIndex] : '',
                    roles: [] // Default to no roles
                };

                // Basic validation
                if (volunteer.name && volunteer.email) {
                    addVolunteer(volunteer);
                    count++;
                }
            }
            alert(`Successfully imported ${count} volunteers.`);
            e.target.value = ''; // Reset input
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-500">Volunteers</h1>
                    <p className="text-navy-400">Manage your team members and their roles</p>
                </div>
                {canEdit && (
                    <div className="flex gap-3">
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="flex items-center gap-2 px-4 py-2 border border-navy-200 text-navy-500 rounded-xl hover:bg-navy-50 transition-colors font-medium shadow-sm active:scale-95 transform duration-100 bg-white"
                        >
                            <Upload size={20} />
                            Import CSV
                        </button>
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ name: '', email: '', phone: '', roleIds: [] });
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium shadow-sm active:scale-95 transform duration-100"
                        >
                            <Plus size={20} />
                            Add Volunteer
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-navy-100 overflow-hidden">
                <div className="p-4 border-b border-navy-100 bg-navy-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" size={20} />
                        <input
                            type="text"
                            placeholder="Search volunteers..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-navy-50 border-b border-navy-100 text-xs uppercase text-navy-400 font-semibold tracking-wider">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Roles</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-100">
                            {filteredVolunteers.map((volunteer) => (
                                <tr key={volunteer.id} className="hover:bg-navy-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 font-bold text-lg">
                                                {volunteer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-navy-500">{volunteer.name}</div>
                                                <div className="text-xs text-navy-400">Active</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-navy-400">
                                                <Mail size={14} className="text-navy-300" />
                                                {volunteer.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-navy-400">
                                                <Phone size={14} className="text-navy-300" />
                                                {volunteer.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {volunteer.roles.map(roleId => (
                                                <span key={roleId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-navy-50 text-navy-500 text-xs font-medium border border-navy-200">
                                                    {getRoleName(roleId)}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {canEdit ? (
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleEdit(volunteer)}
                                                    className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(volunteer.id)}
                                                    className="text-coral-500 hover:text-coral-600 font-medium text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-navy-300 text-sm">View Only</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredVolunteers.length === 0 && (
                        <div className="p-12 text-center text-navy-400">
                            No volunteers found.
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingId ? "Edit Volunteer" : "Add New Volunteer"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-navy-500 mb-1">Full Name</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-navy-500 mb-1">Email Address</label>
                        <input
                            required
                            type="email"
                            className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. john@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-navy-500 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. 555-0123"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-navy-500 mb-2">Qualified Roles</label>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {/* Group by groupId */}
                            {groups.map(group => {
                                const groupRoles = roles.filter(r => r.groupId === group.id);
                                if (groupRoles.length === 0) return null;

                                return (
                                    <div key={group.id}>
                                        <h4 className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">{group.name}</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {groupRoles.map(role => (
                                                <label key={role.id} className="flex items-center gap-2 p-2 border border-navy-200 rounded-lg cursor-pointer hover:bg-navy-50 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-navy-300 text-primary-500 focus:ring-primary-500"
                                                        checked={formData.roleIds.includes(role.id)}
                                                        onChange={() => toggleRole(role.id)}
                                                    />
                                                    <span className="text-sm text-navy-500">{role.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Orphan Roles */}
                            {roles.some(r => !r.groupId || !groups.find(g => g.id === r.groupId)) && (
                                <div>
                                    <h4 className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Other</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {roles.filter(r => !r.groupId || !groups.find(g => g.id === r.groupId)).map(role => (
                                            <label key={role.id} className="flex items-center gap-2 p-2 border border-navy-200 rounded-lg cursor-pointer hover:bg-navy-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-navy-300 text-primary-500 focus:ring-primary-500"
                                                    checked={formData.roleIds.includes(role.id)}
                                                    onChange={() => toggleRole(role.id)}
                                                />
                                                <span className="text-sm text-navy-500">{role.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-navy-200 text-navy-500 font-medium rounded-lg hover:bg-navy-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                        >
                            {editingId ? "Save Changes" : "Add Volunteer"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
