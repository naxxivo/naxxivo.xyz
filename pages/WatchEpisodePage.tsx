
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { AnimeEpisodeWithSeries } from '../types';
import PageTransition from '../components/ui/PageTransition';
import { AnimeLoader } from '../components/ui/Loader';
import VideoPlayer from '../components/anime/VideoPlayer';
import Button from '../components/ui/Button';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const WatchEpisodePage: React.FC = () => {
  const { seriesId, episodeNumber } = useParams<{ seriesId: string; episodeNumber: string }>();
  const navigate = useNavigate();

  const [episode, setEpisode] = useState<AnimeEpisodeWithSeries | null>(null);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisode = async () => {
      if (!seriesId || !episodeNumber) return;
      setLoading(true);

      try {
        const { data, error: episodeError } = await supabase
          .from('anime_episodes')
          .select('*, anime_series(*)')
          .eq('series_id', seriesId)
          .eq('episode_number', episodeNumber)
          .single();

        if (episodeError) throw episodeError;
        setEpisode(data as unknown as AnimeEpisodeWithSeries);

        const { count, error: countError } = await supabase
          .from('anime_episodes')
          .select('*', { count: 'exact', head: true })
          .eq('series_id', seriesId);

        if (countError) throw countError;
        setTotalEpisodes(count || 0);

      } catch (err: any) {
        console.error('Error fetching episode:', err);
        setError('Could not load this episode. It might not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchEpisode();
  }, [seriesId, episodeNumber]);

  if (loading) return <AnimeLoader />;
  if (error || !episode) return <p className="text-center text-red-500 py-10">{error || 'Episode not found.'}</p>;

  const currentEpNum = parseInt(episodeNumber || '0');
  const hasPrev = currentEpNum > 1;
  const hasNext = currentEpNum < totalEpisodes;

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link to={`/anime/${seriesId}`} className="text-accent hover:underline font-bold">
            &larr; Back to {episode.anime_series.title}
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">
            {episode.title || `Episode ${episode.episode_number}`}
          </h1>
          <p className="text-lg text-secondary-purple/80 dark:text-dark-text/80">{episode.anime_series.title} - Episode {episode.episode_number}</p>
        </div>

        <VideoPlayer url={episode.video_url} />

        <div className="flex justify-between items-center mt-6">
          <Button 
            text="Previous Episode"
            variant="secondary"
            onClick={() => navigate(`/anime/${seriesId}/episode/${currentEpNum - 1}`)}
            disabled={!hasPrev}
            className="!flex items-center gap-2"
          >
             <ArrowLeftIcon className="w-5 h-5"/>
          </Button>
          <Button 
            text="Next Episode"
            variant="secondary"
            onClick={() => navigate(`/anime/${seriesId}/episode/${currentEpNum + 1}`)}
            disabled={!hasNext}
            className="!flex items-center gap-2"
          >
            <ArrowRightIcon className="w-5 h-5"/>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
};

export default WatchEpisodePage;
