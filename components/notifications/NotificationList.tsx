
import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';
import { AnimeLoader } from '@/components/ui/Loader';
import { InboxIcon } from '@heroicons/react/24/outline';

interface NotificationListProps {
    close: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ close }) => {
    const { notifications, loading, error, markAllAsRead, unreadCount } = useNotifications();

    return (
        <div className="w-80 sm:w-96 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                    <button 
                        onClick={markAllAsRead}
                        className="text-xs text-accent hover:underline font-semibold"
                    >
                        Mark all as read
                    </button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="p-4"><AnimeLoader /></div>
                ) : error ? (
                    <p className="p-4 text-center text-red-500">Could not load notifications.</p>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <InboxIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="font-semibold">No notifications yet</p>
                        <p className="text-sm">Interactions from other users will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map(n => (
                            <NotificationItem key={n.id} notification={n} closePopover={close} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationList;
