import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Tables } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import { BackArrowIcon, PlayIcon } from '../common/AppIcons';
import { motion } from 'framer-motion';

interface SeriesDetailPageProps {
    seriesId: number;
    onBack: () => void;
}

type Series = Tables<'anime_series'>;
type Episode = Tables<'anime_episodes'>;

const SeriesDetailPage: React.FC<SeriesDetailPageProps> = ({ seriesId, onBack }) => {
    const [series, setSeries] = useState<Series | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [selectedEpisodeUrl, setSelectedEpisodeUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!seriesId) return;
        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: seriesData, error: seriesError } = await supabase
                    .from('anime_series')
                    .select('*')
                    .eq('id', seriesId)
                    .single();

                if (seriesError) throw seriesError;
                setSeries(seriesData);

                const { data: episodesData, error: episodesError } = await supabase
                    .from('anime_episodes')
                    .select('*')
                    .eq('series_id', seriesId)
                    .order('episode_number', { ascending: true });

                if (episodesError) throw episodesError;
                setEpisodes(episodesData || []);

            } catch (err: any) {
                setError(err.message || "Failed to load series details.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [seriesId]);

    if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner /></div>;
    if (error) return <div className="text-center pt-20 text-red-500">{error}</div>;
    if (!series) return <div className="text-center pt-20 text-gray-500">Series not found.</div>;

    return (
        <div className="min-h-screen bg-white">
            <div className="relative">
                {selectedEpisodeUrl ? (
                    <div className="w-full aspect-video bg-black flex items-center justify-center">
                        <video
                            key={selectedEpisodeUrl} // Re-mounts the video player on URL change
                            src={selectedEpisodeUrl}
                            controls
                            autoPlay
                            playsInline
                            className="w-full h-full"
                        />
                    </div>
                ) : (
                    <div className="w-full aspect-video bg-gray-300 relative">
                        {series.banner_url && <img src={series.banner_url} alt={`${series.title} banner`} className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-black/30"></div>
                    </div>
                )}
                 <button onClick={onBack} className="absolute top-3 left-3 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors">
                    <BackArrowIcon />
                 </button>
            </div>
            
            <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-800">{series.title}</h1>
                {series.description && <p className="text-gray-600 mt-2 text-sm">{series.description}</p>}
            </div>

            <div className="p-4 pt-2">
                <h2 className="text-lg font-semibold mb-3">Episodes</h2>
                <div className="space-y-2">
                    {episodes.length > 0 ? episodes.map(ep => (
                        <motion.button
                            key={ep.id}
                            onClick={() => setSelectedEpisodeUrl(ep.video_url)}
                            className="w-full flex items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="w-10 h-10 bg-violet-200 text-violet-600 rounded-md flex items-center justify-center font-bold text-lg flex-shrink-0">
                                {ep.episode_number}
                            </div>
                            <div className="ml-4 text-left flex-grow overflow-hidden">
                                <p className="font-medium truncate">{ep.title || `Episode ${ep.episode_number}`}</p>
                            </div>
                            <div className="ml-2 text-violet-500">
                                <PlayIcon className="w-5 h-5" />
                            </div>
                        </motion.button>
                    )) : (
                        <p className="text-gray-500">No episodes have been added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeriesDetailPage;