import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X, UserPlus, Mail, Info } from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../services/supabase';
import { useStore } from '../services/store';

export function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user, profile, demoMode } = useStore();
    const dropdownRef = useRef(null);

    // Load notifications
    useEffect(() => {
        if (demoMode || !user) return;
        loadNotifications();
        
        // Subscribe to new notifications
        const subscription = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
                setUnreadCount(prev => prev + 1);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user, demoMode]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        if (!user?.id) return;
        
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            
            setNotifications(data || []);
            setUnreadCount((data || []).filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Error loading notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        if (demoMode) return;
        
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;
            
            setNotifications(prev => prev.map(n => 
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (demoMode) return;
        
        try {
            const { error } = await supabase.rpc('mark_all_notifications_read');
            
            if (error) throw error;
            
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const deleteNotification = async (notificationId) => {
        if (demoMode) return;
        
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) throw error;
            
            const wasUnread = notifications.find(n => n.id === notificationId)?.is_read === false;
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'member_joined':
                return <UserPlus size={18} className="text-primary-500" />;
            case 'welcome_email_sent':
                return <Mail size={18} className="text-green-500" />;
            case 'new_registration':
                return <Info size={18} className="text-blue-500" />;
            default:
                return <Info size={18} className="text-navy-400" />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    // Demo mode notifications
    const demoNotifications = [
        {
            id: 'demo-1',
            type: 'new_registration',
            title: 'Welcome to ServeFlow!',
            message: 'Your organization "Demo Church" has been successfully created.',
            is_read: false,
            created_at: new Date().toISOString(),
        },
        {
            id: 'demo-2',
            type: 'member_joined',
            title: 'New Member Request',
            message: 'John Doe has requested to join Demo Church. Please review and approve.',
            is_read: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
        }
    ];

    const displayNotifications = demoMode ? demoNotifications : notifications;
    const displayUnreadCount = demoMode ? 1 : unreadCount;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-xl transition-colors",
                    isOpen ? "bg-primary-50 text-primary-600" : "text-navy-400 hover:text-navy-600 hover:bg-navy-50"
                )}
            >
                <Bell size={22} />
                {displayUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {displayUnreadCount > 9 ? '9+' : displayUnreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-navy-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100 bg-navy-50">
                        <h3 className="font-semibold text-navy-500">Notifications</h3>
                        {displayUnreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-navy-400">
                                <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                Loading...
                            </div>
                        ) : displayNotifications.length === 0 ? (
                            <div className="p-8 text-center text-navy-400">
                                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            displayNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex items-start gap-3 p-4 border-b border-navy-100 hover:bg-navy-50 transition-colors",
                                        !notification.is_read && "bg-primary-50/50"
                                    )}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm font-medium",
                                            !notification.is_read ? "text-navy-500" : "text-navy-400"
                                        )}>
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-navy-400 mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-navy-300 mt-1">
                                            {formatTime(notification.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="p-1 text-navy-300 hover:text-primary-500 hover:bg-primary-50 rounded"
                                                title="Mark as read"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="p-1 text-navy-300 hover:text-coral-500 hover:bg-coral-50 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {displayNotifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-navy-100 bg-navy-50 text-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-navy-400 hover:text-navy-600"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
