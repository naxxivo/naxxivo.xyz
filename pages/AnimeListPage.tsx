
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { AnimeSeries } from '../types';
import { useAuth } from '../App';
import PageTransition from '../components/ui/PageTransition';
import { AnimeLoader } from '../components/ui/Loader';
import Button from '../components/ui/Button';
import AnimeSeriesCard from '../components/anime/AnimeSeriesCard';

const AnimeListPage: React.FC = () => {
  const { user } = useAuth();
  const [series, setSeries] = useState<AnimeSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('anime_series')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching anime series:', error);
        setError('Could not load anime series. Please try again later.');
      } else {
        setSeries((data as AnimeSeries[]) || []);
      }
      setLoading(false);
    };

    fetchSeries();
  }, []);

  return (
    <PageTransition>
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-6xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent mb-2">
          Anime Library
        </h1>
        <p className="text-lg text-secondary-purple/80 dark:text-dark-text/80">
          Browse our collection of amazing anime series.
        </p>
        {user && (
          <div className="mt-6">
            <Link to="/anime/new">
              <Button text="Create New Series" />
            </Link>
          </div>
        )}
      </div>

      {loading && <AnimeLoader />}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {series.map((s) => (
            <AnimeSeriesCard key={s.id} series={s} />
          ))}
          {series.length === 0 && <p className="text-center col-span-full">No anime series have been added yet.</p>}
        </div>
      )}
    </PageTransition>
  );
};

export default AnimeListPage;
