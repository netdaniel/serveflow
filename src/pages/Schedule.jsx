import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { Calendar as CalendarIcon, Clock, ChevronRight, UserPlus, CheckCircle, AlertCircle, Trash2, Edit2, Mail, X, MessageCircle, Printer, Paperclip, Music, Video } from 'lucide-react';
import { cn } from '../utils/cn';
import { Modal } from '../components/Modal';
import FileUpload from '../components/FileUpload';
import MusicPlaylist from '../components/MusicPlaylist';

export function Schedule() {
    const { events, assignments, roles, volunteers, assignVolunteer, addEvent, updateEvent, deleteEvent, groups, updateAssignment, getFileAttachments, getEventPlaylists, loading, canEdit } = useStore();
    
    // Track assignment length to force re-render when assignments change
    const assignmentCount = assignments.length;
    
    // Show loading state while data is loading
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-navy-500">Loading events...</p>
                </div>
            </div>
        );
    }
    const [expandedEvent, setExpandedEvent] = useState(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [formData, setFormData] = useState({ title: '', date: '', time: '' });
    const [eventAttachments, setEventAttachments] = useState({});
    const [eventPlaylists, setEventPlaylists] = useState({});

    // Assignment State
    const [assigningRole, setAssigningRole] = useState(null); // { eventId, roleId }
    const [selectedVolunteerId, setSelectedVolunteerId] = useState('');

    // Email State
    const [emailData, setEmailData] = useState({
        subject: '',
        message: '',
        recipients: [] // Array of { email, name }
    });
    const [recipientInput, setRecipientInput] = useState('');

    // Load attachments and playlists when an event is expanded
    useEffect(() => {
        const loadData = async () => {
            if (expandedEvent) {
                // Load attachments
                const attachments = await getFileAttachments(expandedEvent);
                setEventAttachments(prev => ({
                    ...prev,
                    [expandedEvent]: attachments
                }));

                // Load playlists
                const playlists = await getEventPlaylists(expandedEvent);
                setEventPlaylists(prev => ({
                    ...prev,
                    [expandedEvent]: playlists
                }));
            }
        };

        loadData();
    }, [expandedEvent, getFileAttachments, getEventPlaylists]);

    const getEventAssignments = (eventId) => {
        return assignments.filter(a => a.event_id === eventId);
    };

    const getVolunteer = (volunteerId) => volunteers.find(v => v.id === volunteerId);
    const getRole = (roleId) => roles.find(r => r.id === roleId);



    const handleAssignClick = (eventId, roleId) => {
        setAssigningRole({ eventId, roleId });
        setSelectedVolunteerId('');
    };

    const handleConfirmAssign = async (e) => {
        e.preventDefault();
        if (assigningRole && selectedVolunteerId) {
            try {
                await assignVolunteer(assigningRole.eventId, assigningRole.roleId, selectedVolunteerId);
                setAssigningRole(null);
                setSelectedVolunteerId('');
                
                // The global state update should trigger a re-render automatically
                // No need to manually refresh as the store handles updates
            } catch (error) {
                console.error('Error assigning volunteer:', error);
            }
        }
    };

    const handleEditEvent = (e, event) => {
        e.stopPropagation();
        setEditingEventId(event.id);
        setFormData({
            title: event.title,
            date: event.date,
            time: event.time
        });
        setIsEventModalOpen(true);
    };

    const handleEmailTeam = (e, event) => {
        e.stopPropagation();
        const eventAssignments = getEventAssignments(event.id);
        const recipients = eventAssignments
            .map(a => getVolunteer(a.volunteerId))
            .filter(v => v) // Filter out undefined if volunteer deleted
            .map(v => ({ email: v.email, name: v.name }));

        // Remove duplicates
        const uniqueRecipients = Array.from(new Map(recipients.map(item => [item.email, item])).values());

        // Generate Roster Text
        const rosterDetails = eventAssignments.map(a => {
            const role = getRole(a.roleId);
            const volunteer = getVolunteer(a.volunteerId);
            const group = groups.find(g => g.id === a.areaId);
            const designatedRole = roles.find(r => r.id === a.designatedRoleId);

            if (!role || !volunteer) return null;

            let details = [];
            if (group) details.push(group.name);
            if (designatedRole) details.push(designatedRole.name);

            return `- ${role.name}: ${volunteer.name} ${details.length ? `(${details.join(' - ')})` : ''}`;
        }).filter(Boolean).join('\n');

        setEmailData({
            subject: `Schedule: ${event.title} on ${event.date}`,
            message: `Hi Team,\n\nHere is the schedule for ${event.title} on ${event.date} at ${event.time}.\n\nRoster:\n${rosterDetails || 'No assignments yet.'}\n\nPlease let us know if you have any questions.\n\nBest,\nChurch Team`,
            recipients: uniqueRecipients
        });
        setIsEmailModalOpen(true);
    };

    const handleAddRecipient = () => {
        if (!recipientInput) return;

        let newRecipient;
        // Check if input matches a volunteer name or email
        const volunteer = volunteers.find(v =>
            v.email.toLowerCase() === recipientInput.toLowerCase() ||
            v.name.toLowerCase() === recipientInput.toLowerCase()
        );

        if (volunteer) {
            newRecipient = { email: volunteer.email, name: volunteer.name };
        } else if (recipientInput.includes('@')) {
            newRecipient = { email: recipientInput, name: recipientInput.split('@')[0] };
        } else {
            alert("Please enter a valid email or volunteer name.");
            return;
        }

        // Prevent duplicates
        if (!emailData.recipients.some(r => r.email === newRecipient.email)) {
            setEmailData(prev => ({
                ...prev,
                recipients: [...prev.recipients, newRecipient]
            }));
        }
        setRecipientInput('');
    };

    const handleRemoveRecipient = (email) => {
        setEmailData(prev => ({
            ...prev,
            recipients: prev.recipients.filter(r => r.email !== email)
        }));
    };

    const handleSendEmail = (e) => {
        e.preventDefault();
        if (emailData.recipients.length === 0) {
            alert("Please add at least one recipient.");
            return;
        }

        alert(`Email sent to ${emailData.recipients.length} recipients!\nSubject: ${emailData.subject}`);
        setIsEmailModalOpen(false);
    };

    const handleDeleteEvent = (e, eventId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this event? All assignments will be removed.")) {
            deleteEvent(eventId);
            if (expandedEvent === eventId) setExpandedEvent(null);
        }
    };

    const handleCloseEventModal = () => {
        setIsEventModalOpen(false);
        setEditingEventId(null);
        setFormData({ title: '', date: '', time: '' });
    };

    const handleSubmitEvent = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.date || !formData.time) return;

        if (editingEventId) {
            updateEvent(editingEventId, {
                title: formData.title,
                date: formData.date,
                time: formData.time
            });
        } else {
            addEvent({
                title: formData.title,
                date: formData.date,
                time: formData.time
            });
        }

        handleCloseEventModal();
    };

    // Event Selection State
    const [selectedEventIds, setSelectedEventIds] = useState(new Set());

    const toggleEventSelection = (e, eventId) => {
        e.stopPropagation();
        const newSelection = new Set(selectedEventIds);
        if (newSelection.has(eventId)) {
            newSelection.delete(eventId);
        } else {
            newSelection.add(eventId);
        }
        setSelectedEventIds(newSelection);
    };

    const formatScheduleText = () => {
        const selected = events.filter(e => selectedEventIds.has(e.id))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return selected.map(event => {
            // Get all assignments for this event
            const eventAssignments = assignments.filter(a => a.event_id === event.id);
            const assignmentsText = eventAssignments.map(a => {
                const role = getRole(a.role_id);
                const volunteer = getVolunteer(a.volunteer_id);
                const group = groups.find(g => g.id === a.areaId);
                const designatedRole = roles.find(r => r.id === a.designatedRoleId);

                if (!role || !volunteer) return null;

                let details = [];
                if (group) details.push(group.name);
                if (designatedRole) details.push(designatedRole.name);

                return `- ${role.name}: ${volunteer.name} ${details.length ? `(${details.join(' - ')})` : ''}`;
            }).filter(Boolean).join('\n');

            // Get event playlists with links
            const playlists = eventPlaylists[event.id] || [];
            const playlistsText = playlists.length > 0
                ? `\n🎵 Music Playlists (${playlists.length}): \n${playlists.map(pl => `  • ${pl.platform}: ${pl.playlist_name || 'Playlist'}\n    Link: ${pl.playlist_url}`).join('\n')}`
                : '\n🎵 No playlists';

            return `*${event.title}*\n📅 ${event.date} at ${event.time}\n${assignmentsText || '(No assignments)'}${playlistsText}`;
        }).join('\n\n');
    };

    const handleShareWhatsApp = () => {
        const text = formatScheduleText();
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleShareEmail = async () => {
        // Get selected events
        const selectedEvents = events.filter(e => selectedEventIds.has(e.id))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Format the schedule text
        let text = selectedEvents.map(event => {
            // Get all assignments for this event
            const eventAssignments = assignments.filter(a => a.event_id === event.id);
            const assignmentsText = eventAssignments.map(a => {
                const role = getRole(a.role_id); // Using correct field name
                const volunteer = getVolunteer(a.volunteer_id); // Using correct field name

                if (!role || !volunteer) return null;
                return `- ${role.name}: ${volunteer.name}`;
            }).filter(Boolean).join('\n');

            // Get event playlists with links
            const playlists = eventPlaylists[event.id] || [];
            const playlistsText = playlists.length > 0
                ? `\n🎵 Music Playlists (${playlists.length}): \n${playlists.map(pl => `  • ${pl.platform}: ${pl.playlist_name || 'Playlist'}\n    Link: ${pl.playlist_url}`).join('\n')}`
                : '\n🎵 No playlists';

            return `*${event.title}*\n📅 ${event.date} at ${event.time}\n${assignmentsText || '(No assignments)'}${playlistsText}`;
        }).join('\n\n');

        const subject = "Ministry Schedule";
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handlePrint = () => {
        const SLOT_MAP = {
            'r1': 'Worship Leader',
            'r2': 'Acoustic Guitar',
            'r3': 'Vocals',
            'r6': 'Drums',
            'r10': 'Sound',
            'r11': 'Projection'
        };

        const printContent = document.createElement('div');
        printContent.innerHTML = `
            <html>
                <head>
                    <title>Print Schedule</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        .event { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
                        h2 { margin: 0 0 10px 0; }
                        .meta { color: #666; margin-bottom: 15px; }
                        .assignment { margin: 5px 0; }
                        .attachment { margin: 5px 0; padding-left: 15px; }
                        .playlist { margin: 5px 0; padding-left: 15px; }
                        .section-title { margin-top: 15px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Ministry Schedule</h1>
                    ${events.filter(e => selectedEventIds.has(e.id))
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(event => {
                    // Get all assignments for this event
                    const eventAssignments = assignments.filter(a => a.event_id === event.id);

                    // Get event attachments
                    const attachments = eventAttachments[event.id] || [];

                    // Get event playlists
                    const playlists = eventPlaylists[event.id] || [];

                    return `
                                <div class="event">
                                    <h2>` + event.title + `</h2>
                                    <div class="meta">` + new Date(event.date).toLocaleDateString() + ` at ` + event.time + `</div>
                                    <div class="section-title">Assignments (` + eventAssignments.length + `):</div>
                                    ` + eventAssignments.map(a => {
                        const role = roles.find(r => r.id === a.role_id);
                        const volunteer = getVolunteer(a.volunteer_id);
                        const group = groups.find(g => g.id === a.areaId);
                        const designatedRole = roles.find(r => r.id === a.designatedRoleId);

                        if (!volunteer) return ''; // Skip invalid

                        // Smart Role Name Resolution
                        let roleName = role ? role.name : null;
                        if (!roleName && designatedRole) roleName = designatedRole.name;
                        if (!roleName) roleName = SLOT_MAP[a.roleId] || 'Volunteer';

                        let details = [];
                        if (group) details.push(group.name);
                        if (designatedRole && designatedRole.name !== roleName) {
                            details.push(designatedRole.name);
                        }

                        return '<div class="assignment"><strong>' + (roleName || 'Unknown Role') + ':</strong> ' + volunteer.name + ' ' + (details.length ? '(' + details.join(' - ') + ')' : '') + '</div>';
                    }).join('') + (eventAssignments.length === 0 ? '<div>No assignments</div>' : '') + `
                                    ` + (attachments.length > 0 ? 
                                        '<div class="section-title">File Attachments (' + attachments.length + '):</div>' +
                                        attachments.map(att => 
                                            '<div class="attachment">• ' + att.file_name + '</div>'
                                        ).join('')
                                    : '') + `
                                    ` + (playlists.length > 0 ? 
                                        '<div class="section-title">Music Playlists (' + playlists.length + '):</div>' +
                                        playlists.map(pl => 
                                            '<div class="playlist">• ' + pl.platform + ': ' + (pl.playlist_name || 'Playlist') + '<br><small>Link: ' + pl.playlist_url + '</small></div>'
                                        ).join('')
                                    : '') + `
                                </div>
                            `;
                }).join('')}
                </body>
            </html>
        `;

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-navy-500">Schedule</h1>
                    <p className="text-navy-400">Manage upcoming services and assignments</p>
                    <p className="text-xs text-navy-300 mt-1">Select events to share via WhatsApp, Email, or Print.</p>
                </div>
                {canEdit && (
                    <button
                        onClick={() => {
                            setEditingEventId(null);
                            setFormData({ title: '', date: '', time: '' });
                            setIsEventModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium shadow-sm"
                    >
                        <CalendarIcon size={20} />
                        Add Event
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {events.map((event) => {
                    const eventAssignments = getEventAssignments(event.id);
                    const isExpanded = expandedEvent === event.id;
                    const filledSlots = eventAssignments.length;
                    const totalSlots = roles.length;
                    const progress = (filledSlots / totalSlots) * 100;
                    const isSelected = selectedEventIds.has(event.id);

                    return (
                        <div key={event.id} className={cn(
                            "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200",
                            isSelected ? "border-primary-400 ring-1 ring-primary-400" : "border-navy-100"
                        )}>
                            <div
                                className="p-6 cursor-pointer hover:bg-navy-50 transition-colors flex items-center justify-between"
                                onClick={async () => {
                                    const newExpandedState = isExpanded ? null : event.id;
                                    setExpandedEvent(newExpandedState);
                                                                    
                                    // If expanding the event, refresh all related data
                                    if (!isExpanded) {
                                        // Reload all data to ensure we have the latest from the database
                                        // This ensures that any recent changes are reflected when opening the event
                                        // Wait a moment to ensure state is updated before loading
                                        setTimeout(async () => {
                                            // Load fresh data for this specific event
                                            await Promise.all([
                                                getFileAttachments(event.id),
                                                getEventPlaylists(event.id)
                                            ]);
                                        }, 100);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        onClick={(e) => toggleEventSelection(e, event.id)}
                                        className={cn(
                                            "w-6 h-6 rounded border flex items-center justify-center transition-colors cursor-pointer",
                                            isSelected ? "bg-primary-500 border-primary-500 text-white" : "border-navy-200 hover:border-primary-400 bg-white"
                                        )}
                                    >
                                        {isSelected && <CheckCircle size={16} />}
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-primary-50 text-primary-500 rounded-xl flex flex-col items-center justify-center w-20 h-20 border border-primary-100">
                                            <span className="text-xs font-bold uppercase tracking-wider">FEB</span>
                                            <span className="text-2xl font-bold">{new Date(event.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-navy-500">{event.title}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-navy-400 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <CalendarIcon size={14} />
                                                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {event.time}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="hidden md:block w-32 mr-5">
                                        <div className="flex justify-between text-xs font-medium mb-1">
                                            <span className={progress === 100 ? "text-green-600" : "text-navy-400"}>
                                                {filledSlots}/{totalSlots} Roles Filled
                                            </span>
                                        </div>
                                        <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full", progress === 100 ? "bg-green-500" : "bg-primary-500")}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    {canEdit && (
                                        <>
                                            <button
                                                onClick={(e) => handleEditEvent(e, event)}
                                                className="p-2 text-navy-300 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
                                                title="Edit Event"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteEvent(e, event.id)}
                                                className="p-2 text-navy-300 hover:text-coral-500 hover:bg-coral-50 rounded-full transition-colors"
                                                title="Delete Event"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </>
                                    )}
                                    <ChevronRight size={20} className={cn("text-navy-300 transition-transform", isExpanded && "rotate-90")} />
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-navy-100 bg-navy-50/50 p-6">
                                    {/* File Attachments Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Paperclip className="w-5 h-5 text-navy-500" />
                                            <h4 className="font-semibold text-navy-500">Event Documents</h4>
                                        </div>
                                        {eventAttachments[event.id] !== undefined ? (
                                            <FileUpload 
                                                eventId={event.id} 
                                                initialAttachments={eventAttachments[event.id] || []} 
                                            />
                                        ) : (
                                            <div className="text-sm text-navy-400 italic">Loading documents...</div>
                                        )}
                                    </div>
                                    
                                    {/* Music Playlists Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Music className="w-5 h-5 text-navy-500" />
                                            <h4 className="font-semibold text-navy-500">Event Playlists</h4>
                                        </div>
                                        {eventPlaylists[event.id] !== undefined ? (
                                            <MusicPlaylist 
                                                eventId={event.id} 
                                                initialPlaylists={eventPlaylists[event.id] || []} 
                                                hideHeader={true}
                                            />
                                        ) : (
                                            <div className="text-sm text-navy-400 italic">Loading playlists...</div>
                                        )}
                                    </div>
                                    
                                    {/* Group roles by team/group */}
                                    <div className="space-y-6">
                                        {groups && groups.length > 0 ? (
                                            groups.map(group => {
                                                // Get roles that belong to this group
                                                const groupRoles = roles.filter(role => role.groupId === group.id);
                                                
                                                if (groupRoles.length === 0) return null;
                                                
                                                return (
                                                    <div key={group.id} className="border border-navy-200 rounded-xl bg-white p-4">
                                                        <h4 className="font-semibold text-navy-600 mb-3 text-lg border-b border-navy-100 pb-2">
                                                            {group.name}
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {groupRoles.map(role => {
                                                                const assignment = eventAssignments.find(a => a.role_id === role.id);

                                                                return (
                                                                    <div key={role?.id} className="bg-navy-50 p-4 rounded-lg border border-navy-100">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="font-medium text-navy-700 text-sm">{role?.name}</span>
                                                                        </div>

                                                                        {assignment ? (
                                                                            <div className="flex flex-col gap-2">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-navy-500 border border-navy-200">
                                                                                        {getVolunteer(assignment.volunteer_id)?.name?.charAt(0)}
                                                                                    </div>
                                                                                    <div className="text-sm font-medium text-navy-600 truncate">
                                                                                        {getVolunteer(assignment.volunteer_id)?.name}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            canEdit ? (
                                                                                <button
                                                                                    onClick={() => handleAssignClick(event.id, role.id)}
                                                                                    className="w-full py-2 border border-dashed border-navy-300 rounded-lg text-navy-500 text-sm hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                                                                                >
                                                                                    <UserPlus size={16} />
                                                                                    Assign Volunteer
                                                                                </button>
                                                                            ) : (
                                                                                <div className="w-full py-2 border border-dashed border-navy-200 rounded-lg text-navy-300 text-sm flex items-center justify-center gap-2">
                                                                                    <span>Unassigned</span>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            // If no groups, show all roles in one section
                                            <div className="border border-navy-200 rounded-xl bg-white p-4">
                                                <h4 className="font-semibold text-navy-600 mb-3 text-lg border-b border-navy-100 pb-2">
                                                    All Roles
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {roles && roles.length > 0 ? (
                                                        roles.map(role => {
                                                            const assignment = eventAssignments.find(a => a.role_id === role.id);

                                                            return (
                                                                <div key={role?.id} className="bg-navy-50 p-4 rounded-lg border border-navy-100">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="font-medium text-navy-700 text-sm">{role?.name}</span>
                                                                    </div>

                                                                    {assignment ? (
                                                                        <div className="flex flex-col gap-2">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-navy-500 border border-navy-200">
                                                                                    {getVolunteer(assignment.volunteer_id)?.name?.charAt(0)}
                                                                                </div>
                                                                                <div className="text-sm font-medium text-navy-600 truncate">
                                                                                    {getVolunteer(assignment.volunteer_id)?.name}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        canEdit ? (
                                                                            <button
                                                                                onClick={() => handleAssignClick(event.id, role.id)}
                                                                                className="w-full py-2 border border-dashed border-navy-300 rounded-lg text-navy-500 text-sm hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                                                                            >
                                                                                <UserPlus size={16} />
                                                                                Assign Volunteer
                                                                            </button>
                                                                        ) : (
                                                                            <div className="w-full py-2 border border-dashed border-navy-200 rounded-lg text-navy-300 text-sm flex items-center justify-center gap-2">
                                                                                <span>Unassigned</span>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="col-span-full text-center py-8 text-gray-500">
                                                            <UserPlus className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                                            <p>No roles available yet</p>
                                                            <p className="text-sm mt-1">Please add roles in the "Areas & Roles" section first</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Floating Action Bar */}
            {selectedEventIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-navy-500 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <span className="font-medium text-sm border-r border-navy-400 pr-4">
                        {selectedEventIds.size} Selected
                    </span>
                    <button onClick={handleShareWhatsApp} className="flex items-center gap-2 hover:text-green-400 transition-colors">
                        <MessageCircle size={18} />
                        <span className="text-sm font-medium">WhatsApp</span>
                    </button>
                    <button onClick={handleShareEmail} className="flex items-center gap-2 hover:text-primary-300 transition-colors">
                        <Mail size={18} />
                        <span className="text-sm font-medium">Email</span>
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 hover:text-navy-200 transition-colors">
                        <Printer size={18} />
                        <span className="text-sm font-medium">Print</span>
                    </button>
                    <button
                        onClick={() => setSelectedEventIds(new Set())}
                        className="ml-2 p-1 hover:bg-navy-400 rounded-full transition-colors text-navy-200 hover:text-white"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Event Modal */}
            <Modal
                isOpen={isEventModalOpen}
                onClose={handleCloseEventModal}
                title={editingEventId ? "Edit Event" : "Create New Event"}
            >
                <form onSubmit={handleSubmitEvent} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-navy-500 mb-1">Event Title</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Sunday Service"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-navy-500 mb-1">Date</label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-navy-500 mb-1">Time</label>
                            <input
                                required
                                type="time"
                                className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={handleCloseEventModal}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            {editingEventId ? "Save Changes" : "Create Event"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Assignment Modal */}
            <Modal
                isOpen={!!assigningRole}
                onClose={() => setAssigningRole(null)}
                title="Assign Volunteer"
            >
                <form onSubmit={handleConfirmAssign} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Volunteer</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                            value={selectedVolunteerId}
                            onChange={(e) => setSelectedVolunteerId(e.target.value)}
                        >
                            <option value="">Choose a volunteer...</option>
                            {volunteers.map(volunteer => (
                                <option key={volunteer.id} value={volunteer.id}>
                                    {volunteer.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setAssigningRole(null)}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Assign
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Email Modal */}
            <Modal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                title="Email Volunteers"
            >
                <form onSubmit={handleSendEmail} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Recipients</label>

                        {/* Volunteer Dropdown */}
                        <div className="mb-2">
                            <select
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const vol = volunteers.find(v => v.id === e.target.value);
                                        if (vol) {
                                            // Prevent duplicates
                                            if (!emailData.recipients.some(r => r.email === vol.email)) {
                                                setEmailData(prev => ({
                                                    ...prev,
                                                    recipients: [...prev.recipients, { email: vol.email, name: vol.name }]
                                                }));
                                            }
                                        }
                                        e.target.value = ""; // Reset select
                                    }
                                }}
                            >
                                <option value="">Select a volunteer to add...</option>
                                {volunteers.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.name} &lt;{v.email}&gt;
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Manual Input */}
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                placeholder="Or type custom email address..."
                                value={recipientInput}
                                onChange={e => setRecipientInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddRecipient();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleAddRecipient}
                                className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors text-sm"
                            >
                                Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-slate-100 rounded-lg bg-slate-50">
                            {emailData.recipients.map((recipient) => (
                                <span key={recipient.email} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700">
                                    {recipient.name}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRecipient(recipient.email)}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            {emailData.recipients.length === 0 && (
                                <span className="text-xs text-slate-400 italic p-1">No recipients added</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={emailData.subject}
                            onChange={e => setEmailData({ ...emailData, subject: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                        <textarea
                            required
                            rows={6}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            value={emailData.message}
                            onChange={e => setEmailData({ ...emailData, message: e.target.value })}
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEmailModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <Mail size={18} />
                            Send Email
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
