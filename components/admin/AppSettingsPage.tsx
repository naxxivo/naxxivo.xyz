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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-bold dark:text-gray-200">Application Settings</h2>
            {settings.map(setting => (
                <div key={setting.key} className="p-4 border dark:border-gray-700 rounded-md">
                    <h3 className="font-semibold text-lg capitalize dark:text-gray-200">{setting.key.replace(/_/g, ' ')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{setting.description}</p>
                    {editingKey === setting.key ? (
                        <div className="space-y-2">
                            <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md font-mono text-sm"
                                rows={8}
                            />
                            <div className="flex space-x-2">
                                <Button onClick={() => handleSave(setting.key)} size="small" className="w-auto">Save</Button>
                                <Button onClick={handleCancel} variant="secondary" size="small" className="w-auto">Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-sm overflow-x-auto text-gray-800 dark:text-gray-200">
                                {JSON.stringify(setting.value, null, 2)}
                            </pre>
                            <button onClick={() => handleEdit(setting)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm mt-2">Edit</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AppSettingsPage;