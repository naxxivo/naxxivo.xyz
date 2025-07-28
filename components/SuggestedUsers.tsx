import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pb, getAvatarUrl } from '../services/pocketbase';
import type { User } from '../types';
import { Spinner } from './Spinner';

export const SuggestedUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const result = await pb.collection('users').getList<User>(1, 5, {
                    filter: 'avatar != ""',
                    sort: '-created',
                    requestKey: null
                });
                setUsers(result.items);
            } catch (err) {
                console.error("Failed to fetch suggested users:", err);
                setError("Could not load suggestions.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="bg-surface rounded-2xl shadow-xl p-4 flex justify-center items-center h-48">
                <Spinner size="sm" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-surface rounded-2xl shadow-xl p-4">
                 <h2 className="text-lg font-bold text-text-primary mb-3">Who to Follow</h2>
                 <p className="text-sm text-danger">{error}</p>
            </div>
        );
    }

    if (users.length === 0) {
        return null;
    }

    return (
        <div className="bg-surface rounded-2xl shadow-xl p-4">
            <h2 className="text-lg font-bold text-text-primary mb-3">Who to Follow</h2>
            <div className="space-y-4">
                {users.map(user => (
                    <div key={user.id} className="flex items-center space-x-3">
                        <Link to={`/profile/${user.id}`}>
                            <img 
                                src={getAvatarUrl(user)} 
                                alt={user.name} 
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        </Link>
                        <div className="flex-1">
                            <Link to={`/profile/${user.id}`} className="font-semibold text-text-primary text-sm hover:underline">{user.name}</Link>
                            <p className="text-xs text-text-secondary">@{user.name.toLowerCase().replace(/\s+/g, '')}</p>
                        </div>
                        <Link to={`/profile/${user.id}`} className="px-3 py-1 text-xs font-semibold bg-primary text-white rounded-full hover:bg-primary-hover">
                            View
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};