
import React from 'react';
import Button from '@/components/ui/Button.tsx';
import Switch from '@/components/ui/Switch.tsx';
import { PencilSquareIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

interface SiteBuilderToolbarProps {
    onAddComponent: (type: 'text' | 'image' | 'video') => void;
    onPublishToggle: (published: boolean) => void;
    isPublished: boolean;
    saving: boolean;
}

const SiteBuilderToolbar: React.FC<SiteBuilderToolbarProps> = ({ onAddComponent, onPublishToggle, isPublished, saving }) => {
    const { t } = useTranslation();
    return (
        <div className="p-2 mb-2 bg-white dark:bg-dark-card rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <span className="font-semibold mr-2">{t('siteBuilder.addComponent')}:</span>
                <Button onClick={() => onAddComponent('text')} variant="secondary" className="!px-3 !py-1 !text-sm !flex items-center gap-2">
                   <PencilSquareIcon className="w-4 h-4" /> {t('siteBuilder.addText')}
                </Button>
                <Button onClick={() => onAddComponent('image')} variant="secondary" className="!px-3 !py-1 !text-sm !flex items-center gap-2">
                   <PhotoIcon className="w-4 h-4" /> {t('siteBuilder.addImage')}
                </Button>
            </div>
            <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold transition-opacity ${saving ? 'opacity-100' : 'opacity-0'}`}>
                    {t('siteBuilder.saving')}
                </span>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{t('siteBuilder.publish')}</span>
                    <Switch checked={isPublished} onChange={onPublishToggle} />
                </div>
            </div>
        </div>
    );
}

export default SiteBuilderToolbar;