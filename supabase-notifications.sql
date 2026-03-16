-- Supabase Notifications and Welcome Email System
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_registration', 'member_joined', 'welcome_email_sent', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" 
    ON notifications FOR SELECT 
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" 
    ON notifications FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" 
    ON notifications FOR UPDATE 
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" 
    ON notifications FOR DELETE 
    USING (user_id = auth.uid());

-- ============================================
-- WELCOME EMAIL LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS welcome_email_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    admin_email TEXT NOT NULL,
    admin_name TEXT NOT NULL,
    org_name TEXT NOT NULL,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on welcome_email_log
ALTER TABLE welcome_email_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view their org's welcome email logs
DROP POLICY IF EXISTS "Admins can view welcome email logs" ON welcome_email_log;
CREATE POLICY "Admins can view welcome email logs" 
    ON welcome_email_log FOR SELECT 
    USING (org_id IN (
        SELECT org_id FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================
-- FUNCTION: Get unread notification count
-- ============================================
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM notifications 
        WHERE user_id = auth.uid() AND is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Mark all notifications as read
-- ============================================
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
    UPDATE notifications 
    SET is_read = true 
    WHERE user_id = auth.uid() AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Notify admin on new organization registration
-- ============================================
CREATE OR REPLACE FUNCTION notify_on_new_organization()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the first admin user (or you can specify a specific admin email)
    -- For now, we'll create a notification for the new user themselves
    -- You can modify this to notify a super admin
    
    -- Insert notification for the new admin
    INSERT INTO notifications (user_id, org_id, type, title, message, data)
    VALUES (
        NEW.id,
        NEW.org_id,
        'new_registration',
        'Welcome to ServeFlow!',
        'Your organization "' || (SELECT name FROM organizations WHERE id = NEW.org_id) || '" has been successfully created.',
        jsonb_build_object('org_id', NEW.org_id, 'org_name', (SELECT name FROM organizations WHERE id = NEW.org_id))
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS notify_on_new_org ON profiles;
CREATE TRIGGER notify_on_new_org
    AFTER INSERT ON profiles
    FOR EACH ROW
    WHEN (NEW.role = 'admin')
    EXECUTE FUNCTION notify_on_new_organization();

-- ============================================
-- TRIGGER: Notify admin when new member joins
-- ============================================
CREATE OR REPLACE FUNCTION notify_on_new_member()
RETURNS TRIGGER AS $$
DECLARE
    org_admin_id UUID;
    org_name TEXT;
BEGIN
    -- Get the organization name
    SELECT name INTO org_name FROM organizations WHERE id = NEW.org_id;
    
    -- Get the admin of this organization
    SELECT id INTO org_admin_id 
    FROM profiles 
    WHERE org_id = NEW.org_id AND role = 'admin' 
    LIMIT 1;
    
    -- If admin found, create notification
    IF org_admin_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, org_id, type, title, message, data)
        VALUES (
            org_admin_id,
            NEW.org_id,
            'member_joined',
            'New Member Request',
            NEW.name || ' has requested to join ' || org_name || '. Please review and approve.',
            jsonb_build_object(
                'member_id', NEW.id,
                'member_name', NEW.name,
                'member_email', (SELECT email FROM auth.users WHERE id = NEW.id),
                'org_id', NEW.org_id,
                'org_name', org_name
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to profiles for new members
DROP TRIGGER IF EXISTS notify_on_member_join ON profiles;
CREATE TRIGGER notify_on_member_join
    AFTER INSERT ON profiles
    FOR EACH ROW
    WHEN (NEW.role = 'member' AND NEW.status = 'pending')
    EXECUTE FUNCTION notify_on_new_member();

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
