import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { pb } from '../services/pocketbase';
import type { Notification } from '../types';
import { Spinner } from '../components/Spinner';
import { NotificationItem } from '../components/NotificationItem';

export const NotificationsPage: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const markAllAsRead = useCallback(async (unreadNotifications: Notification[]) => {
        const promises = unreadNotifications.map(n => 
            pb.collection('notifications').update(n.id, { read: true }, { requestKey: null })
        );
        try {
            await Promise.all(promises);
        } catch (err) {
            console.error("Failed to mark notifications as read:", err);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const result = await pb.collection('notifications').getFullList<Notification>({
                filter: `user = "${user.id}"`,
                sort: '-created',
                expand: 'source_user,post',
                requestKey: null,
            });
            setNotifications(result);

            const unread = result.filter(n => !n.read);
            if (unread.length > 0) {
                markAllAsRead(unread);
            }
        } catch (err: any) {
            console.error("Failed to fetch notifications:", err);
            setError(err.message || "Could not load notifications.");
        } finally {
            setLoading(false);
        }
    }, [user, markAllAsRead]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);
    
    return (
        <main className="bg-surface p-6 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-bold text-text-primary mb-6 border-b border-border pb-4">Notifications</h1>
            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : error ? (
                <div className="text-center text-danger py-12">{error}</div>
            ) : notifications.length > 0 ? (
                <div className="space-y-2">
                    {notifications.map(notification => (
                        <NotificationItem key={notification.id} notification={notification} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-text-secondary py-12">
                    <p>You have no notifications yet.</p>
                </div>
            )}
        </main>
    );
};
