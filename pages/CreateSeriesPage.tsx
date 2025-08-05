
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../services/supabase';
import Button from '../components/ui/Button';
import PageTransition from '../components/ui/PageTransition';
import Input from '../components/ui/Input';
import { AnimeSeries } from '../types';

const CreateSeriesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    banner_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a series.');
      return;
    }
    if (!formData.title) {
        setError('A title is required.');
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('anime_series')
        .insert([{ ...formData, user_id: user.id }] as any)
        .select()
        .single();
        
      if (insertError) throw insertError;

      alert('Series created successfully!');
      if(data) navigate(`/anime/${(data as AnimeSeries).id}`);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto bg-white/60 dark:bg-dark-card/70 backdrop-blur-lg p-8 rounded-2xl shadow-2xl shadow-primary-blue/20">
        <h1 className="font-display text-4xl font-bold text-center from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent mb-8">
          Create a New Anime Series
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            id="title"
            label="Series Title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Attack on Titan"
            required
          />
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner"
              placeholder="A brief summary of the series..."
            />
          </div>
          <Input 
            id="thumbnail_url"
            label="Thumbnail URL"
            type="url"
            value={formData.thumbnail_url}
            onChange={handleInputChange}
            placeholder="https://... (Portrait aspect ratio recommended)"
          />
          <Input 
            id="banner_url"
            label="Banner URL"
            type="url"
            value={formData.banner_url}
            onChange={handleInputChange}
            placeholder="https://... (Landscape aspect ratio recommended)"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="pt-4">
            <Button type="submit" text={loading ? "Creating..." : "Create Series"} disabled={loading} className="w-full" />
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default CreateSeriesPage;
