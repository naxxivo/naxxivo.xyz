import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { Tables, Enums, TablesInsert, TablesUpdate } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import { generateAvatar } from '../../utils/helpers';
import UserEditModal from './UserEditModal';

type Profile = Pick<Tables<'profiles'>, 'id' | 'name' | 'username' | 'photo_url' | 'status' | 'xp_balance' | 'role' | 'created_at'>;

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
        updatedProfileData: { role: Enums<'user_role'>; status: Enums<'profile_status'>; xpAdjustment: number },
        notes: string
    ) => {
        if (!editingUser) return;

        const adminId = session.user.id;
        const targetId = editingUser.id;
        const changes: { action: string, details: any }[] = [];
        
        const profileUpdatePayload: TablesUpdate<'profiles'> = {};

        // Compare and log changes
        if (updatedProfileData.role !== editingUser.role) {
            changes.push({ action: 'role_change', details: { from: editingUser.role, to: updatedProfileData.role } });
            profileUpdatePayload.role = updatedProfileData.role;
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
            const { error: profileError } = await supabase.from('profiles').update(profileUpdatePayload).eq('id', targetId);
            if (profileError) throw profileError;

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
            alert(`Error updating user: ${error.message}`);
        }
    };


    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name, username, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
            </div>
            {loading ? (
                <div className="flex justify-center items-center"><LoadingSpinner /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">XP Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.photo_url || generateAvatar(user.username)} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{user.name || user.username}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.xp_balance}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEditClick(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Edit</button>
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