
import React from 'react';
import PageTransition from '../components/ui/PageTransition';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/notifications/NotificationItem';
import { AnimeLoader } from '../components/ui/Loader';
import { InboxIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';

const NotificationsPage: React.FC = () => {
  const { notifications, loading, error, markAllAsRead, unreadCount } = useNotifications();

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-4xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="secondary" className="text-sm !px-4 !py-2">
                Mark all as read
            </Button>
          )}
        </div>
        
        <div className="bg-white/60 dark:bg-dark-card/70 backdrop-blur-lg rounded-2xl shadow-2xl shadow-primary-blue/20 overflow-hidden">
             <div className="max-h-[70vh] overflow-y-auto">
                {loading ? (
                    <div className="p-8"><AnimeLoader /></div>
                ) : error ? (
                    <p className="p-8 text-center text-red-500">Could not load notifications.</p>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <InboxIcon className="w-24 h-24 mx-auto mb-4 opacity-50" />
                        <p className="font-semibold text-xl">No notifications yet</p>
                        <p className="text-base mt-2">Interactions from other users will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map(n => (
                            <NotificationItem key={n.id} notification={n} closePopover={() => {}} />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotificationsPage;
