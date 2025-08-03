
import React, { useState, useEffect } from 'react';
import { supabase } from '@/locales/en/pages/services/supabase.ts';
import { Profile } from '@/types.ts';
import { AnimeLoader } from '@/components/ui/Loader.tsx';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/solid';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            let query = supabase.from('profiles').select('id, username, created_at, role, name, bio, photo_url, cover_url, address, website_url, youtube_url, facebook_url');

            if (searchTerm) {
                query = query.or(`username.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);
            }
            
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;
            if (error) {
                setError('Failed to fetch users.');
                console.error(error);
            } else {
                setUsers(data as any[] || []);
            }
            setLoading(false);
        };
        
        const debounceTimer = setTimeout(() => fetchUsers(), 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleDeleteUser = async (userId: string, username: string) => {
        if (window.confirm(`Are you sure you want to delete user @${username}? This will delete their profile, but their auth record will remain. This action is not easily reversible.`)) {
            const { error } = await supabase.from('profiles').delete().eq('id', userId);
            if (error) {
                alert(`Failed to delete user: ${error.message}`);
            } else {
                alert('User profile deleted successfully.');
                setUsers(users.filter(u => u.id !== userId));
            }
        }
    };
    
    const defaultAvatar = (seed: string | null) => `https://api.dicebear.com/8.x/pixel-art/svg?seed=${seed || 'default'}`;

    return (
        <div>
            <h1 className="text-4xl font-display font-bold mb-8">User Management</h1>
            <div className="mb-6 bg-white dark:bg-dark-card p-4 rounded-xl shadow-md">
                 <div className="relative flex-grow w-full">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by username or display name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-bg/50 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none"
                    />
                </div>
            </div>

            {loading ? <AnimeLoader /> : error ? <p className="text-red-500">{error}</p> : (
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-dark-bg/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.photo_url || defaultAvatar(user.username)} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <Link to={`/profile/${user.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:underline">{user.name || user.username}</Link>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteUser(user.id, user.username)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {users.length === 0 && <p className="text-center py-10">No users found.</p>}
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;