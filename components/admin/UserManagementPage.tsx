import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/auth-js';
import type { Tables, Enums, TablesInsert, TablesUpdate } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import { generateAvatar } from '../../utils/helpers';
import UserEditModal from './UserEditModal';

type Profile = Pick<Tables<'profiles'>, 'id' | 'name' | 'username' | 'photo_url' | 'status' | 'xp_balance' | 'is_admin' | 'created_at'>;

interface UserManagementPageProps {
    session: Session;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ session }) => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Profile | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        let query = supabase.from('profiles').select('id, name, username, photo_url, status, xp_balance, is_admin, created_at').order('created_at', { ascending: false });

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
    }, [searchTerm]);


    useEffect(() => {
        const searchTimeout = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(searchTimeout);
    }, [searchTerm, fetchUsers]);
    
    const handleEditClick = (user: Profile) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = async (
        updatedProfileData: { isAdmin: boolean; status: Enums<'profile_status'>; xpAdjustment: number },
        notes: string
    ) => {
        if (!editingUser) return;

        const adminId = session.user.id;
        const targetId = editingUser.id;
        const changes: { action: string, details: any }[] = [];
        
        const profileUpdatePayload: TablesUpdate<'profiles'> = {};

        const currentIsAdmin = !!editingUser.is_admin;
        // Compare and log changes
        if (updatedProfileData.isAdmin !== currentIsAdmin) {
            changes.push({ action: 'admin_status_change', details: { from: currentIsAdmin, to: updatedProfileData.isAdmin } });
            profileUpdatePayload.is_admin = updatedProfileData.isAdmin;
        }
        if (updatedProfileData.status !== editingUser.status) {
            changes.push({ action: 'status_change', details: { from: editingUser.status, to: updatedProfileData.status } });
            profileUpdatePayload.status = updatedProfileData.status;
        }
        if (updatedProfileData.xpAdjustment !== 0) {
            const newXp = editingUser.xp_balance + updatedProfileData.xpAdjustment;
            changes.push({ action: 'xp_adjustment', details: { from: editingUser.xp_balance, to: newXp, adjustment: updatedProfileData.xpAdjustment } });
            profileUpdatePayload.xp_balance = newXp;
        }
        
        if (changes.length === 0) {
            alert("No changes were made.");
            setIsModalOpen(false);
            return;
        }
        
        try {
            // Update the profile first
            if (Object.keys(profileUpdatePayload).length > 0) {
                 const { error: profileError } = await supabase.from('profiles').update(profileUpdatePayload).eq('id', targetId);
                 if (profileError) throw profileError;
            }

            // Then insert into the audit log
            const auditLogPayloads: TablesInsert<'admin_audit_log'>[] = changes.map(change => ({
                admin_user_id: adminId,
                target_id: targetId,
                action: `${change.action}: ${notes}`,
                details: change.details,
            }));
            
            const { error: logError } = await supabase.from('admin_audit_log').insert(auditLogPayloads);
            if (logError) throw logError;
            
            alert("User updated successfully!");
            setIsModalOpen(false);
            await fetchUsers(); // Refresh the user list

        } catch (error: any) {
            console.error("Failed to update user:", error);
            let detailMessage = 'An unknown error occurred.';
            if (error) {
                if (error.message) {
                    detailMessage = `Message: ${error.message}`;
                    if (error.details) detailMessage += `\nDetails: ${error.details}`;
                    if (error.hint) detailMessage += `\nHint: ${error.hint}`;
                    if (error.code) detailMessage += `\nCode: ${error.code}`;
                } else {
                    try {
                        detailMessage = JSON.stringify(error, null, 2);
                    } catch {
                        detailMessage = "Could not stringify the error object. Check the console for more details.";
                    }
                }
            }
            alert(`Failed to update user:\n${detailMessage}`);
        }
    };


    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name, username, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow"
                />
            </div>
            {loading ? (
                <div className="flex justify-center items-center py-10"><LoadingSpinner /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">XP Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.photo_url || generateAvatar(user.username)} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{user.name || user.username}</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.xp_balance.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 capitalize">
                                        {user.is_admin ? 'Admin' : 'User'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEditClick(user)} className="text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300 font-semibold">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && editingUser && (
                <UserEditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveUser}
                    userToEdit={editingUser}
                />
            )}
        </div>
    );
};

export default UserManagementPage;