import React from 'react';
import { Link } from 'react-router-dom';
import type { Notification, User } from '../types';
import { getAvatarUrl } from '../services/pocketbase';
import { HeartIcon } from './icons/HeartIcon';
import { CommentIcon } from './icons/CommentIcon';
import { PlusIcon } from './icons/PlusIcon'; // Re-using Plus for Follow

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
};

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    const baseClass = "w-6 h-6 text-white";
    switch (type) {
        case 'like':
            return <div className="p-2 bg-danger rounded-full"><HeartIcon className={baseClass} /></div>;
        case 'comment':
            return <div className="p-2 bg-primary rounded-full"><CommentIcon className={baseClass} /></div>;
        case 'follow':
            return <div className="p-2 bg-success rounded-full"><PlusIcon className={baseClass} /></div>;
        default:
            return null;
    }
}

export const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const sourceUser = notification.expand?.source_user as User | undefined;
    
    if (!sourceUser) {
        return null; // Don't render if the source user is deleted or missing
    }
    
    let message: React.ReactNode;
    let linkTo: string;

    switch (notification.type) {
        case 'like':
            message = <>liked your post.</>;
            linkTo = `/posts/${notification.post}`;
            break;
        case 'comment':
            message = <>commented on your post.</>;
            linkTo = `/posts/${notification.post}`;
            break;
        case 'follow':
            message = <>started following you.</>;
            linkTo = `/profile/${sourceUser.id}`;
            break;
        default:
            return null;
    }

    return (
        <Link 
            to={linkTo} 
            className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                !notification.read ? 'bg-primary/10' : 'bg-transparent'
            } hover:bg-secondary`}
        >
            <div className="flex-shrink-0 relative">
                <img src={getAvatarUrl(sourceUser)} alt={sourceUser.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="absolute -bottom-1 -right-1">
                    <NotificationIcon type={notification.type} />
                </div>
            </div>
            <div className="flex-1">
                <p className="text-text-primary">
                    <span className="font-bold">{sourceUser.name}</span> {message}
                </p>
                <p className="text-sm text-text-secondary">{timeSince(notification.created)} ago</p>
            </div>
        </Link>
    );
};
