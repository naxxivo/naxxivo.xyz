import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/App';
import { supabase } from '@/locales/en/pages/services/supabase';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/ui/PageTransition';
import Input from '@/components/ui/Input';
import { AnimeSeries, AnimeEpisodeInsert } from '@/types';
import { AnimeLoader } from '@/components/ui/Loader';

const AddEpisodePage: React.FC = () => {
  const { user } = useAuth();
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();
  
  const [series, setSeries] = useState<AnimeSeries | null>(null);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [formData, setFormData] = useState({
    episode_number: '',
    title: '',
    video_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      if (!seriesId) return;
      const { data, error } = await supabase.from('anime_series').select('id, user_id, title, description, thumbnail_url, banner_url, created_at').eq('id', seriesId).single();
      if (error || !data) {
        setError("Could not find the series to add an episode to.");
        navigate('/anime');
      } else {
        setSeries(data as unknown as AnimeSeries);
      }
      setLoadingSeries(false);
    };
    fetchSeries();
  }, [seriesId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in.');
      return;
    }
    if (!formData.episode_number || !formData.video_url) {
        setError('Episode number and video URL are required.');
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const episodePayload: AnimeEpisodeInsert = {
        series_id: Number(seriesId),
        episode_number: Number(formData.episode_number),
        title: formData.title || null,
        video_url: formData.video_url,
      };

      const { error: insertError } = await supabase
        .from('anime_episodes')
        .insert(episodePayload);
        
      if (insertError) throw insertError;

      alert('Episode added successfully!');
      navigate(`/anime/${seriesId}`);

    } catch (err: any) {
      if (err.message.includes('unique constraint')) {
        setError('This episode number already exists for this series.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingSeries) return <AnimeLoader />;

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto bg-white/60 dark:bg-dark-card/70 backdrop-blur-lg p-8 rounded-2xl shadow-2xl shadow-primary-blue/20">
        <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent">
              Add Episode
            </h1>
            <p className="text-lg text-secondary-purple/80 dark:text-dark-text/80">
                For {series?.title}
            </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            id="episode_number"
            label="Episode Number"
            type="number"
            value={formData.episode_number}
            onChange={handleInputChange}
            placeholder="e.g., 1"
            required
            min="1"
          />
           <Input 
            id="title"
            label="Episode Title (Optional)"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., The First Titan"
          />
           <Input 
            id="video_url"
            label="Image or Video URL"
            type="url"
            value={formData.video_url}
            onChange={handleInputChange}
            placeholder="https://youtube.com/watch?v=..."
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Loading..." : "Add Episode"}
            </Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default AddEpisodePage;