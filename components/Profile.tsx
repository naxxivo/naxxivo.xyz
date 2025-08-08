import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../integrations/supabase/client';
import Button from './common/Button';
import type { Tables, TablesInsert, Enums, TablesUpdate, Json } from '../integrations/supabase/types';
import { generateAvatar, formatXp } from '../utils/helpers';
import LoadingSpinner from './common/LoadingSpinner';
import FollowListModal from './common/FollowListModal';
import { BackArrowIcon, SettingsIcon, MusicNoteIcon, ToolsIcon, CoinIcon, AdminIcon, WebsiteIcon, YouTubeIcon, FacebookIcon } from './common/AppIcons';
import { motion } from 'framer-motion';
import PostCard, { PostWithDetails } from './home/PostCard';
import CommentModal from './home/CommentModal';

// --- Types --- //
type StoreItem = Pick<Tables<'store_items'>, 'id' | 'asset_details' | 'preview_url'>;

// --- Profile Component --- //
interface ProfileProps {
    session: Session;
    userId: string;
    onBack?: () => void;
    onMessage?: (user: { id: string; name: string; photo_url: string | null; active_cover: { preview_url: string | null; asset_details: Json; } | null; }) => void;
    onNavigateToSettings: () => void;
    onNavigateToTools: () => void;
    onViewProfile: (userId: string) => void;
}

type ProfileData = Tables<'profiles'> & {
    selected_music: { music_url: string } | null;
    profile_gifs: { gif_url: string } | null;
    active_badge?: StoreItem | null;
    active_fx?: StoreItem | null;
    active_cover?: StoreItem | null;
};

type ProfileStub = {
    id: string;
    name: string | null;
    username: string;
    photo_url: string | null;
    active_cover: { preview_url: string | null, asset_details: Json } | null;
};

const ensureProtocol = (url: string) => {
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
        return `https://${url}`;
    }
    return url;
};

const Profile: React.FC<ProfileProps> = ({ session, userId, onBack, onMessage, onNavigateToSettings, onNavigateToTools, onViewProfile }) => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [posts, setPosts] = useState<PostWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
    const [modalState, setModalState] = useState<{ type: 'followers' | 'following' | null; users: ProfileStub[]; loading: boolean; title: string }>({ type: null, users: [], loading: false, title: '' });
    const [commentModalPost, setCommentModalPost] = useState<PostWithDetails | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const isMyProfile = userId === session.user.id;

    const handleCommentAdded = useCallback((postId: number) => {
        setPosts((currentPosts: PostWithDetails[]) => 
            currentPosts.map(p => {
                if (p.id === postId) {
                    const newCommentCount = (p.comments[0]?.count ?? 0) + 1;
                    return { ...p, comments: [{ count: newCommentCount }] };
                }
                return p;
            })
        );
    }, []);
    

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            setLoading(true);
            setError(null);
            setIsPlaying(false);
            if(audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            try {
                // Step 1: Fetch base profile data
                const { data: profileBase, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (profileError || !profileBase) throw new Error(profileError?.message || "Profile not found.");

                // Step 2: Fetch other related items in parallel
                const [
                    musicRes,
                    gifRes,
                    badgeRes,
                    fxRes,
                    coverRes
                ] = await Promise.all([
                    profileBase.selected_music_id ? supabase.from('profile_music').select('music_url').eq('id', profileBase.selected_music_id).single() : Promise.resolve({ data: null, error: null }),
                    profileBase.active_gif_id ? supabase.from('profile_gifs').select('gif_url').eq('id', profileBase.active_gif_id).single() : Promise.resolve({ data: null, error: null }),
                    profileBase.active_badge_id ? supabase.from('store_items').select('id, asset_details, preview_url').eq('id', profileBase.active_badge_id).single() : Promise.resolve({ data: null, error: null }),
                    profileBase.active_fx_id ? supabase.from('store_items').select('id, asset_details, preview_url').eq('id', profileBase.active_fx_id).single() : Promise.resolve({ data: null, error: null }),
                    profileBase.active_cover_id ? supabase.from('store_items').select('id, asset_details, preview_url').eq('id', profileBase.active_cover_id).single() : Promise.resolve({ data: null, error: null }),
                ]);

                // Step 3: Combine all data
                const fullProfileData: ProfileData = {
                    ...(profileBase as any),
                    selected_music: musicRes.data,
                    profile_gifs: gifRes.data,
                    active_badge: badgeRes.data as StoreItem | null,
                    active_fx: fxRes.data as StoreItem | null,
                    active_cover: coverRes.data as StoreItem | null,
                };

                setProfile(fullProfileData);

                // Step 4: Fetch counts and posts
                const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId);
                const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
                setFollowerCount(followers || 0);
                setFollowingCount(following || 0);

                if (!isMyProfile) {
                    const { count: isFollowingCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).match({ follower_id: session.user.id, following_id: userId });
                    setIsFollowing((isFollowingCount || 0) > 0);
                }
                
                const { data: postData, error: postError } = await supabase
                    .from('posts')
                    .select(`
                        id, created_at, caption, content_url, user_id, status,
                        profiles (username, name, photo_url, active_cover:active_cover_id(preview_url, asset_details)),
                        likes (user_id),
                        comments (count)
                    `)
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if(postError) throw postError;
                setPosts((postData as any) || []);

            } catch (error: any) {
                let errorMessage = error.message || "An error occurred.";
                if (error.message && error.message.includes('column "selected_music_id" does not exist')) {
                    errorMessage = "Database schema is out of date and is missing a column. Profile music may not work correctly. Please run the required SQL update.";
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        
        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        }
    }, [userId, session.user.id, isMyProfile]);

    const handleAvatarClick = async () => {
        const musicUrl = profile?.selected_music?.music_url;
        if (!musicUrl) return;
    
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            if (!audioRef.current || audioRef.current.src !== musicUrl) {
                if(audioRef.current) audioRef.current.pause();
                audioRef.current = new Audio(musicUrl);
                audioRef.current.crossOrigin = "anonymous";
                audioRef.current.addEventListener('ended', () => setIsPlaying(false));
            }
            await audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleFollowToggle = async () => {
        if (isMyProfile || isUpdatingFollow) return;
        setIsUpdatingFollow(true);
        const originalFollowStatus = isFollowing;
        setFollowerCount(c => originalFollowStatus ? c - 1 : c + 1);
        setIsFollowing(!originalFollowStatus);

        try {
            if (originalFollowStatus) {
                await supabase.from('follows').delete().match({ follower_id: session.user.id, following_id: userId });
            } else {
                const newFollow: TablesInsert<'follows'> = { follower_id: session.user.id, following_id: userId };
                await supabase.from('follows').insert(newFollow as any);
            }
        } catch (error: any) { 
            console.error("Failed to update follow status:", error.message);
            setIsFollowing(originalFollowStatus);
            setFollowerCount(c => originalFollowStatus ? c + 1 : c - 1);
        } finally { 
            setIsUpdatingFollow(false);
        }
    };
    
    const handleOpenFollowModal = async (type: 'followers' | 'following') => {
        setModalState({ type, users: [], loading: true, title: type === 'followers' ? 'Followers' : 'Following' });
        try {
            let userIds: string[] = [];
            if (type === 'followers') {
                const { data, error } = await supabase.from('follows').select('follower_id').eq('following_id', userId);
                if (error) throw error;
                if (data) userIds = data.map(d => d.follower_id);
            } else {
                const { data, error } = await supabase.from('follows').select('following_id').eq('follower_id', userId);
                if (error) throw error;
                if (data) userIds = data.map(d => d.following_id);
            }

            if (userIds.length > 0) {
                const { data: profiles, error } = await supabase.from('profiles').select('id, name, username, photo_url, active_cover:active_cover_id(preview_url, asset_details)').in('id', userIds);
                if (error) throw error;
                setModalState(s => ({...s, users: (profiles as any) || [], loading: false }));
            } else {
                setModalState(s => ({...s, users: [], loading: false }));
            }
        } catch (err: any) {
            console.error(`Failed to load ${type}:`, err);
            setModalState({ type: null, users: [], loading: false, title: '' });
        }
    };

    if (loading) return <div className="flex items-center justify-center pt-20"><LoadingSpinner /></div>;
    
    if (error || !profile) return (
        <div className="flex flex-col items-center justify-center p-4 pt-20 text-center">
            <p className="text-red-500">{error || "Could not load profile."}</p>
            {onBack && <Button onClick={onBack} variant="secondary" className="mt-4 w-auto px-6">Back</Button>}
        </div>
    );

    const activeGifUrl = profile.profile_gifs?.gif_url;
    const profileImageUrl = isPlaying && activeGifUrl ? activeGifUrl : (profile.photo_url || generateAvatar(profile.name || profile.username));
    
    const activeFxUrl = profile.active_fx?.preview_url;
    const activeCoverUrl = profile.active_cover?.preview_url;
    const activeBadgeUrl = profile.active_badge?.preview_url;

    const transform = (profile.active_cover?.asset_details as { transform?: { scale: number; translateX: number; translateY: number; } })?.transform;
    const baseTransform = 'translate(-50%, -50%)';
    const dynamicTransform = transform 
        ? ` translateX(${transform.translateX}px) translateY(${transform.translateY}px) scale(${transform.scale})`
        : '';
    const transformStyle = {
        transform: `${baseTransform}${dynamicTransform}`
    };

    const statItem = (value: string | number, label: string) => (
        <div>
            <p className="text-xl font-bold text-[var(--theme-text)]">{value}</p>
            <p className="text-xs tracking-wide text-[var(--theme-text-secondary)] uppercase">{label}</p>
        </div>
    );

    return (
        <div className="bg-[var(--theme-bg)] min-h-screen">
            <motion.div {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 } } as any}>
                {/* --- HEADER --- */}
                <div className="relative h-48">
                     <div className="absolute inset-0">
                        <svg viewBox="0 0 375 190" preserveAspectRatio="none" className="w-full h-full">
                            {profile.cover_url ? (
                                <defs>
                                    <pattern id="cover-pattern" patternUnits="userSpaceOnUse" width="100%" height="100%">
                                        <image href={profile.cover_url} x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                                    </pattern>
                                </defs>
                            ) : null}
                            <path d="M0 0 H375 V130 C250 190, 125 190, 0 130 Z" fill={profile.cover_url ? 'url(#cover-pattern)' : 'var(--theme-primary)'} />
                            <path d="M0 0 H375 V130 C250 190, 125 190, 0 130 Z" fill="black" fillOpacity="0.25" />
                        </svg>
                    </div>
                     <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                        <button onClick={onBack} className={`text-white p-2 rounded-full transition-colors hover:bg-black/20 ${onBack ? 'visible' : 'invisible'}`}><BackArrowIcon /></button>
                        <div className="flex items-center gap-1">
                            {isMyProfile && <button onClick={onNavigateToTools} className="text-white p-2 rounded-full transition-colors hover:bg-black/20"><ToolsIcon /></button>}
                            {isMyProfile && <button onClick={onNavigateToSettings} className="text-white p-2 rounded-full transition-colors hover:bg-black/20"><SettingsIcon /></button>}
                        </div>
                     </div>
                </div>

                {/* --- CONTENT --- */}
                <div className="relative -mt-20 z-0">
                    <div className="relative bg-[var(--theme-card-bg)] rounded-t-3xl pt-20 p-6 text-center">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                             <button onClick={handleAvatarClick} className="relative w-32 h-32 block group focus:outline-none rounded-full focus:ring-4 focus:ring-offset-2 focus:ring-offset-[var(--theme-card-bg)] focus:ring-[var(--theme-ring)]">
                                {activeFxUrl && !activeCoverUrl && <img src={activeFxUrl} alt="Profile Effect" className="absolute inset-[-16px] w-44 h-44 pointer-events-none" />}
                                <img src={profileImageUrl} alt="avatar" className="relative w-32 h-32 rounded-full object-cover border-4 border-[var(--theme-card-bg)] shadow-lg" />
                                {activeCoverUrl && <img src={activeCoverUrl} alt="Profile Cover" className="absolute top-1/2 left-1/2 pointer-events-none" style={transformStyle} />}
                                {profile.selected_music && (
                                    <div className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md z-20">
                                        <MusicNoteIcon className="text-[var(--theme-primary)]" />
                                    </div>
                                )}
                            </button>
                        </div>
                        
                        <h1 className="text-2xl font-bold text-[var(--theme-text)] flex items-center justify-center gap-2">
                           {profile.name}
                           {activeBadgeUrl && <img src={activeBadgeUrl} alt="Badge" title="Equipped Badge" className="w-6 h-6" />}
                        </h1>
                        <p className="text-[var(--theme-text-secondary)]">@{profile.username}</p>
                        {profile.bio && <p className="text-sm text-[var(--theme-text)] mt-3 max-w-md mx-auto">{profile.bio}</p>}

                        <div className="flex justify-center gap-4 my-6">
                            {profile.website_url && (
                                <a href={ensureProtocol(profile.website_url)} target="_blank" rel="noopener noreferrer" className="w-11 h-11 flex items-center justify-center bg-[var(--theme-card-bg-alt)] hover:bg-opacity-70 text-[var(--theme-text)] rounded-full transition-all"><WebsiteIcon/></a>
                            )}
                             {profile.youtube_url && (
                                <a href={ensureProtocol(profile.youtube_url)} target="_blank" rel="noopener noreferrer" className="w-11 h-11 flex items-center justify-center bg-[var(--theme-card-bg-alt)] hover:bg-opacity-70 text-[var(--theme-text)] rounded-full transition-all"><YouTubeIcon/></a>
                            )}
                             {profile.facebook_url && (
                                <a href={ensureProtocol(profile.facebook_url)} target="_blank" rel="noopener noreferrer" className="w-11 h-11 flex items-center justify-center bg-[var(--theme-card-bg-alt)] hover:bg-opacity-70 text-[var(--theme-text)] rounded-full transition-all"><FacebookIcon className="w-6 h-6"/></a>
                            )}
                        </div>
                        
                        <div className="flex justify-around items-center border-t border-b border-gray-200 dark:border-gray-700 py-4 my-6">
                            {statItem(posts.length, 'Post')}
                            <button onClick={() => handleOpenFollowModal('followers')}>{statItem(followerCount, 'Followers')}</button>
                            <button onClick={() => handleOpenFollowModal('following')}>{statItem(followingCount, 'Following')}</button>
                        </div>

                        {!isMyProfile && (
                            <div className="px-4 flex items-center gap-3">
                                <Button
                                    onClick={handleFollowToggle}
                                    disabled={isUpdatingFollow}
                                    variant={isFollowing ? 'secondary' : 'primary'}
                                    className="flex-1"
                                >
                                    {isUpdatingFollow ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => onMessage && profile && onMessage({
                                        id: profile.id,
                                        name: profile.name || profile.username,
                                        photo_url: profile.photo_url,
                                        active_cover: profile.active_cover || null
                                    })}
                                >
                                    Message
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                 {posts.length > 0 ? (
                    <div className="p-4 space-y-6 bg-[var(--theme-card-bg)]">
                        {posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                session={session}
                                onViewProfile={onViewProfile}
                                onOpenComments={() => setCommentModalPost(post)}
                                hideFollowButton={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4 bg-[var(--theme-card-bg)]">
                        <h2 className="text-xl font-semibold text-[var(--theme-text)]">No stories yet</h2>
                        <p className="text-[var(--theme-text-secondary)] mt-2">{isMyProfile ? "Share your first memory!" : "This user hasn't shared any posts."}</p>
                    </div>
                )}
                
                <FollowListModal
                    isOpen={!!modalState.type}
                    onClose={() => setModalState({ type: null, users: [], loading: false, title: ''})}
                    title={modalState.title}
                    users={modalState.users}
                    loading={modalState.loading}
                    onViewProfile={(id) => {
                        setModalState({ type: null, users: [], loading: false, title: ''});
                        onViewProfile(id);
                    }}
                />

                {commentModalPost && (
                    <CommentModal
                        postId={commentModalPost.id}
                        postOwnerId={commentModalPost.user_id}
                        session={session}
                        onClose={() => setCommentModalPost(null)}
                        onCommentAdded={handleCommentAdded}
                    />
                )}
            </motion.div>
        </div>
    );
};

export default Profile;