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
    const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
    const myId = session.user.id;

    useEffect(() => {
        const fetchPostsAndFollows = async () => {
            setLoading(true);
            setError(null);

            try {
                const [postsPromise, followsPromise] = await Promise.all([
                    supabase
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
                        .order('created_at', { ascending: false }),
                     supabase.from('follows').select('following_id').eq('follower_id', myId)
                ]);


                const { data: postData, error: postsError } = postsPromise;
                if (postsError) throw postsError;
                if (postData) setPosts(postData as PostWithDetails[]);

                const { data: followsData, error: followsError } = followsPromise;
                if (followsError) throw followsError;
                if (followsData) {
                    const followingIds = new Set((followsData as { following_id: string }[]).map(f => f.following_id));
                    setFollowingSet(followingIds);
                }

            } catch (error: any) {
                setError(error.message || "Failed to fetch posts.");
            } finally {
                setLoading(false);
            }
        };

        fetchPostsAndFollows();
    }, [session, refreshKey, myId]);

    const handleFollowChange = (targetUserId: string, isFollowing: boolean) => {
        setFollowingSet(prev => {
            const newSet = new Set(prev);
            if (isFollowing) {
                newSet.add(targetUserId);
            } else {
                newSet.delete(targetUserId);
            }
            return newSet;
        });
    };

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
                posts.map(post => 
                    <PostCard
                        key={post.id}
                        post={post}
                        session={session}
                        onViewProfile={onViewProfile}
                        isInitiallyFollowing={followingSet.has(post.user_id)}
                        onFollowChange={handleFollowChange}
                    />)
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