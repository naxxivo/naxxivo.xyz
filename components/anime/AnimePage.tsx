import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import type { Tables } from '../../integrations/supabase/types';
import Button from '../common/Button';
import CreateSeriesModal from './CreateSeriesModal';
import LoadingSpinner from '../common/LoadingSpinner';

interface AnimePageProps {
    session: Session;
    onViewSeries: (seriesId: number) => void;
}

type Series = Tables<'anime_series'>;

const AnimePage: React.FC<AnimePageProps> = ({ session, onViewSeries }) => {
    const [series, setSeries] = useState<Series[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const fetchSeries = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('anime_series')
                .select('id, created_at, title, thumbnail_url, description, banner_url, user_id')
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (data) setSeries(data as unknown as Series[]);
        } catch (err: any) {
            setError(err.message || 'Failed to load anime series.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeries();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center pt-20">
                <LoadingSpinner />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center pt-20 text-red-400" role="alert">
                <p>Error loading content: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Anime Series</h1>
                <div className="w-40">
                    <Button onClick={() => setCreateModalOpen(true)}>Create Series</Button>
                </div>
            </div>

            {series.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {series.map(s => (
                        <button key={s.id} onClick={() => onViewSeries(s.id)} className="group text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
                            <div className="aspect-[2/3] bg-[#1C1B33] rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105">
                                <img src={s.thumbnail_url || `https://api.dicebear.com/8.x/icons/svg?seed=${s.title}`} alt={s.title} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="mt-2 font-semibold text-white truncate group-hover:text-blue-400">{s.title}</h3>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-4 bg-[#1C1B33] rounded-2xl">
                    <h2 className="text-xl font-semibold text-white">No Anime Found</h2>
                    <p className="text-gray-400 mt-2">Be the first to create a new anime series!</p>
                </div>
            )}
            
            <CreateSeriesModal 
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSeriesCreated={() => {
                    setCreateModalOpen(false);
                    fetchSeries(); // Refresh list
                }}
            />
        </div>
    );
};

export default AnimePage;