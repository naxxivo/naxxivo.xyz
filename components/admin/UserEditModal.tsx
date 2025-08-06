import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tables, Enums } from '../../integrations/supabase/types';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

type Profile = Pick<Tables<'profiles'>, 'id' | 'name' | 'username' | 'status' | 'xp_balance' | 'role'>;

interface UserEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { role: Enums<'user_role'>; status: Enums<'profile_status'>; xpAdjustment: number }, notes: string) => Promise<void>;
    userToEdit: Profile;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const [role, setRole] = useState<Enums<'user_role'>>(userToEdit.role);
    const [status, setStatus] = useState<Enums<'profile_status'>>(userToEdit.status);
    const [xpAdjustment, setXpAdjustment] = useState(0);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const hasChanges = role !== userToEdit.role || status !== userToEdit.status || xpAdjustment !== 0;

    useEffect(() => {
        // Reset form state when a new user is selected to be edited
        setRole(userToEdit.role);
        setStatus(userToEdit.status);
        setXpAdjustment(0);
        setNotes('');
    }, [userToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (hasChanges && !notes.trim()) {
            alert('Please provide notes explaining the reason for the changes.');
            return;
        }
        setIsSaving(true);
        await onSave({ role, status, xpAdjustment }, notes);
        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full"
                        onClick={e => e.stopPropagation()}
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold dark:text-gray-200">Edit User: {userToEdit.name || userToEdit.username}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">@{userToEdit.username}</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                        <select id="role" value={role} onChange={(e) => setRole(e.target.value as Enums<'user_role'>)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as Enums<'profile_status'>)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                            <option value="active">Active</option>
                                            <option value="banned">Banned</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="xpAdjustment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adjust XP</label>
                                    <input
                                        type="number"
                                        id="xpAdjustment"
                                        value={xpAdjustment}
                                        onChange={(e) => setXpAdjustment(parseInt(e.target.value, 10) || 0)}
                                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md"
                                        placeholder="e.g., 500 or -100"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current XP: {userToEdit.xp_balance}. New XP will be: {userToEdit.xp_balance + xpAdjustment}</p>
                                </div>
                                 <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Admin Notes (Required for changes)</label>
                                    <textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md"
                                        rows={3}
                                        placeholder="e.g., Rewarded user for contest participation."
                                        required={hasChanges}
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700">
                                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving} className="w-auto">Cancel</Button>
                                <Button type="submit" disabled={isSaving || !hasChanges} className="w-auto px-6">
                                    {isSaving ? <LoadingSpinner /> : 'Save'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserEditModal;