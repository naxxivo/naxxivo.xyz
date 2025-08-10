import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Tables, Json, TablesUpdate } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';

type AppSetting = Tables<'app_settings'>;

const AppSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<AppSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.from('app_settings').select('*');
            if (error) throw error;
            setSettings((data as AppSetting[]) || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch settings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleEdit = (setting: AppSetting) => {
        setEditingKey(setting.key);
        setEditValue(JSON.stringify(setting.value, null, 2));
    };

    const handleCancel = () => {
        setEditingKey(null);
        setEditValue('');
    };

    const handleSave = async (key: string) => {
        let parsedValue: Json;
        try {
            parsedValue = JSON.parse(editValue);
        } catch (e) {
            alert('Invalid JSON format.');
            return;
        }

        const { error: updateError } = await supabase
            .from('app_settings')
            .update({ value: parsedValue })
            .eq('key', key);
        
        if (updateError) {
            alert(`Failed to save: ${updateError.message}`);
        } else {
            alert('Settings saved successfully!');
            setEditingKey(null);
            await fetchSettings();
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-[var(--theme-card-bg)] p-6 rounded-xl shadow-lg border border-[var(--theme-secondary)]">
             <h2 className="text-2xl font-bold text-[var(--theme-text)]">Application Settings</h2>
             <p className="text-[var(--theme-text-secondary)] mt-1">Manage global settings for the application. Be careful, these changes are live.</p>
            <div className="space-y-6 pt-6">
                {settings.map(setting => (
                    <div key={setting.key} className="p-4 border border-[var(--theme-secondary)] rounded-lg bg-[var(--theme-card-bg-alt)]/50">
                        <h3 className="font-semibold text-lg capitalize text-[var(--theme-text)]/90">{setting.key.replace(/_/g, ' ')}</h3>
                        <p className="text-sm text-[var(--theme-text-secondary)] mb-2">{setting.description}</p>
                        {editingKey === setting.key ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="json-textarea"
                                    rows={8}
                                />
                                <div className="flex space-x-2">
                                    <Button onClick={() => handleSave(setting.key)} size="small" className="w-auto px-4">Save</Button>
                                    <Button onClick={handleCancel} variant="secondary" size="small" className="w-auto px-4">Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <pre className="json-textarea p-3 text-sm overflow-x-auto text-[var(--theme-text-secondary)]">
                                    {JSON.stringify(setting.value, null, 2)}
                                </pre>
                                <button onClick={() => handleEdit(setting)} className="text-sm font-semibold mt-2 btn-edit">Edit</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AppSettingsPage;