import React from 'react';
import type { Session } from '@supabase/supabase-js';
import type { User } from '../types';
import ProfileHeader from './ProfileHeader';
import PermissionStatusList from './PermissionStatusList';
import DataTabs from './DataTabs';

interface UserProfileProps {
    session: Session;
    isAdmin: boolean;
    onAdminClick: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ session, isAdmin, onAdminClick }) => {
    const appUser: User = {
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        username: session.user.user_metadata?.user_name || session.user.email?.split('@')[0] || 'username',
        avatarUrl: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${session.user.id}`,
        bio: "Welcome to your personal dashboard. Here you can see your synced data and manage permissions.",
        stats: { posts: 0, followers: 0, following: 0 }, 
      };

    return (
        <div className="w-full max-w-5xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
            <ProfileHeader 
                user={appUser} 
                isAdmin={isAdmin} 
                onAdminClick={onAdminClick}
                isCurrentUser={true}
            />
            <div className="p-8 space-y-8">
                <PermissionStatusList userId={session.user.id}/>
                <DataTabs userId={session.user.id} />
            </div>
        </div>
    );
};

export default UserProfile;
