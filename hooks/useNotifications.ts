


import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../App';
import { NotificationWithSender, Profile } from '../types';
import { PostgrestError } from '@supabase/supabase-js';

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationWithSender[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<PostgrestError | null>(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                sender:profiles!notifications_sender_id_fkey (name, username, photo_url)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) {
            console.error("Error fetching notifications:", error);
            setError(error);
        } else if (data) {
            setNotifications(data as unknown as NotificationWithSender[]);
            const unread = data.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`realtime-notifications:${user.id}`)
            .on<NotificationWithSender>(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                async (payload) => {
                    // We need to fetch the sender details for the new notification
                    const { data: senderProfile, error: senderError } = await supabase
                        .from('profiles')
                        .select('name, username, photo_url')
                        .eq('id', payload.new.sender_id)
                        .single();

                    if (senderError) {
                        console.error("Error fetching sender profile for new notification:", senderError);
                        return;
                    }
                    
                    const newNotification: NotificationWithSender = {
                        ...(payload.new as NotificationWithSender),
                        sender: senderProfile as Pick<Profile, 'name' | 'photo_url' | 'username'> | null,
                    };
                    
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);
    
    const markAsRead = async (notificationId: number) => {
        const wasUnread = notifications.find(n => n.id === notificationId)?.is_read === false;
        if (!wasUnread) return;

        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
        
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
            
        if (error) {
            console.error("Failed to mark notification as read:", error);
            // Revert optimistic update
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, is_read: false } : n)
            );
            setUnreadCount(prev => prev + 1);
        }
    };
    
    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);
            
        if (error) {
            console.error("Failed to mark all notifications as read:", error);
            // Revert optimistic update - this is complex, a refetch might be easier
            fetchNotifications();
        }
    };

    return { notifications, unreadCount, loading, error, markAsRead, markAllAsRead };
};