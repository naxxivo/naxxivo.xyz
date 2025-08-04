import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner';

interface HomePageProps {
    session: Session;
    onViewProfile: (userId: string) => void;
    refreshKey: number; // Add refreshKey prop
}

export type PostWithDetails = {
    id: number;
    created_at: string;
    caption: string | null;
    content_url: string | null;
    user_id: string;
    profiles: {
        username: string | null;
        name: string | null;
        photo_url: string | null;
    } | null;
    likes: Array<{ user_id: string }>;
    comments: Array<{ count: number }>;
};


const HomePage: React.FC<HomePageProps> = ({ session, onViewProfile, refreshKey }) => {
    const [posts, setPosts] = useState<PostWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select(`
                        *,
                        profiles (
                            username,
                            name,
                            photo_url
                        ),
                        likes ( user_id ),
                        comments ( count )
                    `)
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }
                
                if (data) {
                    setPosts(data as unknown as PostWithDetails[]);
                }

            } catch (error: any) {
                setError(error.message || "Failed to fetch posts.");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [session, refreshKey]); // Re-fetch on refreshKey change

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
                <p>Error loading feed: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Home Feed</h1>
            {posts.length > 0 ? (
                posts.map(post => <PostCard key={post.id} post={post} session={session} onViewProfile={onViewProfile} />)
            ) : (
                <div className="text-center py-16 px-4 bg-[#1C1B33] rounded-2xl">
                    <h2 className="text-xl font-semibold text-white">The feed is empty!</h2>
                    <p className="text-gray-400 mt-2">Be the first to share something with the community.</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;
