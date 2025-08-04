
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationWithSender } from '../../types';
import { useNotifications } from '../../hooks/useNotifications';
import { HeartIcon, ChatBubbleOvalLeftEllipsisIcon, UserPlusIcon } from '@heroicons/react/24/solid';

interface NotificationItemProps {
    notification: NotificationWithSender;
    closePopover: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, closePopover }) => {
    const navigate = useNavigate();
    const { markAsRead } = useNotifications();
    const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${notification.sender?.username || 'default'}`;

    const handleClick = async () => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        closePopover();
        
        // Navigate to the correct page
        switch(notification.type) {
            case 'like':
            case 'comment':
                if (notification.post_id) {
                    navigate(`/post/${notification.post_id}`);
                } else {
                    navigate(`/profile/${notification.sender_id}`);
                }
                break;
            case 'follow':
                navigate(`/profile/${notification.sender_id}`);
                break;
            default:
                break;
        }
    };
    
    const renderIcon = () => {
        const iconClasses = "h-5 w-5 text-white";
        switch (notification.type) {
            case 'like':
                return <div className="bg-red-500 p-1.5 rounded-full"><HeartIcon className={iconClasses} /></div>;
            case 'comment':
                return <div className="bg-blue-500 p-1.5 rounded-full"><ChatBubbleOvalLeftEllipsisIcon className={iconClasses} /></div>;
            case 'follow':
                return <div className="bg-green-500 p-1.5 rounded-full"><UserPlusIcon className={iconClasses} /></div>;
            default:
                return null;
        }
    };
    
    const renderMessage = () => {
        const senderName = `<strong>${notification.sender?.name || notification.sender?.username || 'Someone'}</strong>`;

        switch (notification.type) {
            case 'like':
                return `${senderName} liked your post.`;
            case 'comment':
                return `${senderName} commented on your post.`;
            case 'follow':
                return `${senderName} started following you.`;
            default:
                return 'New notification';
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`flex items-start gap-4 p-4 cursor-pointer transition-colors duration-200 ${notification.is_read ? 'hover:bg-gray-50 dark:hover:bg-dark-bg/50' : 'bg-accent/10 hover:bg-accent/20'}`}
        >
            <div className="relative">
                <img
                    src={notification.sender?.photo_url || defaultAvatar}
                    alt={notification.sender?.name || ''}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1">
                    {renderIcon()}
                </div>
            </div>
            <div className="flex-grow">
                <p className="text-sm text-secondary-purple dark:text-dark-text"
                   dangerouslySetInnerHTML={{ __html: renderMessage() as string }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(notification.created_at).toLocaleString()}</p>
            </div>
            {!notification.is_read && (
                <div className="flex-shrink-0 self-center">
                    <div className="w-2.5 h-2.5 bg-accent rounded-full"></div>
                </div>
            )}
        </div>
    );
};

export default NotificationItem;
