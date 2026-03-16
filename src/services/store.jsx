import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const StoreContext = createContext();

// Demo data for when Supabase is not configured
const DEMO_USER = { id: 'demo-user', email: 'demo@serveflow.app', name: 'Demo User', orgId: 'demo-org' };
const DEMO_ORG = { id: 'demo-org', name: 'Demo Church' };
const DEMO_GROUPS = [
    { id: 'g1', name: 'Worship Team', orgId: 'demo-org' },
    { id: 'g2', name: 'Production', orgId: 'demo-org' },
    { id: 'g3', name: 'Hospitality', orgId: 'demo-org' },
];
const DEMO_ROLES = [
    { id: 'r1', name: 'Worship Leader', groupId: 'g1', orgId: 'demo-org' },
    { id: 'r2', name: 'Vocals', groupId: 'g1', orgId: 'demo-org' },
    { id: 'r3', name: 'Acoustic Guitar', groupId: 'g1', orgId: 'demo-org' },
    { id: 'r4', name: 'Sound Engineer', groupId: 'g2', orgId: 'demo-org' },
    { id: 'r5', name: 'Greeter', groupId: 'g3', orgId: 'demo-org' },
];
const DEMO_VOLUNTEERS = [
    { id: 'v1', name: 'Alice Johnson', email: 'alice@example.com', phone: '555-0101', roles: ['r1', 'r2'], orgId: 'demo-org' },
    { id: 'v2', name: 'Bob Smith', email: 'bob@example.com', phone: '555-0102', roles: ['r3'], orgId: 'demo-org' },
    { id: 'v3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-0103', roles: ['r4'], orgId: 'demo-org' },
];
const DEMO_PROFILE = { id: DEMO_USER.id, org_id: DEMO_ORG.id, name: DEMO_USER.name, has_paid: true, status: 'approved' };
const DEMO_EVENTS = [
    { id: 'e1', title: 'Sunday Service', date: '2025-02-23', time: '09:00', orgId: 'demo-org' },
    { id: 'e2', title: 'Sunday Service', date: '2025-03-02', time: '09:00', orgId: 'demo-org' },
];
const DEMO_ASSIGNMENTS = [
    { id: 'a1', eventId: 'e1', roleId: 'r1', volunteerId: 'v1', status: 'confirmed', orgId: 'demo-org' },
];

// Check if Supabase is configured
const isSupabaseConfigured = () => {
    return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

export function StoreProvider({ children }) {
    // Auth state from Supabase
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [demoMode, setDemoMode] = useState(false);

    // Data state
    const [groups, setGroups] = useState([]);
    const [roles, setRoles] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [events, setEvents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [organizationsList, setOrganizationsList] = useState([]);

    // Initialize auth state
    useEffect(() => {
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
            console.warn('Supabase not configured. Running in demo mode.');
            setDemoMode(true);
            setLoading(false);
            return;
        }

        // Get initial session with error handling for network failure
        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                setSession(session);
            } catch (err) {
                console.error('Failed to connect to Supabase. Falling back to demo mode:', err);
                setDemoMode(true);
            } finally {
                setLoading(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        initAuth();

        return () => subscription.unsubscribe();
    }, []);

    // Load profile and organization when session changes
    useEffect(() => {
        if (demoMode) {
            // Load demo data
            setProfile(DEMO_PROFILE);
            setOrganization(DEMO_ORG);
            setGroups(DEMO_GROUPS);
            setRoles(DEMO_ROLES);
            setVolunteers(DEMO_VOLUNTEERS);
            setEvents(DEMO_EVENTS);
            setAssignments(DEMO_ASSIGNMENTS);
            return;
        }

        if (session?.user) {
            loadProfile();
        } else {
            setProfile(null);
            setOrganization(null);
            clearData();
        }
    }, [session, demoMode]);

    // Load all data when profile/org changes
    useEffect(() => {
        if (demoMode) return;
        if (profile?.org_id) {
            loadAllData();
        }
    }, [profile]);

    const loadProfile = async () => {
        try {
            // First try to get profile without organization join (to avoid 406 errors)
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileError) {
                if (profileError.code === 'PGRST116') {
                    // Profile doesn't exist yet - this is expected for new users
                    console.log('Profile not found for user, redirecting to registration');
                    setProfile(null);
                    setOrganization(null);
                    return;
                } else {
                    console.error('Error loading profile:', profileError);
                    return;
                }
            }

            setProfile(profileData);

            // If profile has org_id, try to load organization separately
            if (profileData?.org_id) {
                const { data: orgData, error: orgError } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', profileData.org_id)
                    .single();
                
                if (!orgError && orgData) {
                    setOrganization(orgData);
                } else {
                    setOrganization(null);
                }
            } else {
                setOrganization(null);
            }
        } catch (err) {
            console.error('Unexpected error loading profile:', err);
        }
    };

    const clearData = () => {
        setGroups([]);
        setRoles([]);
        setVolunteers([]);
        setEvents([]);
        setAssignments([]);
    };

    const loadAllData = async () => {
        if (!profile?.org_id) return;

        try {
            // Load all data in parallel
            const [groupsRes, rolesRes, volunteersRes, eventsRes, assignmentsRes, playlistsRes] = await Promise.all([
                supabase.from('groups').select('*').order('name'),
                supabase.from('roles').select('*').order('name'),
                supabase.from('volunteers').select('*, volunteer_roles(role_id)').order('name'),
                supabase.from('events').select('*').order('date', { ascending: false }),
                supabase.from('assignments').select('*').order('created_at', { ascending: false }),
                supabase.from('event_playlists').select('*')
            ]);

            if (groupsRes.error) console.error('Error loading groups:', groupsRes.error);
            else setGroups(groupsRes.data || []);

            if (rolesRes.error) console.error('Error loading roles:', rolesRes.error);
            else {
                // Transform roles to convert database field names to frontend field names
                const transformedRoles = (rolesRes.data || []).map(role => {
                    const transformedRole = { ...role };
                    // Convert group_id (database) to groupId (frontend)
                    if (transformedRole.group_id !== undefined) {
                        transformedRole.groupId = transformedRole.group_id;
                        delete transformedRole.group_id;
                    }
                    return transformedRole;
                });
                setRoles(transformedRoles);
            }

            if (volunteersRes.error) console.error('Error loading volunteers:', volunteersRes.error);
            else {
                // Transform volunteer_roles array to roles array for compatibility
                const transformedVolunteers = (volunteersRes.data || []).map(v => ({
                    ...v,
                    roles: v.volunteer_roles?.map(vr => vr.role_id) || []
                }));
                setVolunteers(transformedVolunteers);
            }

            if (eventsRes.error) console.error('Error loading events:', eventsRes.error);
            else setEvents(eventsRes.data || []);

            if (assignmentsRes.error) console.error('Error loading assignments:', assignmentsRes.error);
            else setAssignments(assignmentsRes.data || []);

            if (playlistsRes.error) console.error('Error loading event playlists:', playlistsRes.error);
            else setPlaylists(playlistsRes.data || []);
        } catch (err) {
            console.error('Network error loading all data:', err);
            // If we hit a network error while already "connected", we might want to warn the user
            // but for now we just log it as the initial check should have caught unreachability.
        }
    };

    const fetchOrganizations = async () => {
        if (demoMode) {
            setOrganizationsList([DEMO_ORG]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('id, name')
                .order('name');

            if (error) throw error;
            setOrganizationsList(data || []);
        } catch (err) {
            console.error('Error fetching organizations:', err);
        }
    };

    // Auth functions
    const login = async (email, password) => {
        if (demoMode || !isSupabaseConfigured()) {
            // Demo login - accept any credentials
            setProfile(DEMO_PROFILE);
            setOrganization(DEMO_ORG);
            setGroups(DEMO_GROUPS);
            setRoles(DEMO_ROLES);
            setVolunteers(DEMO_VOLUNTEERS);
            setEvents(DEMO_EVENTS);
            setAssignments(DEMO_ASSIGNMENTS);
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);

        // Update session manually since it might not be updated immediately
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        // Load profile after a brief delay to ensure session is updated
        setTimeout(async () => {
            await loadProfile();
        }, 100);
    };

    const logout = async () => {
        if (demoMode) {
            setProfile(null);
            setOrganization(null);
            clearData();
            return;
        }
        await supabase.auth.signOut();
        setProfile(null);
        setOrganization(null);
        clearData();
    };

    const registerOrganization = async ({ orgName, adminName, email, password }) => {
        if (demoMode || !isSupabaseConfigured()) {
            // Demo registration - just log in with demo data
            setProfile({ ...DEMO_PROFILE, name: adminName, has_paid: false });
            setOrganization({ ...DEMO_ORG, name: orgName });
            setGroups(DEMO_GROUPS);
            setRoles(DEMO_ROLES);
            setVolunteers(DEMO_VOLUNTEERS);
            setEvents(DEMO_EVENTS);
            setAssignments(DEMO_ASSIGNMENTS);
            return;
        }

        try {
            // 1. Check if user already exists in auth
            let authData, authError;

            // Try to sign in first (in case user already exists)
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                // User doesn't exist, so create them
                const signUpResult = await supabase.auth.signUp({
                    email,
                    password
                });

                authData = signUpResult.data;
                authError = signUpResult.error;
            } else {
                // User already existed
                authData = signInData;
                authError = null;
            }

            if (authError && !authError.message.includes("Email not confirmed")) {
                throw new Error(authError.message);
            }

            // 2. Check if profile already exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (existingProfile) {
                // Profile already exists, just update session and load profile
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                await loadProfile();
                return;
            }

            // 3. Create organization
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert({ name: orgName })
                .select()
                .single();

            if (orgError) throw new Error(orgError.message);

            // 4. Create profile
            try {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        org_id: orgData.id,
                        name: adminName,
                        role: 'admin',
                        status: 'approved'
                    });

                if (profileError) throw profileError;
            } catch (err) {
                // If it fails because of missing status column, try without it
                if (err.message?.includes('column "status" of relation "profiles" does not exist') ||
                    err.code === 'PGRST204') {
                    const { error: retryError } = await supabase
                        .from('profiles')
                        .insert({
                            id: authData.user.id,
                            org_id: orgData.id,
                            name: adminName,
                            role: 'admin'
                        });
                    if (retryError) throw new Error(retryError.message);
                } else {
                    throw new Error(err.message);
                }
            }

            // 5. Trigger welcome email via Edge Function
            try {
                await sendWelcomeEmail({
                    orgId: orgData.id,
                    adminEmail: email,
                    adminName: adminName,
                    orgName: orgName
                });
            } catch (emailErr) {
                console.error('Failed to send welcome email:', emailErr);
                // Don't throw - registration should succeed even if email fails
            }

            // 6. Update session and load profile
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            await loadProfile();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    // Send welcome email via Edge Function
    const sendWelcomeEmail = async ({ orgId, adminEmail, adminName, orgName }) => {
        try {
            const { data, error } = await supabase.functions.invoke('send-welcome-email', {
                body: { orgId, adminEmail, adminName, orgName }
            });

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error invoking welcome email function:', err);
            throw err;
        }
    };

    const registerMember = async ({ orgId, name, email, password }) => {
        if (demoMode || !isSupabaseConfigured()) {
            setProfile({ id: 'new-member', org_id: orgId, name, status: 'pending' });
            return;
        }

        try {
            // 1. Sign up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password
            });

            if (authError && !authError.message.includes("Email not confirmed")) {
                throw new Error(authError.message);
            }

            // 2. Create profile with pending status
            try {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        org_id: orgId,
                        name: name,
                        role: 'member',
                        status: 'pending'
                    });

                if (profileError) throw profileError;
            } catch (err) {
                // Fallback for missing status column
                if (err.message?.includes('column "status" of relation "profiles" does not exist') ||
                    err.code === 'PGRST204') {
                    const { error: retryError } = await supabase
                        .from('profiles')
                        .insert({
                            id: authData.user.id,
                            org_id: orgId,
                            name: name,
                            role: 'member'
                        });
                    if (retryError) throw new Error(retryError.message);
                } else {
                    throw new Error(err.message);
                }
            }

            await loadProfile();
        } catch (error) {
            console.error('Member registration error:', error);
            throw error;
        }
    };

    const updateMemberStatus = async (userId, status) => {
        if (demoMode) {
            if (profile && profile.id === userId) {
                setProfile(prev => ({ ...prev, status }));
            }
            return;
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status })
                .eq('id', userId);

            if (error) throw error;
            await loadAllData();
        } catch (err) {
            console.error('Error updating member status:', err);
            throw err;
        }
    };

    const completePayment = async () => {
        if (demoMode) {
            setProfile(prev => ({ ...prev, has_paid: true }));
            return;
        }

        if (!profile?.id) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ has_paid: true })
                .eq('id', profile.id);

            if (error) throw error;
            setProfile(prev => ({ ...prev, has_paid: true }));
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    };

    // Volunteer functions
    const addVolunteer = async (volunteer) => {
        if (demoMode) {
            const newVolunteer = {
                ...volunteer,
                id: `v${Date.now()}`,
                orgId: profile?.org_id || 'demo-org'
            };
            setVolunteers(prev => [...prev, newVolunteer]);
            return;
        }

        if (!profile?.org_id) return;

        const { roles: volunteerRoles, ...volunteerData } = volunteer;

        const { data, error } = await supabase
            .from('volunteers')
            .insert({
                ...volunteerData,
                org_id: profile.org_id
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding volunteer:', error);
            throw new Error(error.message);
        }

        // Add volunteer_roles relationships
        if (volunteerRoles?.length > 0) {
            const { error: rolesError } = await supabase
                .from('volunteer_roles')
                .insert(volunteerRoles.map(roleId => ({
                    volunteer_id: data.id,
                    role_id: roleId
                })));

            if (rolesError) console.error('Error adding volunteer roles:', rolesError);
        }

        await loadAllData();
    };

    const updateVolunteer = async (id, updates) => {
        if (demoMode) {
            setVolunteers(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
            return;
        }

        const { roles: volunteerRoles, ...volunteerData } = updates;

        const { error } = await supabase
            .from('volunteers')
            .update(volunteerData)
            .eq('id', id);

        if (error) {
            console.error('Error updating volunteer:', error);
            throw new Error(error.message);
        }

        // Update volunteer_roles if provided
        if (volunteerRoles !== undefined) {
            // Delete existing roles
            await supabase.from('volunteer_roles').delete().eq('volunteer_id', id);

            // Insert new roles
            if (volunteerRoles.length > 0) {
                const { error: rolesError } = await supabase
                    .from('volunteer_roles')
                    .insert(volunteerRoles.map(roleId => ({
                        volunteer_id: id,
                        role_id: roleId
                    })));

                if (rolesError) console.error('Error updating volunteer roles:', rolesError);
            }
        }

        await loadAllData();
    };

    const deleteVolunteer = async (id) => {
        if (demoMode) {
            setVolunteers(prev => prev.filter(v => v.id !== id));
            return;
        }

        const { error } = await supabase
            .from('volunteers')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting volunteer:', error);
            throw new Error(error.message);
        }

        await loadAllData();
    };

    // Event functions
    const addEvent = async (event) => {
        if (demoMode) {
            const newEvent = {
                ...event,
                id: `e${Date.now()}`,
                orgId: profile?.org_id || 'demo-org'
            };
            setEvents(prev => [...prev, newEvent]);
            return newEvent;
        }

        if (!profile?.org_id) return;

        const { data, error } = await supabase
            .from('events')
            .insert({
                ...event,
                org_id: profile.org_id
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding event:', error);
            throw new Error(error.message);
        }

        await loadAllData();
        return data;
    };

    const updateEvent = async (id, updates) => {
        if (demoMode) {
            setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
            return;
        }

        const { error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating event:', error);
            throw new Error(error.message);
        }

        await loadAllData();
    };

    const deleteEvent = async (id) => {
        if (demoMode) {
            setEvents(prev => prev.filter(e => e.id !== id));
            setAssignments(prev => prev.filter(a => a.eventId !== id));
            return;
        }

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting event:', error);
            throw new Error(error.message);
        }

        await loadAllData();
    };

    // Assignment functions
    const assignVolunteer = async (eventId, roleId, volunteerId) => {
        if (demoMode) {
            const newAssignment = {
                id: `a${Date.now()}`,
                eventId,
                roleId,
                volunteerId,
                status: 'confirmed',
                orgId: profile?.org_id || 'demo-org'
            };
            setAssignments(prev => [...prev, newAssignment]);
            return;
        }

        if (!profile?.org_id) {
            console.error('Unauthorized: No organization found for user');
            throw new Error('Access denied: Invalid user profile');
        }

        // Verify the event belongs to the user's organization
        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('id')
            .eq('id', eventId)
            .eq('org_id', profile.org_id)
            .single();

        if (eventError || !eventData) {
            console.error('Unauthorized: User cannot access this event');
            throw new Error('Access denied: Invalid event');
        }

        // Verify the role belongs to the user's organization
        const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .eq('id', roleId)
            .eq('org_id', profile.org_id)
            .single();

        if (roleError || !roleData) {
            console.error('Unauthorized: User cannot access this role');
            throw new Error('Access denied: Invalid role');
        }

        // Verify the volunteer belongs to the user's organization
        const { data: volunteerData, error: volunteerError } = await supabase
            .from('volunteers')
            .select('id')
            .eq('id', volunteerId)
            .eq('org_id', profile.org_id)
            .single();

        if (volunteerError || !volunteerData) {
            console.error('Unauthorized: User cannot access this volunteer');
            throw new Error('Access denied: Invalid volunteer');
        }

        const { error } = await supabase
            .from('assignments')
            .insert({
                event_id: eventId,
                role_id: roleId,
                volunteer_id: volunteerId,
                status: 'confirmed',
                org_id: profile.org_id
            });

        if (error) {
            console.error('Error assigning volunteer:', error);
            throw new Error(error.message);
        }

        await loadAllData();
    };

    const updateAssignment = async (id, updates) => {
        if (demoMode) {
            setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
            return;
        }

        if (!profile?.org_id) {
            console.error('Unauthorized: No organization found for user');
            throw new Error('Access denied: Invalid user profile');
        }

        // Verify the assignment belongs to the user's organization
        const { data: assignmentData, error: assignmentError } = await supabase
            .from('assignments')
            .select('id, org_id')
            .eq('id', id)
            .eq('org_id', profile.org_id)
            .single();

        if (assignmentError || !assignmentData) {
            console.error('Unauthorized: User cannot access this assignment');
            throw new Error('Access denied: Invalid assignment');
        }

        const { error } = await supabase
            .from('assignments')
            .update(updates)
            .eq('id', id)
            .eq('org_id', profile.org_id);

        if (error) {
            console.error('Error updating assignment:', error);
            throw new Error(error.message);
        }

        await loadAllData();
    };

    // Role functions
    const addRole = async (role) => {
        if (demoMode) {
            const newRole = {
                ...role,
                id: `r${Date.now()}`,
                orgId: profile?.org_id || 'demo-org'
            };
            setRoles(prev => [...prev, newRole]);
            return;
        }

        if (!profile?.org_id) return;

        // Convert groupId to group_id for database
        const roleData = {
            ...role,
            org_id: profile.org_id
        };

        // Only include group_id if it exists and is not empty
        if (roleData.groupId) {
            roleData.group_id = roleData.groupId;
            delete roleData.groupId; // Remove the frontend field
        }

        const { error } = await supabase
            .from('roles')
            .insert(roleData);

        if (error) {
            console.error('Error adding role:', error);
            throw new Error(error.message);
        }

        await loadAllData();
    };

    const updateRole = async (id, updates) => {
        if (demoMode) {
            setRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
            return;
        }

        // Convert groupId to group_id for database
        const updatesData = { ...updates };

        // Only include group_id if it exists and is not empty
        if (updatesData.groupId !== undefined) {
            updatesData.group_id = updatesData.groupId || null; // Use null if empty
            delete updatesData.groupId; // Remove the frontend field
        }

        const { error } = await supabase
            .from('roles')
            .update(updatesData)
            .eq('id', id);

        if (error) {
            console.error('Error updating role:', error);
            throw new Error(error.message);
        }

        await loadAllData();
    };

    const deleteRole = async (id) => {
        if (demoMode) {
            setRoles(prev => prev.filter(r => r.id !== id));
            return;
        }

        const { error } = await supabase
            .from('roles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting role:', error);
            throw new Error(error.message);
        }

        await loadAllData();
    };

    // Group functions
    const addGroup = async (group) => {
        if (demoMode) {
            const newGroup = {
                ...group,
                id: `g${Date.now()}`,
                orgId: profile?.org_id || 'demo-org'
            };
            setGroups(prev => [...prev, newGroup]);
            return;
        }

        if (!profile?.org_id) return;

        const { error } = await supabase
            .from('groups')
            .insert({
                ...group,
                org_id: profile.org_id
            });

        if (error) {
            console.error('Error adding group:', error);
            throw new Error(error.message);
        }

        await loadAllData();
    };

    const updateGroup = async (id, updates) => {
        if (demoMode) {
            setGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
            return;
        }

        const { error } = await supabase
            .from('groups')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating group:', error);
            throw new Error(error.message);
        }

        await loadAllData();
    };

    const deleteGroup = async (id) => {
        if (demoMode) {
            setGroups(prev => prev.filter(g => g.id !== id));
            return;
        }

        const { error } = await supabase
            .from('groups')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting group:', error);
            throw new Error(error.message);
        }

        await loadAllData();
    };

    // File attachment functions
    const addFileAttachment = async (eventId, fileData) => {
        if (demoMode) {
            // Demo mode - add to local state (simplified)
            console.log('Demo mode: File attachment would be saved');
            return;
        }

        if (!profile?.org_id) {
            console.error('Unauthorized: No organization found for user');
            throw new Error('Access denied: Invalid user profile');
        }

        // Verify the event belongs to the user's organization
        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('id')
            .eq('id', eventId)
            .eq('org_id', profile.org_id)
            .single();

        if (eventError || !eventData) {
            console.error('Unauthorized: User cannot access this event');
            throw new Error('Access denied: Invalid event');
        }

        // Validate file type and size
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_FILE_TYPES = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'audio/mpeg',
            'audio/mp3',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ];

        if (fileData.size > MAX_FILE_SIZE) {
            throw new Error('File size exceeds maximum allowed (10MB)');
        }

        if (!ALLOWED_FILE_TYPES.includes(fileData.type)) {
            throw new Error(`File type not allowed: ${fileData.type}`);
        }

        const { error } = await supabase
            .from('event_attachments')
            .insert({
                event_id: eventId,
                org_id: profile.org_id,
                file_name: fileData.name,
                file_url: fileData.url,
                file_type: fileData.type,
                file_size: fileData.size
            });

        if (error) {
            console.error('Error adding file attachment:', error);
            throw new Error(error.message);
        }

        await loadAllData(); // Refresh data
    };

    const getFileAttachments = async (eventId) => {
        if (demoMode) {
            // Demo mode - return empty array
            return [];
        }

        const { data, error } = await supabase
            .from('event_attachments')
            .select('*')
            .eq('event_id', eventId);

        if (error) {
            console.error('Error fetching file attachments:', error);
            return [];
        }

        return data || [];
    };

    const deleteFileAttachment = async (attachmentId) => {
        if (demoMode) {
            // Demo mode - remove from local state (simplified)
            console.log('Demo mode: File attachment would be deleted');
            return;
        }

        if (!profile?.org_id) {
            console.error('Unauthorized: No organization found for user');
            throw new Error('Access denied: Invalid user profile');
        }

        // Verify the attachment belongs to the user's organization
        const { data: attachmentData, error: attachmentError } = await supabase
            .from('event_attachments')
            .select('id, org_id')
            .eq('id', attachmentId)
            .eq('org_id', profile.org_id)
            .single();

        if (attachmentError || !attachmentData) {
            console.error('Unauthorized: User cannot access this attachment');
            throw new Error('Access denied: Invalid attachment');
        }

        const { error } = await supabase
            .from('event_attachments')
            .delete()
            .eq('id', attachmentId)
            .eq('org_id', profile.org_id);

        if (error) {
            console.error('Error deleting file attachment:', error);
            throw new Error(error.message);
        }

        await loadAllData(); // Refresh data
    };

    // Playlist functions
    const addEventPlaylist = async (eventId, playlistData) => {
        if (demoMode) {
            // Demo mode - add to local state (simplified)
            console.log('Demo mode: Playlist would be saved');
            return;
        }

        if (!profile?.org_id) {
            console.error('Unauthorized: No organization found for user');
            throw new Error('Access denied: Invalid user profile');
        }

        // Verify the event belongs to the user's organization
        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('id')
            .eq('id', eventId)
            .eq('org_id', profile.org_id)
            .single();

        if (eventError || !eventData) {
            console.error('Unauthorized: User cannot access this event');
            throw new Error('Access denied: Invalid event');
        }

        // Validate playlist URL
        try {
            new URL(playlistData.url);
        } catch (e) {
            throw new Error('Invalid playlist URL');
        }

        // Validate platform
        const VALID_PLATFORMS = ['youtube', 'spotify', 'apple_music', 'soundcloud'];
        if (!VALID_PLATFORMS.includes(playlistData.platform)) {
            throw new Error('Invalid playlist platform');
        }

        const { error } = await supabase
            .from('event_playlists')
            .insert({
                event_id: eventId,
                org_id: profile.org_id,
                platform: playlistData.platform,
                playlist_url: playlistData.url,
                playlist_name: playlistData.name,
                description: playlistData.description
            });

        if (error) {
            console.error('Error adding event playlist:', error);
            throw new Error(error.message);
        }

        await loadAllData(); // Refresh data
    };

    const getEventPlaylists = async (eventId) => {
        if (demoMode) {
            // Demo mode - return empty array
            return [];
        }

        const { data, error } = await supabase
            .from('event_playlists')
            .select('*')
            .eq('event_id', eventId);

        if (error) {
            console.error('Error fetching event playlists:', error);
            return [];
        }

        return data || [];
    };

    const updateEventPlaylist = async (playlistId, updates) => {
        if (demoMode) {
            // Demo mode - update in local state (simplified)
            console.log('Demo mode: Playlist would be updated');
            return;
        }

        const { error } = await supabase
            .from('event_playlists')
            .update(updates)
            .eq('id', playlistId);

        if (error) {
            console.error('Error updating event playlist:', error);
            throw new Error(error.message);
        }

        await loadAllData(); // Refresh data
    };

    const deleteEventPlaylist = async (playlistId) => {
        if (demoMode) {
            // Demo mode - remove from local state (simplified)
            console.log('Demo mode: Playlist would be deleted');
            return;
        }

        if (!profile?.org_id) {
            console.error('Unauthorized: No organization found for user');
            throw new Error('Access denied: Invalid user profile');
        }

        // Verify the playlist belongs to the user's organization
        const { data: playlistData, error: playlistError } = await supabase
            .from('event_playlists')
            .select('id, org_id')
            .eq('id', playlistId)
            .eq('org_id', profile.org_id)
            .single();

        if (playlistError || !playlistData) {
            console.error('Unauthorized: User cannot access this playlist');
            throw new Error('Access denied: Invalid playlist');
        }

        const { error } = await supabase
            .from('event_playlists')
            .delete()
            .eq('id', playlistId)
            .eq('org_id', profile.org_id);

        if (error) {
            console.error('Error deleting event playlist:', error);
            throw new Error(error.message);
        }

        await loadAllData(); // Refresh data
    };

    // Derived user object for compatibility with existing components
    const user = demoMode
        ? (profile ? {
            id: profile.id,
            email: 'demo@serveflow.app',
            name: profile.name,
            orgId: profile.org_id
        } : null)
        : (session?.user ? {
            id: session.user.id,
            email: session.user.email,
            name: profile?.name,
            orgId: profile?.org_id
        } : null);

    // Role-based access control helpers
    const isAdmin = profile?.role === 'admin' || demoMode;
    const isTeamMember = profile?.role === 'member' || profile?.role === 'team_member';
    const canEdit = isAdmin;
    const canDownload = true; // All authenticated users can download

    const value = {
        user,
        profile,
        organization,
        loading,
        demoMode,
        // Role-based access
        isAdmin,
        isTeamMember,
        canEdit,
        canDownload,
        login,
        logout,
        registerOrganization,
        groups,
        roles,
        volunteers,
        events,
        assignments,
        addVolunteer,
        updateVolunteer,
        deleteVolunteer,
        addEvent,
        updateEvent,
        deleteEvent,
        assignVolunteer,
        updateAssignment,
        addRole,
        updateRole,
        deleteRole,
        addGroup,
        updateGroup,
        deleteGroup,
        organizationsList,
        fetchOrganizations,
        registerMember,
        updateMemberStatus,
        // File attachment functions
        addFileAttachment,
        getFileAttachments,
        deleteFileAttachment,
        // Playlist functions
        addEventPlaylist,
        getEventPlaylists,
        updateEventPlaylist,
        deleteEventPlaylist,
        refreshData: loadAllData,
        completePayment
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    return useContext(StoreContext);
}
