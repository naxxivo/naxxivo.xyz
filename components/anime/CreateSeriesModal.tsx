import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import Button from '../common/Button';

interface CreateSeriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSeriesCreated: () => void;
}

const CreateSeriesModal: React.FC<CreateSeriesModalProps> = ({ isOpen, onClose, onSeriesCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to create a series.");

            const { error: insertError } = await supabase.from('anime_series').insert([{
                title,
                description,
                thumbnail_url: thumbnailUrl || null,
                banner_url: bannerUrl || null,
                user_id: user.id
            }]);
            if (insertError) throw insertError;
            
            onSeriesCreated();
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[#1C1B33] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Close">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-white mb-6">Create New Anime Series</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required disabled={loading} className="appearance-none block w-full px-4 py-3 bg-[#100F1F] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} disabled={loading} className="appearance-none block w-full px-4 py-3 bg-[#100F1F] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                     <div>
                        <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-400 mb-2">Thumbnail URL</label>
                        <input id="thumbnailUrl" type="url" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://..." disabled={loading} className="appearance-none block w-full px-4 py-3 bg-[#100F1F] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                     <div>
                        <label htmlFor="bannerUrl" className="block text-sm font-medium text-gray-400 mb-2">Banner URL</label>
                        <input id="bannerUrl" type="url" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} placeholder="https://..." disabled={loading} className="appearance-none block w-full px-4 py-3 bg-[#100F1F] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
                    <div className="pt-4"><Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Series'}</Button></div>
                </form>
            </div>
        </div>
    );
};

export default CreateSeriesModal;