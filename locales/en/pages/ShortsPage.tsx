
import React, { useState, useEffect } from 'react';
import { supabase } from '@/locales/en/pages/services/supabase';
import { Post } from '@/types';
import { useAuth } from '@/App';
import { AnimeLoader } from '@/components/ui/Loader';
import ShortsPlayer from '@/components/shorts/ShortsPlayer';
import { FilmIcon } from '@heroicons/react/24/solid';

const ShortsPage: React.FC = () => {
    const { user } = useAuth();
    const [videoPosts, setVideoPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideoPosts = async () => {
            setLoading(true);
            setError(null);

            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles (
                        username,
                        name,
                        photo_url
                    ),
                    likes(count),
                    comments(count)
                `)
                .or('content_url.like.%youtube.com%,content_url.like.%youtu.be%,content_url.like.%drive.google.com%,content_url.like.%facebook.com%')
                .order('created_at', { ascending: false });

            if (postsError) {
                console.error('Error fetching video posts:', postsError);
                setError('Could not load shorts feed.');
                setLoading(false);
                return;
            }

            if (!postsData || postsData.length === 0) {
                 setVideoPosts([]);
                 setLoading(false);
                 return;
            }

            let likedPostIds = new Set<number>();
            if (user) {
                 const { data: likesData, error: likesError } = await supabase
                    .from('likes')
                    .select('post_id')
                    .eq('user_id', user.id);
                if (likesError) console.error("Could not fetch user likes for shorts", likesError);
                else if (likesData) likedPostIds = new Set((likesData as unknown as {post_id: number}[]).map(l => l.post_id));
            }

            const processedPosts: Post[] = (postsData as any[]).map(p => ({
                ...p,
                is_liked: likedPostIds.has(p.id)
            }));
            
            setVideoPosts(processedPosts);
            setLoading(false);
        };

        fetchVideoPosts();
    }, [user]);

    return (
        <div className="h-screen w-screen fixed top-0 left-0 bg-black snap-y snap-mandatory overflow-y-scroll z-[100]">
            {loading && (
                <div className="h-full w-full flex items-center justify-center">
                    <AnimeLoader />
                </div>
            )}
            {error && <p className="text-white text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{error}</p>}

            {!loading && !error && videoPosts.length === 0 && (
                 <div className="h-full w-full flex flex-col items-center justify-center text-white text-center">
                    <FilmIcon className="w-24 h-24 text-gray-600 mb-4" />
                    <h2 className="text-2xl font-bold">No Shorts Yet</h2>
                    <p className="text-gray-400">Post a video to see it here!</p>
                </div>
            )}

            {!loading && !error && videoPosts.map(post => (
                <div key={post.id} className="h-screen w-screen snap-start relative">
                    <ShortsPlayer post={post} />
                </div>
            ))}
        </div>
    );
};

export default ShortsPage;
