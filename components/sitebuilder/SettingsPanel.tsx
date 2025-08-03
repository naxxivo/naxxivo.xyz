
import React from 'react';
import { SiteComponent } from '@/types.ts';
import Input from '@/components/ui/Input.tsx';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

interface SettingsPanelProps {
    activeComponent: SiteComponent | null;
    onUpdate: (id: number, newData: object) => void;
    onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ activeComponent, onUpdate, onClose }) => {
    const { t } = useTranslation();
    if (!activeComponent) {
        return (
            <div className="p-4 bg-white dark:bg-dark-card rounded-lg h-full flex items-center justify-center text-center">
                <p className="text-gray-500">Select a component on the canvas to edit its properties.</p>
            </div>
        );
    }
    
    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdate(activeComponent.id, { [e.target.name]: e.target.value });
    };

    const renderSettings = () => {
        switch (activeComponent.component_type) {
            case 'text':
                return (
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('siteBuilder.editText')}</label>
                        <textarea
                            name="text"
                            value={activeComponent.component_data.text || ''}
                            onChange={handleUpdate}
                            rows={6}
                            className="w-full px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner"
                        />
                    </div>
                );
            case 'image':
                return (
                    <Input
                        id="image-url"
                        label={t('siteBuilder.imageUrl')}
                        name="url"
                        value={activeComponent.component_data.url || ''}
                        onChange={handleUpdate}
                        placeholder="https://..."
                    />
                );
            default:
                return <p>No settings available for this component type.</p>;
        }
    };
    
    return (
        <div className="p-4 bg-white dark:bg-dark-card rounded-lg h-full shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{t('siteBuilder.settings')}</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg">
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
            <div className="space-y-4">
                {renderSettings()}
            </div>
        </div>
    );
};

export default SettingsPanel;