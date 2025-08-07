import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { Tables } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import { generateAvatar } from '../../utils/helpers';

type Profile = Pick<Tables<'profiles'>, 'id' | 'name' | 'username' | 'photo_url' | 'status' | 'xp_balance' | 'role' | 'created_at'>;

interface UserManagementPageProps {
    session: Session;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ session }) => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            let query = supabase.from('profiles').select('id, name, username, photo_url, status, xp_balance, role, created_at').order('created_at', { ascending: false });

            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Failed to fetch users:", error);
            } else {
                setUsers(data || []);
            }
            setLoading(false);
        };

        const searchTimeout = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(searchTimeout);
    }, [searchTerm]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name, username, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>
            {loading ? (
                <div className="flex justify-center items-center"><LoadingSpinner /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.photo_url || generateAvatar(user.username)} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name || user.username}</div>
                                                <div className="text-sm text-gray-500">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.xp_balance}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button disabled className="text-gray-400 cursor-not-allowed">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;