
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { AnimeSeriesWithEpisodes } from '../types';
import { useAuth } from '../App';
import PageTransition from '../components/ui/PageTransition';
import { AnimeLoader } from '../components/ui/Loader';
import Button from '../components/ui/Button';
import { PlayIcon, PlusCircleIcon } from '@heroicons/react/24/solid';

const SeriesDetailPage: React.FC = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const { user } = useAuth();
  const [series, setSeries] = useState<AnimeSeriesWithEpisodes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      if (!seriesId) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from('anime_series')
        .select('*, anime_episodes(*)')
        .eq('id', seriesId)
        .order('episode_number', { foreignTable: 'anime_episodes', ascending: true })
        .single();
      
      if (error) {
        console.error('Error fetching series details:', error);
        setError('Could not find this anime series.');
      } else {
        setSeries(data as unknown as AnimeSeriesWithEpisodes);
      }
      setLoading(false);
    };

    fetchSeriesDetails();
  }, [seriesId]);

  if (loading) return <AnimeLoader />;
  if (error || !series) return <p className="text-center text-red-500 py-10">{error || 'Series not found.'}</p>;

  const defaultCover = 'https://images.unsplash.com/photo-1574285013029-29296a71830f?q=80&w=2070&auto=format&fit=crop';
  const isCreator = user?.id === series.user_id;

  return (
    <PageTransition>
      <div className="relative text-white rounded-3xl shadow-2xl shadow-primary-blue/30 overflow-hidden mb-12">
        <img src={series.banner_url || defaultCover} alt={`${series.title} Banner`} className="w-full h-48 md:h-80 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col md:flex-row items-end gap-6">
          <img src={series.thumbnail_url || undefined} alt={`${series.title} Thumbnail`} className="w-32 md:w-48 rounded-lg border-4 border-white object-cover shadow-lg aspect-[2/3] -mb-12 md:-mb-20" />
          <div className="flex-grow">
            <h1 className="font-display text-4xl md:text-5xl font-bold drop-shadow-lg">{series.title}</h1>
            <p className="mt-2 text-base opacity-90 max-w-2xl">{series.description}</p>
          </div>
          {isCreator && (
            <Link to={`/anime/${series.id}/add-episode`}>
              <Button text="Add Episode" variant="secondary" className="!flex items-center gap-2">
                <PlusCircleIcon className="w-5 h-5"/>
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <div className="bg-white/60 dark:bg-dark-card/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
        <h2 className="font-display text-3xl font-bold mb-6">Episodes</h2>
        <div className="space-y-3">
          {series.anime_episodes.length > 0 ? series.anime_episodes.map(ep => (
            <Link key={ep.id} to={`/anime/${seriesId}/episode/${ep.episode_number}`}>
              <div className="flex items-center bg-white/50 dark:bg-dark-bg/50 p-4 rounded-lg hover:bg-accent/10 dark:hover:bg-accent/20 transition-all duration-300 transform hover:scale-[1.02] shadow-sm">
                <div className="bg-accent text-white rounded-full h-10 w-10 flex-shrink-0 flex items-center justify-center font-bold mr-4">
                  {ep.episode_number}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold">{ep.title || `Episode ${ep.episode_number}`}</h3>
                </div>
                <PlayIcon className="w-8 h-8 text-accent opacity-70" />
              </div>
            </Link>
          )) : (
            <p className="text-center py-6 text-secondary-purple/80 dark:text-dark-text/80">No episodes have been added yet.</p>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default SeriesDetailPage;
