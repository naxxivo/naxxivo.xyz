import React from 'react';
import type { User } from '../types';
import Icon from './Icon';
import { supabase } from '../lib/supabase';

interface ProfileHeaderProps {
  user: User;
  isAdmin?: boolean;
  onAdminClick?: () => void;
  isCurrentUser?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isAdmin = false, onAdminClick, isCurrentUser = false }) => {
    
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col items-center md:flex-row md:items-start p-8 relative">
      {isCurrentUser && (
        <div className="absolute top-4 right-4 flex items-center space-x-2">
            {isAdmin && (
                <button onClick={onAdminClick} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700 transition-colors" title="Admin Panel">
                    <Icon name="user-shield" className="w-6 h-6 text-sky-400" />
                    <span className="text-sm font-semibold text-sky-400 hidden sm:block">Admin Panel</span>
                </button>
            )}
            <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-slate-700 transition-colors" title="Sign Out">
                <Icon name="logout" className="w-6 h-6 text-slate-400" />
            </button>
        </div>
      )}
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="w-32 h-32 rounded-full border-4 border-slate-700 shadow-lg"
      />
      <div className="mt-4 md:mt-0 md:ml-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-white">{user.name}</h1>
        <p className="text-sky-400">@{user.username}</p>
        <p className="mt-2 max-w-md text-slate-300">{user.bio}</p>
        {isCurrentUser && (
            <div className="mt-6 flex justify-center md:justify-start space-x-4">
            <button className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md">
                Edit Profile
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
