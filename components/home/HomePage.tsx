import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner';
import Logo from '../common/Logo';
import { SearchIcon } from '../common/AppIcons';
import CommentModal from './CommentModal';
import QuickPostInput from './QuickPostInput';
import type { Tables } from '../../integrations/supabase/types';
import { generateAvatar } from '../../utils/helpers';

interface HomePageProps {
    session: Session;
    onViewProfile: (userId: string) => void;
    refreshKey: number;
    onOpenSearch: () => void;
}

export type PostWithDetails = {
    id: number;
    created_at: string;
    caption: string | null;
    content_url: string | null;
    user_id: string;
    status: Tables<'posts'>['status'];
    profiles: {
        username: string | null;
        name: string | null;
        photo_url: string | null;
    } | null;
    likes: Array<{ user_id: string }>;
    comments: Array<{ count: number }>;
};

const SuggestedUsers: React.FC<{ onViewProfile: (userId: string) => void }> = ({ onViewProfile }) => {
    const [users, setUsers] = useState<Pick<Tables<'profiles'>, 'id' | 'name' | 'photo_url' | 'username'>[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, photo_url, username')
                .order('xp_balance', { ascending: false })
                .limit(10);
            if (data) setUsers(data);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    if (loading) return null;

    return (
        <div className="mb-4">
            <h2 className="font-bold text-[var(--theme-text)] mb-2">Top Travelers</h2>
            <div className="flex space-x-4 overflow-x-auto pb-3 -mx-4 px-4 hide-scrollbar">
                {users.map(user => (
                    <button key={user.id} onClick={() => onViewProfile(user.id)} className="flex flex-col items-center space-y-1 text-center flex-shrink-0 w-20">
                        <div className="w-16 h-16 rounded-full p-0.5 flex items-center justify-center bg-gradient-to-tr from-[var(--theme-primary)] to-[var(--theme-secondary)]">
                            <img src={user.photo_url || generateAvatar(user.username)} alt={user.name || ''} className="w-full h-full object-cover rounded-full p-0.5 bg-[var(--theme-card-bg)]" />
                        </div>
                        <p className="text-xs text-[var(--theme-text-secondary)] truncate w-full">{user.name || user.username}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};


const HomePage: React.FC<HomePageProps> = ({ session, onViewProfile, refreshKey, onOpenSearch }) => {
    const [posts, setPosts] = useState<PostWithDetails[]>([]);
    const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commentModalPostId, setCommentModalPostId] = useState<number | null>(null);
    const myId = session.user.id;

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [postsPromise, followsPromise] = await Promise.all([
                 supabase
                    .from('posts')
                    .select(`
                        id,
                        created_at,
                        caption,
                        content_url,
                        user_id,
                        status,
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
            
            const { data, error: postsError } = postsPromise;
            if (postsError) throw postsError;
            if (data) setPosts(data as any);

            const { data: followsData, error: followsError } = followsPromise;
            if (followsError) throw followsError;
            if (followsData) {
                setFollowingSet(new Set(followsData.map(f => f.following_id)));
            }


        } catch (error: any) {
            setError(error.message || "Failed to fetch posts.");
        } finally {
            setLoading(false);
        }
    }, [myId]);

    useEffect(() => {
        fetchPosts();
    }, [session, refreshKey, myId, fetchPosts]);
    
    const handleCommentAdded = useCallback((postId: number) => {
        setPosts(currentPosts => 
            currentPosts.map(p => {
                if (p.id === postId) {
                    const newCommentCount = (p.comments[0]?.count ?? 0) + 1;
                    return { ...p, comments: [{ count: newCommentCount }] };
                }
                return p;
            })
        );
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
            <div className="text-center pt-20 text-red-500" role="alert">
                <p>Error loading feed: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <header className="flex justify-between items-center">
                <div className="text-3xl">
                  <Logo/>
                </div>
                <button onClick={onOpenSearch} className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)]">
                    <SearchIcon />
                </button>
            </header>

            <SuggestedUsers onViewProfile={onViewProfile} />

             <QuickPostInput session={session} onPostCreated={fetchPosts} />
            
            <div className="space-y-6 pt-4">
                {posts.length > 0 ? (
                    posts.map(post => 
                        <PostCard
                            key={post.id}
                            post={post}
                            session={session}
                            onViewProfile={onViewProfile}
                            onOpenComments={() => setCommentModalPostId(post.id)}
                            isInitiallyFollowing={followingSet.has(post.user_id)}
                        />)
                ) : (
                    <div className="text-center py-16 px-4 bg-[var(--theme-card-bg-alt)] rounded-2xl">
                        <h2 className="text-xl font-semibold text-[var(--theme-text)]">The feed is empty!</h2>
                        <p className="text-[var(--theme-text-secondary)] mt-2">Be the first to share something with the community.</p>
                    </div>
                )}
            </div>
             {commentModalPostId && (
                <CommentModal
                    postId={commentModalPostId}
                    session={session}
                    onClose={() => setCommentModalPostId(null)}
                    onCommentAdded={handleCommentAdded}
                />
            )}
        </div>
    );
};

export default HomePage;