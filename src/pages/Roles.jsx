import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Search, Plus, Trash2, Edit2, Layers, Folder, Settings } from 'lucide-react';
import { Modal } from '../components/Modal';

export function Roles() {
    const { roles, groups, addRole, updateRole, deleteRole, addGroup, updateGroup, deleteGroup } = useStore();
    const [filter, setFilter] = useState('');

    // Role Modal State
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [roleFormData, setRoleFormData] = useState({ name: '', groupId: '' });

    // Group Modal State
    const [isGroupManagementOpen, setIsGroupManagementOpen] = useState(false);
    const [isGroupEditModalOpen, setIsGroupEditModalOpen] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [groupFormData, setGroupFormData] = useState({ name: '' });

    const getGroupName = (groupId) => groups.find(g => g.id === groupId)?.name || 'Other';

    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(filter.toLowerCase()) ||
        getGroupName(r.groupId).toLowerCase().includes(filter.toLowerCase())
    );

    // Group roles by group
    const groupedRoles = groups.reduce((acc, group) => {
        const groupRoles = filteredRoles.filter(r => r.groupId === group.id);
        if (groupRoles.length > 0) {
            acc[group.name] = groupRoles;
        }
        return acc;
    }, {});

    // Add roles with no group or invalid group
    const orphanRoles = filteredRoles.filter(r => !r.groupId || !groups.find(g => g.id === r.groupId));
    if (orphanRoles.length > 0) {
        groupedRoles['Other'] = orphanRoles;
    }

    // Role Handlers
    const handleEditRole = (role) => {
        setEditingRoleId(role.id);
        setRoleFormData({ name: role.name, groupId: role.groupId || '' });
        setIsRoleModalOpen(true);
    };

    const handleDeleteRole = (id) => {
        if (window.confirm('Are you sure you want to remove this role?')) {
            deleteRole(id);
        }
    };

    const handleCloseRoleModal = () => {
        setIsRoleModalOpen(false);
        setEditingRoleId(null);
        setRoleFormData({ name: '', groupId: '' });
    };

    const handleSubmitRole = (e) => {
        e.preventDefault();
        if (!roleFormData.name) return;

        const roleData = {
            name: roleFormData.name,
            groupId: roleFormData.groupId
        };

        if (editingRoleId) {
            updateRole(editingRoleId, roleData);
        } else {
            addRole(roleData);
        }

        handleCloseRoleModal();
    };

    // Group Handlers
    const handleEditGroup = (group) => {
        setEditingGroupId(group.id);
        setGroupFormData({ name: group.name });
        setIsGroupEditModalOpen(true);
    };

    const handleDeleteGroup = (id) => {
        if (window.confirm('Are you sure you want to delete this team? Roles associated with this team will be moved to "Other".')) {
            deleteGroup(id);
            // Optionally update roles here to remove groupId
        }
    };

    const handleCloseGroupEditModal = () => {
        setIsGroupEditModalOpen(false);
        setEditingGroupId(null);
        setGroupFormData({ name: '' });
    };

    const handleSubmitGroup = (e) => {
        e.preventDefault();
        if (!groupFormData.name) return;

        if (editingGroupId) {
            updateGroup(editingGroupId, { name: groupFormData.name });
        } else {
            addGroup({ name: groupFormData.name });
        }

        handleCloseGroupEditModal();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-500">Areas & Roles</h1>
                    <p className="text-navy-400">Manage the different areas/teams where volunteers can serve</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsGroupManagementOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-navy-200 text-navy-500 rounded-xl hover:bg-navy-50 transition-colors font-medium shadow-sm active:scale-95 transform duration-100 bg-white"
                    >
                        <Settings size={20} />
                        Manage Teams
                    </button>
                    <button
                        onClick={() => {
                            setEditingRoleId(null);
                            setRoleFormData({ name: '', groupId: '' });
                            setIsRoleModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium shadow-sm active:scale-95 transform duration-100"
                    >
                        <Plus size={20} />
                        Add Role
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-navy-100 overflow-hidden">
                <div className="p-4 border-b border-navy-100 bg-navy-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" size={20} />
                        <input
                            type="text"
                            placeholder="Search roles or teams..."
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
                                <th className="px-6 py-4">Role Name</th>
                                <th className="px-6 py-4">Team</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-100">
                            {Object.entries(groupedRoles).map(([groupName, roles]) => (
                                <React.Fragment key={groupName}>
                                    <tr className="bg-navy-50/50">
                                        <td colSpan="3" className="px-6 py-2">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-navy-400">
                                                <Folder size={16} />
                                                {groupName}
                                            </div>
                                        </td>
                                    </tr>
                                    {roles.map((role) => (
                                        <tr key={role.id} className="hover:bg-navy-50 transition-colors">
                                            <td className="px-6 py-4 pl-10">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium text-navy-500">{role.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-navy-400">
                                                {getGroupName(role.groupId)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleEditRole(role)}
                                                        className="p-2 text-navy-300 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRole(role.id)}
                                                        className="p-2 text-navy-300 hover:text-coral-500 hover:bg-coral-50 rounded-full transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    {filteredRoles.length === 0 && (
                        <div className="p-12 text-center text-navy-400">
                            No roles found.
                        </div>
                    )}
                </div>
            </div>

            {/* Role Add/Edit Modal */}
            <Modal
                isOpen={isRoleModalOpen}
                onClose={handleCloseRoleModal}
                title={editingRoleId ? "Edit Role" : "Add New Role"}
            >
                <form onSubmit={handleSubmitRole} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-navy-500 mb-1">Role Name</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Electric Guitar"
                            value={roleFormData.name}
                            onChange={e => setRoleFormData({ ...roleFormData, name: e.target.value })}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-navy-500 mb-1">Team</label>
                        <select
                            className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                            value={roleFormData.groupId}
                            onChange={e => setRoleFormData({ ...roleFormData, groupId: e.target.value })}
                        >
                            <option value="">Select a team...</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={handleCloseRoleModal}
                            className="flex-1 px-4 py-2 border border-navy-200 text-navy-500 font-medium rounded-lg hover:bg-navy-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                        >
                            {editingRoleId ? "Save Changes" : "Create Role"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Manage Groups List Modal */}
            <Modal
                isOpen={isGroupManagementOpen}
                onClose={() => setIsGroupManagementOpen(false)}
                title="Manage Teams"
            >
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-navy-400">Create, edit, or remove teams.</p>
                        <button
                            onClick={() => {
                                setEditingGroupId(null);
                                setGroupFormData({ name: '' });
                                setIsGroupEditModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            <Plus size={16} />
                            Add Team
                        </button>
                    </div>

                    <div className="border border-navy-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-navy-50 text-navy-400 font-semibold">
                                <tr>
                                    <th className="px-4 py-2">Team Name</th>
                                    <th className="px-4 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-100">
                                {groups.map(group => (
                                    <tr key={group.id} className="hover:bg-navy-50">
                                        <td className="px-4 py-3 text-navy-500 font-medium">{group.name}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditGroup(group)}
                                                    className="text-primary-500 hover:text-primary-600"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGroup(group.id)}
                                                    className="text-coral-500 hover:text-coral-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {groups.length === 0 && (
                                    <tr>
                                        <td colSpan="2" className="px-4 py-4 text-center text-navy-400">No teams created yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            onClick={() => setIsGroupManagementOpen(false)}
                            className="px-4 py-2 border border-navy-200 text-navy-500 font-medium rounded-lg hover:bg-navy-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add/Edit Group Modal (Nested) */}
            {isGroupEditModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleCloseGroupEditModal}
                    />
                    <div className="relative bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {editingGroupId ? 'Edit Team' : 'Add New Team'}
                        </h3>
                        <form onSubmit={handleSubmitGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. Traffic Control"
                                    value={groupFormData.name}
                                    onChange={e => setGroupFormData({ ...groupFormData, name: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseGroupEditModal}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
