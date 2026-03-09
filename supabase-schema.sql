-- Supabase Database Schema for Church Scheduler
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'member')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: RLS policies for organizations need to allow select for all to populate the registration dropdown
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
CREATE POLICY "Anyone can view organization names" 
    ON organizations FOR SELECT 
    USING (true);

-- Groups table (ministry teams)
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles table (specific positions within groups)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer-Roles junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS volunteer_roles (
    volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    PRIMARY KEY (volunteer_id, role_id)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table (volunteer assignments to events/roles)
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's org_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT org_id FROM profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for organizations
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
CREATE POLICY "Users can view their own organization" 
    ON organizations FOR SELECT 
    USING (id = get_user_org_id() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can insert their own organization" ON organizations;
CREATE POLICY "Users can insert their own organization" 
    ON organizations FOR INSERT 
    WITH CHECK (true); -- Allow initial creation, will be restricted by application logic

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
CREATE POLICY "Users can view profiles in their organization" 
    ON profiles FOR SELECT 
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (id = auth.uid());

-- RLS Policies for groups
DROP POLICY IF EXISTS "Users can view groups in their organization" ON groups;
CREATE POLICY "Users can view groups in their organization" 
    ON groups FOR SELECT 
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can insert groups in their organization" ON groups;
CREATE POLICY "Users can insert groups in their organization" 
    ON groups FOR INSERT 
    WITH CHECK (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can update groups in their organization" ON groups;
CREATE POLICY "Users can update groups in their organization" 
    ON groups FOR UPDATE 
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can delete groups in their organization" ON groups;
CREATE POLICY "Users can delete groups in their organization" 
    ON groups FOR DELETE 
    USING (org_id = get_user_org_id());

-- RLS Policies for roles
DROP POLICY IF EXISTS "Users can view roles in their organization" ON roles;
CREATE POLICY "Users can view roles in their organization" 
    ON roles FOR SELECT 
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can insert roles in their organization" ON roles;
CREATE POLICY "Users can insert roles in their organization" 
    ON roles FOR INSERT 
    WITH CHECK (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can update roles in their organization" ON roles;
CREATE POLICY "Users can update roles in their organization" 
    ON roles FOR UPDATE 
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can delete roles in their organization" ON roles;
CREATE POLICY "Users can delete roles in their organization" 
    ON roles FOR DELETE 
    USING (org_id = get_user_org_id());

-- RLS Policies for volunteers
DROP POLICY IF EXISTS "Users can view volunteers in their organization" ON volunteers;
CREATE POLICY "Users can view volunteers in their organization" 
    ON volunteers FOR SELECT 
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can insert volunteers in their organization" ON volunteers;
CREATE POLICY "Users can insert volunteers in their organization" 
    ON volunteers FOR INSERT 
    WITH CHECK (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can update volunteers in their organization" ON volunteers;
CREATE POLICY "Users can update volunteers in their organization" 
    ON volunteers FOR UPDATE 
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can delete volunteers in their organization" ON volunteers;
CREATE POLICY "Users can delete volunteers in their organization" 
    ON volunteers FOR DELETE 
    USING (org_id = get_user_org_id());

-- RLS Policies for volunteer_roles
DROP POLICY IF EXISTS "Users can view volunteer_roles in their organization" ON volunteer_roles;
CREATE POLICY "Users can view volunteer_roles in their organization" 
    ON volunteer_roles FOR SELECT 
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can insert volunteer_roles in their organization" ON volunteer_roles;
CREATE POLICY "Users can insert volunteer_roles in their organization" 
    ON volunteer_roles FOR INSERT 
    WITH CHECK (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can delete volunteer_roles in their organization" ON volunteer_roles;
CREATE POLICY "Users can delete volunteer_roles in their organization" 
    ON volunteer_roles FOR DELETE 
    USING (org_id = get_user_org_id());

-- RLS Policies for events
DROP POLICY IF EXISTS "Users can view events in their organization" ON events;
CREATE POLICY "Users can view events in their organization" 
    ON events FOR SELECT 
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can insert events in their organization" ON events;
CREATE POLICY "Users can insert events in their organization" 
    ON events FOR INSERT 
    WITH CHECK (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can update events in their organization" ON events;
CREATE POLICY "Users can update events in their organization" 
    ON events FOR UPDATE 
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can delete events in their organization" ON events;
CREATE POLICY "Users can delete events in their organization" 
    ON events FOR DELETE 
    USING (org_id = get_user_org_id());

-- RLS Policies for assignments
DROP POLICY IF EXISTS "Users can view assignments in their organization" ON assignments;
CREATE POLICY "Users can view assignments in their organization" 
    ON assignments FOR SELECT 
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can insert assignments in their organization" ON assignments;
CREATE POLICY "Users can insert assignments in their organization" 
    ON assignments FOR INSERT 
    WITH CHECK (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can update assignments in their organization" ON assignments;
CREATE POLICY "Users can update assignments in their organization" 
    ON assignments FOR UPDATE 
    USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can delete assignments in their organization" ON assignments;
CREATE POLICY "Users can delete assignments in their organization" 
    ON assignments FOR DELETE 
    USING (org_id = get_user_org_id());

-- Trigger to automatically set org_id on insert (optional helper)
CREATE OR REPLACE FUNCTION set_org_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.org_id IS NULL THEN
        NEW.org_id := get_user_org_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to tables that need auto org_id
DROP TRIGGER IF EXISTS set_org_id_groups ON groups;
CREATE TRIGGER set_org_id_groups BEFORE INSERT ON groups
    FOR EACH ROW EXECUTE FUNCTION set_org_id();

DROP TRIGGER IF EXISTS set_org_id_roles ON roles;
CREATE TRIGGER set_org_id_roles BEFORE INSERT ON roles
    FOR EACH ROW EXECUTE FUNCTION set_org_id();

DROP TRIGGER IF EXISTS set_org_id_volunteers ON volunteers;
CREATE TRIGGER set_org_id_volunteers BEFORE INSERT ON volunteers
    FOR EACH ROW EXECUTE FUNCTION set_org_id();

DROP TRIGGER IF EXISTS set_org_id_events ON events;
CREATE TRIGGER set_org_id_events BEFORE INSERT ON events
    FOR EACH ROW EXECUTE FUNCTION set_org_id();

DROP TRIGGER IF EXISTS set_org_id_assignments ON assignments;
CREATE TRIGGER set_org_id_assignments BEFORE INSERT ON assignments
    FOR EACH ROW EXECUTE FUNCTION set_org_id();
