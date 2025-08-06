

import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import Button from './common/Button';
import type { Tables, TablesInsert, Enums } from '../integrations/supabase/types';
import { generateAvatar, formatXp } from '../utils/helpers';
import LoadingSpinner from './common/LoadingSpinner';
import FollowListModal from './common/FollowListModal';
import { BackArrowIcon, SettingsIcon, SendPlaneIcon, MusicNoteIcon, ToolsIcon, CoinIcon, AdminIcon } from './common/AppIcons';
import { motion } from 'framer-motion';

// --- Profile Component --- //
interface ProfileProps {
    session: Session;
    userId: string;
    onBack?: () => void;
    onMessage?: (user: { id:string; name: string; photo_url: string | null }) => void;
    onNavigateToSettings: () => void;
    onNavigateToTools: () => void;
    onNavigateToAdminPanel?: () => void;
    onViewProfile: (userId: string) => void;
}

type ProfileData = {
    id: string;
    cover_url: string | null;
    xp_balance: number;
    role: Enums<'user_role'>;
    photo_url: string | null;
    name: string | null;
    username: string;
    bio: string | null;
} & {
    profile_music: { music_url: string }[] | null;
};
interface PostData {
    id: number;
    content_url: string | null;
}
type ProfileStub = {
    id: string;
    name: string | null;
    username: string;
    photo_url: string | null;
};

const Profile: React.FC<ProfileProps> = ({ session, userId, onBack, onMessage, onNavigateToSettings, onNavigateToTools, onNavigateToAdminPanel, onViewProfile }) => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
    const [modalState, setModalState] = useState<{ type: 'followers' | 'following' | null; users: ProfileStub[]; loading: boolean; title: string }>({ type: null, users: [], loading: false, title: '' });

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Refs for Audio Visualizer
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);


    const isMyProfile = userId === session.user.id;
    
    const getDancingAnimation = (delay: number) => ({
        y: ["0%", "-10%", "0%"],
        transition: {
            delay,
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'mirror' as const,
            ease: "easeInOut" as const,
        }
    });

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
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select(`
                        id, cover_url, xp_balance, role, photo_url, name, username, bio,
                        profile_music ( music_url )
                    `)
                    .eq('id', userId)
                    .single();
                
                if (profileError || !profileData) throw new Error(profileError?.message || "Profile not found.");
                
                setProfile(profileData as ProfileData);

                const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId);
                const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
                setFollowerCount(followers || 0);
                setFollowingCount(following || 0);

                if (!isMyProfile) {
                    const { count: isFollowingCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).match({ follower_id: session.user.id, following_id: userId });
                    setIsFollowing((isFollowingCount || 0) > 0);
                }
                
                const { data: postData, error: postError } = await supabase.from('posts').select('id, content_url').eq('user_id', userId).order('created_at', { ascending: false });
                if(postError) throw postError;
                if (postData) setPosts(postData as PostData[]);

            } catch (error: any) {
                setError(error.message || "An error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        
        // Cleanup audio on component unmount
        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
            audioContextRef.current?.close();
        }
    }, [userId, session.user.id, isMyProfile]);

    useEffect(() => {
        if (isPlaying && analyserRef.current && canvasRef.current) {
            const analyser = analyserRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            let hue = 0; // For color animation

            const draw = () => {
                animationFrameIdRef.current = requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = 60; // Inner radius, leaving space for avatar
                const bars = 128; // How many bars to draw

                for (let i = 0; i < bars; i++) {
                    // Scale bar height, with a minimum value to show something on silence
                    const barHeight = (dataArray[i] / 2.5) + 1; 
                    const angle = (i / bars) * 2 * Math.PI;

                    const startX = centerX + radius * Math.cos(angle);
                    const startY = centerY + radius * Math.sin(angle);
                    const endX = centerX + (radius + barHeight) * Math.cos(angle);
                    const endY = centerY + (radius + barHeight) * Math.sin(angle);

                    ctx.beginPath();
                    // Create a rainbow effect by cycling through hues
                    ctx.strokeStyle = `hsl(${(hue + i * 2.5) % 360}, 100%, 50%)`;
                    ctx.lineWidth = 2.5;
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
                
                hue += 0.5; // Slowly shift the colors
            };

            draw();

        } else {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [isPlaying]);
    
    const handleAvatarClick = async () => {
        const musicUrl = profile?.profile_music?.[0]?.music_url;
        if (!musicUrl) return;
    
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }
    
        try {
            if (!audioRef.current) {
                audioRef.current = new Audio(musicUrl);
                audioRef.current.crossOrigin = "anonymous"; // Needed for AudioContext
                audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    
                if (!audioContextRef.current) {
                    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                    audioContextRef.current = new AudioContext();
                }
    
                const context = audioContextRef.current;
                
                if (!sourceRef.current || sourceRef.current.mediaElement !== audioRef.current) {
                    sourceRef.current = context.createMediaElementSource(audioRef.current);
                    analyserRef.current = context.createAnalyser();
                    analyserRef.current.fftSize = 256;
                    
                    sourceRef.current.connect(analyserRef.current);
                    analyserRef.current.connect(context.destination);
                }
            }
    
            if (audioContextRef.current?.state === 'suspended') {
                await audioContextRef.current.resume();
            }
    
            await audioRef.current.play();
            setIsPlaying(true);
        } catch (error) {
            console.error("Audio playback failed:", error);
            setIsPlaying(false);
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
                await supabase.from('follows').insert([{ follower_id: session.user.id, following_id: userId }] as any);
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
                const { data: profiles, error } = await supabase.from('profiles').select('id, name, username, photo_url').in('id', userIds);
                if (error) throw error;
                setModalState(s => ({...s, users: (profiles as ProfileStub[]) || [], loading: false }));
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
    
    return (
        <div className="flex flex-col w-full bg-gray-50">
             <header className="relative h-48 w-full">
                {profile.cover_url ? (
                    <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover"/>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-300 to-purple-400"></div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
                 <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
                    <button onClick={onBack} className={`text-white hover:bg-black/20 rounded-full p-2 transition-colors ${onBack ? 'visible' : 'invisible'}`}><BackArrowIcon /></button>
                    <div className="flex items-center gap-2 bg-black/20 text-white px-3 py-1.5 rounded-full">
                        <CoinIcon className="w-5 h-5 text-yellow-300"/>
                        <span className="font-bold text-sm">{formatXp(profile.xp_balance)} XP</span>
                    </div>
                    <div className="flex items-center">
                        {isMyProfile && profile.role === 'admin' && (
                            <button onClick={onNavigateToAdminPanel} className="text-white hover:bg-black/20 rounded-full p-2 transition-colors">
                                <AdminIcon />
                            </button>
                        )}
                        {isMyProfile && (
                            <button onClick={onNavigateToTools} className="text-white hover:bg-black/20 rounded-full p-2 transition-colors">
                                <ToolsIcon />
                            </button>
                        )}
                        <button onClick={isMyProfile ? onNavigateToSettings : () => {}} className={`text-white hover:bg-black/20 rounded-full p-2 transition-colors ${isMyProfile ? '' : 'invisible'}`}>
                            {isMyProfile && <SettingsIcon />}
                        </button>
                    </div>
                </div>
             </header>


            <div className="p-4 transform -translate-y-12">
                <div className="flex items-end">
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <canvas
                            ref={canvasRef}
                            width="220"
                            height="220"
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                        />
                        <button onClick={handleAvatarClick} className="relative w-full h-full focus:outline-none rounded-full focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-violet-400">
                            <img src={profile.photo_url || generateAvatar(profile.name || profile.username)} alt={profile.name || 'avatar'} className="relative z-10 w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                            {isMyProfile && profile.profile_music && profile.profile_music.length > 0 && (
                                <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md z-20">
                                    <MusicNoteIcon className="text-violet-500" />
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="flex-grow flex justify-around text-center pb-2">
                        <motion.div animate={isPlaying ? getDancingAnimation(0) : { y: 0 }}>
                            <p className="font-bold text-lg">{posts.length}</p><p className="text-sm text-gray-500">Stories</p>
                        </motion.div>
                        <motion.button animate={isPlaying ? getDancingAnimation(0.15) : { y: 0 }} onClick={() => handleOpenFollowModal('followers')}>
                            <p className="font-bold text-lg">{followerCount}</p><p className="text-sm text-gray-500">Followers</p>
                        </motion.button>
                        <motion.button animate={isPlaying ? getDancingAnimation(0.3) : { y: 0 }} onClick={() => handleOpenFollowModal('following')}>
                            <p className="font-bold text-lg">{followingCount}</p><p className="text-sm text-gray-500">Following</p>
                        </motion.button>
                    </div>
                </div>
                <div className="mt-4">
                    <h2 className="font-bold text-xl">{profile.name}</h2>
                    <p className="text-sm text-gray-500 -mt-1">@{profile.username}</p>
                    {profile.bio && <p className="text-sm mt-3">{profile.bio}</p>}
                </div>
                
                 <div className="flex items-center space-x-2 mt-4">
                    {!isMyProfile && (
                        <>
                            <motion.div className="flex-1" animate={isPlaying ? getDancingAnimation(0.4) : { y: 0 }}>
                                <Button onClick={handleFollowToggle} size="small" disabled={isUpdatingFollow} variant={isFollowing ? 'secondary' : 'primary'}>{isUpdatingFollow ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}</Button>
                            </motion.div>
                            <motion.div className="flex-1" animate={isPlaying ? getDancingAnimation(0.5) : { y: 0 }}>
                                <Button onClick={() => onMessage && onMessage({ id: profile.id, name: profile.name || 'Unknown', photo_url: profile.photo_url })} size="small" variant="secondary">Message</Button>
                            </motion.div>
                            <motion.button className="p-2.5 bg-violet-500 text-white rounded-full" animate={isPlaying ? getDancingAnimation(0.6) : { y: 0 }}>
                                <SendPlaneIcon />
                            </motion.button>
                        </>
                    )}
                </div>
            </div>

            {posts.length > 0 ? (
                <div className="w-full mt-[-48px] bg-white">
                    <div className="grid grid-cols-3 gap-0.5">
                        {posts.map(post => (
                            <div key={post.id} className="aspect-square bg-gray-200">
                               {post.content_url && <img src={post.content_url} alt="User post" className="w-full h-full object-cover" loading="lazy" />}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                 <div className="text-center py-16 px-4 bg-white rounded-2xl mt-[-32px]">
                    <h2 className="text-xl font-semibold text-gray-800">No stories yet</h2>
                    <p className="text-gray-500 mt-2">This user hasn't shared any posts.</p>
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
        </div>
    );
};

export default Profile;