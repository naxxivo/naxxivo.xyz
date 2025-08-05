import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import Button from '../common/Button';
import type { TablesInsert } from '../../integrations/supabase/types';

interface CreateEpisodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEpisodeCreated: () => void;
    seriesId: number;
}

const CreateEpisodeModal: React.FC<CreateEpisodeModalProps> = ({ isOpen, onClose, onEpisodeCreated, seriesId }) => {
    const [title, setTitle] = useState('');
    const [episodeNumber, setEpisodeNumber] = useState<number | ''>('');
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (episodeNumber === '') return;
        setLoading(true);
        setError(null);
        try {
            const newEpisode = {
                series_id: seriesId,
                episode_number: episodeNumber as number,
                title,
                video_url: videoUrl
            };
            const { error: insertError } = await supabase.from('anime_episodes').insert([newEpisode]);
            if (insertError) throw insertError;
            
            onEpisodeCreated();
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
                <h2 className="text-2xl font-bold text-white mb-6">Add New Episode</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="episodeNumber" className="block text-sm font-medium text-gray-400 mb-2">Episode Number</label>
                        <input id="episodeNumber" type="number" value={episodeNumber} onChange={e => setEpisodeNumber(e.target.value === '' ? '' : parseInt(e.target.value, 10))} required disabled={loading} className="appearance-none block w-full px-4 py-3 bg-[#100F1F] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"/>
                    </div>
                     <div>
                        <label htmlFor="episodeTitle" className="block text-sm font-medium text-gray-400 mb-2">Episode Title</label>
                        <input id="episodeTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} required disabled={loading} className="appearance-none block w-full px-4 py-3 bg-[#100F1F] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"/>
                    </div>
                     <div>
                        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-400 mb-2">Video URL (e.g., YouTube)</label>
                        <input id="videoUrl" type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required placeholder="https://www.youtube.com/watch?v=..." disabled={loading} className="appearance-none block w-full px-4 py-3 bg-[#100F1F] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"/>
                    </div>
                    {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
                    <div className="pt-4"><Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Episode'}</Button></div>
                </form>
            </div>
        </div>
    );
};

export default CreateEpisodeModal;
