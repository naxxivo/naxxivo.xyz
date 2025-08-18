import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import Icon from './Icon';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AdminPanelProps {
    onSelectUser: (userId: string) => void;
    onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onSelectUser, onBack }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfiles = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('profiles').select('*');
            if (error) {
                console.error('Error fetching profiles:', error);
                setError('Failed to load users.');
            } else {
                setProfiles(data);
            }
            setLoading(false);
        };
        fetchProfiles();
    }, []);

    const filteredProfiles = useMemo(() => {
        if (!searchTerm) return profiles;
        return profiles.filter(p => p.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [profiles, searchTerm]);
    
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="w-full max-w-5xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                     <button onClick={onBack} className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                        <Icon name="arrow-left" className="w-5 h-5" />
                        <span>Back to Profile</span>
                    </button>
                    <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                </div>
                
                <div className="relative mb-6">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                         <Icon name="search" className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-0 bg-slate-700 py-3 pl-10 pr-3 text-white shadow-sm ring-1 ring-inset ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6 transition"
                    />
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <p className="p-6 text-center text-slate-400">Loading users...</p>
                        ) : error ? (
                            <p className="p-6 text-center text-red-400">{error}</p>
                        ) : (
                            <table className="min-w-full divide-y divide-slate-700">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">User</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Role</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Joined</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">View</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredProfiles.map(profile => (
                                        <tr key={profile.id} className="hover:bg-slate-700/50 transition-colors">
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <img className="h-10 w-10 rounded-full" src={profile.avatar_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${profile.id}`} alt="" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-white">{profile.full_name || 'N/A'}</div>
                                                        <div className="text-slate-400">{profile.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.role === 'admin' ? 'bg-sky-900 text-sky-300' : 'bg-slate-700 text-slate-300'}`}>
                                                    {profile.role}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-400">{formatDate(profile.created_at)}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button onClick={() => onSelectUser(profile.id)} className="text-sky-400 hover:text-sky-300">View<span className="sr-only">, {profile.email}</span></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
