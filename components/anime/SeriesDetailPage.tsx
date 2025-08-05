import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Tables } from '../../integrations/supabase/types';
import Button from '../common/Button';
import CreateEpisodeModal from './CreateEpisodeModal';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Session } from '@supabase/supabase-js';

interface SeriesDetailPageProps {
    session: Session;
    seriesId: number;
    onBack: () => void;
}

type Series = Tables<'anime_series'>;
type Episode = Tables<'anime_episodes'>;

const SeriesDetailPage: React.FC<SeriesDetailPageProps> = ({ session, seriesId, onBack }) => {
    const [series, setSeries] = useState<Series | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: seriesData, error: seriesError } = await supabase
                .from('anime_series')
                .select('id, created_at, banner_url, description, thumbnail_url, title, user_id')
                .eq('id', seriesId)
                .single();
            if (seriesError) throw seriesError;
            if (seriesData) {
                setSeries(seriesData as Series);
            } else {
                throw new Error("Series not found.");
            }
            
            const { data: episodesData, error: episodesError } = await supabase
                .from('anime_episodes')
                .select('id, created_at, episode_number, series_id, title, video_url')
                .eq('series_id', seriesId)
                .order('episode_number', { ascending: true });
            if (episodesError) throw episodesError;

            if (episodesData) {
                setEpisodes(episodesData as Episode[]);
                if (episodesData.length > 0) {
                    setCurrentEpisode(episodesData[0] as Episode);
                }
            }

        } catch (err: any) {
            setError(err.message || 'Failed to load series details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [seriesId]);
    
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (error || !series) {
        return <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center"><p className="text-red-400">{error || "Series not found."}</p><Button onClick={onBack} className="mt-4 w-auto px-6">Back</Button></div>;
    }
    
    const canManage = series.user_id === session.user.id;
    const bannerUrl = series.banner_url || "https://via.placeholder.com/800x200/1C1B33/FFC700?text=No+Banner";

    return (
        <div className="min-h-screen bg-[#100F1F]">
             <header className="flex items-center p-3 bg-[#1C1B33] shadow-md sticky top-0 z-10 w-full">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-lg font-bold text-white truncate">{series.title}</h2>
            </header>

            <main className="w-full max-w-4xl mx-auto p-4 space-y-6">
                {/* Video Player */}
                <div className="aspect-w-16 aspect-h-9 w-full bg-black rounded-lg overflow-hidden shadow-2xl">
                    {currentEpisode?.video_url ? (
                        <iframe
                            src={currentEpisode.video_url.replace("watch?v=", "embed/")} // Basic YouTube embed conversion
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={currentEpisode.title || `Episode ${currentEpisode.episode_number}`}
                            className="w-full h-full"
                        ></iframe>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                           <p>Select an episode to begin watching.</p>
                        </div>
                    )}
                </div>
                
                {/* Series Info */}
                 <div className="bg-[#1C1B33] rounded-2xl p-6 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 w-32 h-48 bg-gray-800 rounded-lg overflow-hidden">
                             <img src={series.thumbnail_url || `https://api.dicebear.com/8.x/icons/svg?seed=${series.title}`} alt={series.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                             <h1 className="text-3xl font-bold text-white">{series.title}</h1>
                             {currentEpisode && (
                                <h2 className="text-xl font-semibold text-yellow-400 mt-1">
                                    Now Playing: Ep {currentEpisode.episode_number} - {currentEpisode.title}
                                </h2>
                            )}
                             <p className="mt-4 text-gray-300">{series.description}</p>
                        </div>
                    </div>
                </div>


                {/* Episode List */}
                <div className="bg-[#1C1B33] rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Episodes</h2>
                        {canManage && <div className="w-40"><Button onClick={() => setCreateModalOpen(true)}>Add Episode</Button></div>}
                    </div>
                    
                    <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {episodes.map(ep => (
                            <li key={ep.id}>
                                <button 
                                    onClick={() => setCurrentEpisode(ep)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${currentEpisode?.id === ep.id ? 'bg-yellow-400 text-gray-900' : 'bg-[#100F1F] hover:bg-[#2a2942]'}`}
                                >
                                    <span className="font-bold">Ep {ep.episode_number}:</span> {ep.title}
                                </button>
                            </li>
                        ))}
                         {episodes.length === 0 && (
                            <p className="text-gray-400 text-center py-4">No episodes have been added yet.</p>
                        )}
                    </ul>
                </div>
            </main>
            
            <CreateEpisodeModal 
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                seriesId={seriesId}
                onEpisodeCreated={() => {
                    setCreateModalOpen(false);
                    fetchDetails();
                }}
            />
        </div>
    );
};

export default SeriesDetailPage;