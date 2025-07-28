
import React from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../types';
import { getAvatarUrl } from '../services/pocketbase';

interface UserCardProps {
  user: User;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const usernameDisplay = user.name ? user.name.toLowerCase().replace(/\s+/g, '') : user.id;

  return (
    <Link to={`/profile/${user.id}`}>
      <div className="bg-surface rounded-lg shadow-lg p-6 flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300 h-full">
        <img
          src={getAvatarUrl(user)}
          alt={user.name}
          className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-border"
        />
        <h3 className="text-xl font-bold text-text-primary flex-grow">{user.name}</h3>
        <p className="text-sm text-primary">@{usernameDisplay}</p>
        <p className="text-text-secondary mt-2 text-sm line-clamp-2">
          {user.bio || 'This user has not set a bio yet.'}
        </p>
      </div>
    </Link>
  );
};
