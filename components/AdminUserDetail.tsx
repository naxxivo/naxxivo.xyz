import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import type { Database } from '../lib/database.types';
import ProfileHeader from './ProfileHeader';
import PermissionStatusList from './PermissionStatusList';
import DataTabs from './DataTabs';
import Icon from './Icon';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AdminUserDetailProps {
    userId: string;
    onBack: () => void;
}

const AdminUserDetail: React.FC<AdminUserDetailProps> = ({ userId, onBack }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error("Error fetching user profile:", error);
            } else {
                setProfile(data);
            }
            setLoading(false);
        };
        fetchUserProfile();
    }, [userId]);

    if (loading) {
        return <div className="min-h-screen w-full flex items-center justify-center"><p className="text-white">Loading user profile...</p></div>;
    }

    if (!profile) {
        return <div className="min-h-screen w-full flex items-center justify-center"><p className="text-red-400">Could not find user profile.</p></div>;
    }

    const appUser: User = {
        name: profile.full_name || profile.email?.split('@')[0] || 'User',
        username: profile.email?.split('@')[0] || 'username',
        avatarUrl: profile.avatar_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${profile.id}`,
        bio: `Viewing data for user ID: ${profile.id}`,
        stats: { posts: 0, followers: 0, following: 0 },
    };

    return (
        <div className="w-full max-w-5xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
            <div className="p-8 border-b border-slate-700">
                 <button onClick={onBack} className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors mb-4">
                    <Icon name="arrow-left" className="w-5 h-5" />
                    <span>Back to User List</span>
                </button>
            </div>
            <ProfileHeader user={appUser} />
            <div className="p-8 space-y-8">
                <PermissionStatusList userId={userId} />
                <DataTabs userId={userId} />
            </div>
        </div>
    );
};

export default AdminUserDetail;
