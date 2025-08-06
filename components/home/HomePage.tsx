import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner';
import Logo from '../common/Logo';
import { SearchIcon } from '../common/AppIcons';
import CommentModal from './CommentModal';
import QuickPostInput from './QuickPostInput';

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
    profiles: {
        username: string | null;
        name: string | null;
        photo_url: string | null;
    } | null;
    likes: Array<{ user_id: string }>;
    comments: Array<{ count: number }>;
};

const Stories: React.FC<{onViewProfile: (id: string) => void}> = ({onViewProfile}) => {
    // Dummy data for stories
    const stories = [
        { id: 'add', name: 'Add Story' },
        { id: '1', name: 'Mo Chun', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
        { id: '2', name: 'Bansilal', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
        { id: '3', name: 'Yahiro', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
        { id: '4', name: 'Miriam', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a' },
        { id: '5', name: 'Ashish', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b' },
    ];

    return (
        <div className="mb-4">
            <div className="flex space-x-4 overflow-x-auto pb-3 -mx-4 px-4 hide-scrollbar">
                {stories.map(story => (
                    <button key={story.id} onClick={() => story.id !== 'add' && onViewProfile(story.id)} className="flex flex-col items-center space-y-1 text-center flex-shrink-0 w-20">
                        <div className={`w-16 h-16 rounded-full p-0.5 flex items-center justify-center ${story.id === 'add' ? 'bg-gray-200' : 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600'}`}>
                            <div className="w-full h-full bg-white rounded-full p-0.5">
                                {story.id === 'add' ? (
                                    <div className="w-full h-full rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-2xl">+</div>
                                ) : (
                                    <img src={story.avatar} alt={story.name} className="w-full h-full object-cover rounded-full" />
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-700 truncate w-full">{story.name}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}


const HomePage: React.FC<HomePageProps> = ({ session, onViewProfile, refreshKey, onOpenSearch }) => {
    const [posts, setPosts] = useState<PostWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commentModalPostId, setCommentModalPostId] = useState<number | null>(null);
    const myId = session.user.id;

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: postData, error: postsError } = await supabase
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
                .order('created_at', { ascending: false });
            
            if (postsError) throw postsError;
            if (postData) setPosts(postData as PostWithDetails[]);

        } catch (error: any) {
            setError(error.message || "Failed to fetch posts.");
        } finally {
            setLoading(false);
        }
    }, []);

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
                <button onClick={onOpenSearch} className="text-gray-600 hover:text-gray-900">
                    <SearchIcon />
                </button>
            </header>

            <Stories onViewProfile={onViewProfile} />

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
                        />)
                ) : (
                    <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl">
                        <h2 className="text-xl font-semibold text-gray-800">The feed is empty!</h2>
                        <p className="text-gray-500 mt-2">Be the first to share something with the community.</p>
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