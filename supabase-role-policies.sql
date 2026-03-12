-- Supabase Role-Based Access Control (RLS) Policies
-- These policies enforce admin-only write access at the database level

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's organization ID
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT p.org_id INTO org_id
    FROM profiles p
    WHERE p.id = auth.uid();
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete profiles" ON profiles;

-- Allow users to view profiles in their organization
CREATE POLICY "Users can view profiles in their organization"
    ON profiles FOR SELECT
    USING (org_id = get_user_org_id());

-- Allow new users to insert their own profile during registration
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- Only admins can update profiles (for role changes, status changes)
CREATE POLICY "Only admins can update profiles"
    ON profiles FOR UPDATE
    USING (is_admin());

-- Only admins can delete profiles
CREATE POLICY "Only admins can delete profiles"
    ON profiles FOR DELETE
    USING (is_admin());

-- ============================================
-- VOLUNTEERS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view volunteers in their organization" ON volunteers;
DROP POLICY IF EXISTS "Users can insert volunteers in their organization" ON volunteers;
DROP POLICY IF EXISTS "Users can update volunteers in their organization" ON volunteers;
DROP POLICY IF EXISTS "Users can delete volunteers in their organization" ON volunteers;

-- Everyone can view volunteers in their org
CREATE POLICY "Users can view volunteers in their organization"
    ON volunteers FOR SELECT
    USING (org_id = get_user_org_id());

-- Only admins can insert volunteers
CREATE POLICY "Only admins can insert volunteers"
    ON volunteers FOR INSERT
    WITH CHECK (is_admin() AND org_id = get_user_org_id());

-- Only admins can update volunteers
CREATE POLICY "Only admins can update volunteers"
    ON volunteers FOR UPDATE
    USING (is_admin());

-- Only admins can delete volunteers
CREATE POLICY "Only admins can delete volunteers"
    ON volunteers FOR DELETE
    USING (is_admin());

-- ============================================
-- EVENTS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view events in their organization" ON events;
DROP POLICY IF EXISTS "Users can insert events in their organization" ON events;
DROP POLICY IF EXISTS "Users can update events in their organization" ON events;
DROP POLICY IF EXISTS "Users can delete events in their organization" ON events;

-- Everyone can view events in their org
CREATE POLICY "Users can view events in their organization"
    ON events FOR SELECT
    USING (org_id = get_user_org_id());

-- Only admins can insert events
CREATE POLICY "Only admins can insert events"
    ON events FOR INSERT
    WITH CHECK (is_admin() AND org_id = get_user_org_id());

-- Only admins can update events
CREATE POLICY "Only admins can update events"
    ON events FOR UPDATE
    USING (is_admin());

-- Only admins can delete events
CREATE POLICY "Only admins can delete events"
    ON events FOR DELETE
    USING (is_admin());

-- ============================================
-- ASSIGNMENTS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view assignments in their organization" ON assignments;
DROP POLICY IF EXISTS "Users can insert assignments in their organization" ON assignments;
DROP POLICY IF EXISTS "Users can update assignments in their organization" ON assignments;
DROP POLICY IF EXISTS "Users can delete assignments in their organization" ON assignments;

-- Everyone can view assignments in their org
CREATE POLICY "Users can view assignments in their organization"
    ON assignments FOR SELECT
    USING (org_id = get_user_org_id());

-- Only admins can insert assignments
CREATE POLICY "Only admins can insert assignments"
    ON assignments FOR INSERT
    WITH CHECK (is_admin() AND org_id = get_user_org_id());

-- Only admins can update assignments
CREATE POLICY "Only admins can update assignments"
    ON assignments FOR UPDATE
    USING (is_admin());

-- Only admins can delete assignments
CREATE POLICY "Only admins can delete assignments"
    ON assignments FOR DELETE
    USING (is_admin());

-- ============================================
-- ROLES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view roles in their organization" ON roles;
DROP POLICY IF EXISTS "Users can insert roles in their organization" ON roles;
DROP POLICY IF EXISTS "Users can update roles in their organization" ON roles;
DROP POLICY IF EXISTS "Users can delete roles in their organization" ON roles;

-- Everyone can view roles in their org
CREATE POLICY "Users can view roles in their organization"
    ON roles FOR SELECT
    USING (org_id = get_user_org_id());

-- Only admins can insert roles
CREATE POLICY "Only admins can insert roles"
    ON roles FOR INSERT
    WITH CHECK (is_admin() AND org_id = get_user_org_id());

-- Only admins can update roles
CREATE POLICY "Only admins can update roles"
    ON roles FOR UPDATE
    USING (is_admin());

-- Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
    ON roles FOR DELETE
    USING (is_admin());

-- ============================================
-- GROUPS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view groups in their organization" ON groups;
DROP POLICY IF EXISTS "Users can insert groups in their organization" ON groups;
DROP POLICY IF EXISTS "Users can update groups in their organization" ON groups;
DROP POLICY IF EXISTS "Users can delete groups in their organization" ON groups;

-- Everyone can view groups in their org
CREATE POLICY "Users can view groups in their organization"
    ON groups FOR SELECT
    USING (org_id = get_user_org_id());

-- Only admins can insert groups
CREATE POLICY "Only admins can insert groups"
    ON groups FOR INSERT
    WITH CHECK (is_admin() AND org_id = get_user_org_id());

-- Only admins can update groups
CREATE POLICY "Only admins can update groups"
    ON groups FOR UPDATE
    USING (is_admin());

-- Only admins can delete groups
CREATE POLICY "Only admins can delete groups"
    ON groups FOR DELETE
    USING (is_admin());

-- ============================================
-- ORGANIZATIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;

-- Everyone can view their organization
CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (id = get_user_org_id());

-- Only admins can update organization
CREATE POLICY "Only admins can update organization"
    ON organizations FOR UPDATE
    USING (is_admin());

-- ============================================
-- FILE ATTACHMENTS POLICIES (if table exists)
-- ============================================

DROP POLICY IF EXISTS "Users can view attachments in their organization" ON file_attachments;
DROP POLICY IF EXISTS "Users can insert attachments in their organization" ON file_attachments;
DROP POLICY IF EXISTS "Users can delete attachments in their organization" ON file_attachments;

-- Everyone can view/download attachments
CREATE POLICY "Users can view attachments in their organization"
    ON file_attachments FOR SELECT
    USING (org_id = get_user_org_id());

-- Only admins can upload attachments
CREATE POLICY "Only admins can insert attachments"
    ON file_attachments FOR INSERT
    WITH CHECK (is_admin() AND org_id = get_user_org_id());

-- Only admins can delete attachments
CREATE POLICY "Only admins can delete attachments"
    ON file_attachments FOR DELETE
    USING (is_admin());

-- ============================================
-- PLAYLISTS POLICIES (if table exists)
-- ============================================

DROP POLICY IF EXISTS "Users can view playlists in their organization" ON playlists;
DROP POLICY IF EXISTS "Users can insert playlists in their organization" ON playlists;
DROP POLICY IF EXISTS "Users can update playlists in their organization" ON playlists;
DROP POLICY IF EXISTS "Users can delete playlists in their organization" ON playlists;

-- Everyone can view playlists
CREATE POLICY "Users can view playlists in their organization"
    ON playlists FOR SELECT
    USING (org_id = get_user_org_id());

-- Only admins can manage playlists
CREATE POLICY "Only admins can insert playlists"
    ON playlists FOR INSERT
    WITH CHECK (is_admin() AND org_id = get_user_org_id());

CREATE POLICY "Only admins can update playlists"
    ON playlists FOR UPDATE
    USING (is_admin());

CREATE POLICY "Only admins can delete playlists"
    ON playlists FOR DELETE
    USING (is_admin());
