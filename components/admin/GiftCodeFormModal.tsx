import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tables } from '../../integrations/supabase/types';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';

type GiftCode = Tables<'gift_codes'>;

interface GiftCodeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (codeData: Partial<GiftCode>) => Promise<void>;
}

const generateRandomCode = (length = 7) => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const GiftCodeFormModal: React.FC<GiftCodeFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<GiftCode>>({
        code: generateRandomCode(),
        xp_reward: 100,
        max_uses: 100,
        max_uses_per_user: 1,
        expires_at: '',
        is_active: true,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'code' ? value.toUpperCase() : value)
        }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({
            ...formData,
            xp_reward: Number(formData.xp_reward),
            max_uses: formData.max_uses ? Number(formData.max_uses) : null,
            max_uses_per_user: Number(formData.max_uses_per_user),
            expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        });
        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
                    <motion.div
                        {...{
                            initial: { opacity: 0, y: -50 },
                            animate: { opacity: 1, y: 0 },
                            exit: { opacity: 0, y: 50 },
                        } as any}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full"
                        onClick={e => e.stopPropagation()}
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold dark:text-gray-200">Create New Gift Code</h2>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <Input
                                    id="code"
                                    label="Code"
                                    name="code"
                                    value={formData.code || ''}
                                    onChange={handleChange}
                                    required
                                    maxLength={7}
                                    rightElement={
                                        <button type="button" onClick={() => setFormData(p => ({...p, code: generateRandomCode()}))} className="text-xs text-indigo-500 hover:text-indigo-700">
                                            Generate
                                        </button>
                                    }
                                />
                                
                                <Input id="xp_reward" label="XP Reward" name="xp_reward" type="number" value={String(formData.xp_reward) || ''} onChange={handleChange} required />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <Input id="max_uses" label="Max Uses (optional)" name="max_uses" type="number" value={String(formData.max_uses) || ''} onChange={handleChange} placeholder="Leave blank for unlimited"/>
                                    <Input id="max_uses_per_user" label="Max Uses Per User" name="max_uses_per_user" type="number" value={String(formData.max_uses_per_user) || ''} onChange={handleChange} required />
                                </div>
                                
                                <Input id="expires_at" label="Expires At (optional)" name="expires_at" type="date" value={String(formData.expires_at).split('T')[0] || ''} onChange={handleChange} />
                                
                                <div className="flex items-center">
                                    <input id="is_active" name="is_active" type="checkbox" checked={!!formData.is_active} onChange={handleChange} className="h-4 w-4 rounded" />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Code is Active</label>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700">
                                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving} className="w-auto">Cancel</Button>
                                <Button type="submit" disabled={isSaving} className="w-auto">
                                    {isSaving ? <LoadingSpinner /> : 'Save Code'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GiftCodeFormModal;
