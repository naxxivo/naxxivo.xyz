
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/App';
import { supabase } from '@/locales/en/pages/services/supabase';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/ui/PageTransition';
import Input from '@/components/ui/Input';
import { PostRow } from '@/types';
import VideoPlayer from '@/components/anime/VideoPlayer';

const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contentUrl, setContentUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isImage = contentUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(contentUrl);
  const isVideo = contentUrl && /youtube\.com|youtu\.be|drive\.google\.com|facebook\.com/i.test(contentUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentUrl || !user) {
      setError('Please provide a URL for your content.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const postToInsert: Partial<PostRow> = {
        user_id: user.id,
        content_url: contentUrl,
      };

      if (caption.trim()) {
        postToInsert.caption = caption.trim();
      }
      
      const { error: insertError } = await supabase.from('posts').insert([postToInsert]);

      if (insertError) throw insertError;

      alert('Post created successfully!');
      navigate('/');

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
        <h1 className="font-display text-4xl font-bold text-center from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent mb-8 transition-all duration-300">
          Share Something New
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            id="contentUrl"
            label="Image or Video URL"
            type="url"
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            placeholder="https://your-image-url.com/... or https://youtube.com/..."
            required
          />
          {contentUrl && (
            <div className="flex justify-center p-2 border-2 border-primary-blue/20 border-dashed rounded-md min-h-[100px] items-center">
              {isImage && <img src={contentUrl} alt="Content preview" className="max-h-64 rounded-lg object-contain" onError={(e) => e.currentTarget.style.display = 'none'}/>}
              {isVideo && !isImage && (
                  <div className="w-full max-w-md">
                    <VideoPlayer url={contentUrl} className="w-full aspect-video bg-black rounded-lg"/>
                  </div>
              )}
              {!isImage && !isVideo && <p className="text-sm text-secondary-purple/70 dark:text-dark-text/70 p-4 text-center">Preview not available for this URL type. Only image and supported video links (YouTube, Facebook, G-Drive) will be displayed.</p>}
            </div>
          )}
          
          <div>
            <label htmlFor="caption" className="block text-sm font-medium">
              Caption
            </label>
            <textarea
              id="caption"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner"
              placeholder="Say something amazing..."
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="pt-4">
            <Button type="submit" disabled={loading || !contentUrl} className="w-full">
                {loading ? "Posting..." : "Post It!"}
            </Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default UploadPage;