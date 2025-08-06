import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Tables, TablesInsert } from '../../integrations/supabase/types';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import { BackArrowIcon } from '../common/AppIcons';

interface CreateEpisodePageProps {
    onBack: () => void;
    onEpisodeCreated: () => void;
}

type AnimeSeriesStub = Pick<Tables<'anime_series'>, 'id' | 'title'>;

const CreateEpisodePage: React.FC<CreateEpisodePageProps> = ({ onBack, onEpisodeCreated }) => {
    const [seriesList, setSeriesList] = useState<AnimeSeriesStub[]>([]);
    const [selectedSeriesId, setSelectedSeriesId] = useState('');
    const [episodeNumber, setEpisodeNumber] = useState('');
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSeries = async () => {
            const { data, error } = await supabase.from('anime_series').select('id, title').order('title');
            if (error) {
                console.error("Failed to fetch series list:", error);
            } else {
                setSeriesList(data || []);
                if (data && data.length > 0) {
                    setSelectedSeriesId(String(data[0].id));
                }
            }
        };
        fetchSeries();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const newEpisode: TablesInsert<'anime_episodes'> = {
                series_id: Number(selectedSeriesId),
                episode_number: Number(episodeNumber),
                title,
                video_url: videoUrl,
            };

            const { error: insertError } = await supabase.from('anime_episodes').insert([newEpisode] as any);
            if (insertError) throw insertError;
            
            onEpisodeCreated();

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="flex items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-gray-800 mx-auto">Add New Episode</h1>
                <div className="w-6"></div>
            </header>

            <main className="p-4">
                 {seriesList.length === 0 ? (
                    <div className="flex justify-center pt-20"><LoadingSpinner/></div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
                        <div>
                            <label htmlFor="series" className="block text-sm font-medium text-gray-700 mb-1">Series</label>
                            <select
                                id="series"
                                value={selectedSeriesId}
                                onChange={e => setSelectedSeriesId(e.target.value)}
                                className="appearance-none block w-full px-4 py-3 bg-gray-100 border-gray-200 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm"
                                required
                            >
                                {seriesList.map(series => (
                                    <option key={series.id} value={series.id}>{series.title}</option>
                                ))}
                            </select>
                        </div>
                        <Input id="episodeNumber" label="Episode Number" type="number" value={episodeNumber} onChange={e => setEpisodeNumber(e.target.value)} required disabled={loading} />
                        <Input id="episodeTitle" label="Episode Title (optional)" type="text" value={title} onChange={e => setTitle(e.target.value)} disabled={loading} />
                        <Input id="videoUrl" label="Video URL" type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required disabled={loading} placeholder="https://..." />

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        
                        <div className="pt-4">
                            <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Episode'}</Button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
};

export default CreateEpisodePage;