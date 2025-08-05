import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import Button from './common/Button';
import type { Tables, TablesInsert, TablesUpdate } from '../integrations/supabase/types';
import { formatXp, generateAvatar } from '@/utils/helpers';
import LoadingSpinner from './common/LoadingSpinner';
import FollowListModal from './common/FollowListModal';

// --- SVG Icons --- //
const WebsiteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;
const YouTubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const MusicIcon = ({isPlaying}: {isPlaying: boolean}) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d={isPlaying ? "M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm6 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" : "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.986a1 1 0 001.555.832l3.197-1.993a1 1 0 000-1.664l-3.197-1.993z"} /></svg>;


// --- Profile Component --- //
interface ProfileProps {
    session: Session;
    userId?: string;
    onBack?: () => void;
    onMessage?: (user: { id:string; name: string; photo_url: string | null }) => void;
    onLogout?: () => void;
    onNavigateToSettings?: () => void;
    onNavigateToMessages?: () => void;
    onViewProfile: (userId: string) => void;
}

type ProfileData = Tables<'profiles'>;
type PostData = Pick<Tables<'posts'>, 'id' | 'content_url'>;
type PremiumFeatures = Tables<'premium_features'>;
type ProfileStub = Pick<Tables<'profiles'>, 'id' | 'name' | 'username' | 'photo_url'>;

const DEFAULT_COVER_SVG = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400' width='800' height='400'%3e%3crect fill='%231C1B33' width='800' height='400'/%3e%3cg fill-opacity='0.2'%3e%3ccircle fill='%233B82F6' cx='400' cy='200' r='200'/%3e%3ccircle fill='%232563EB' cx='0' cy='400' r='100'/%3e%3ccircle fill='%2360A5FA' cx='800' cy='0' r='150'/%3e%3c/g%3e%3c/svg%3e")`;

const Profile: React.FC<ProfileProps> = ({ session, userId, onBack, onMessage, onLogout, onNavigateToSettings, onNavigateToMessages, onViewProfile }) => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [posts, setPosts] = useState<PostData[]>([]);
    const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeatures | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
    const [isPlayingMusic, setIsPlayingMusic] = useState(false);
    const [modalState, setModalState] = useState<{ type: 'followers' | 'following' | null; users: ProfileStub[]; loading: boolean; title: string }>({ type: null, users: [], loading: false, title: '' });
    const audioRef = useRef<HTMLAudioElement>(null);

    const profileIdToFetch = userId || session.user.id;
    const isMyProfile = profileIdToFetch === session.user.id;

    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileIdToFetch) return;
            setLoading(true);
            setError(null);

            try {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, created_at, name, username, photo_url, cover_url, bio, website_url, youtube_url, facebook_url, xp_balance, role, admin, address')
                    .eq('id', profileIdToFetch)
                    .single();
                
                if (profileError || !profileData) {
                    setError(profileError?.message || "Profile not found.");
                    setLoading(false);
                    return;
                }
                
                setProfile(profileData as ProfileData);

                const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileIdToFetch);
                const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileIdToFetch);
                setFollowerCount(followers || 0);
                setFollowingCount(following || 0);

                if (!isMyProfile) {
                    const { count: isFollowingCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).match({ follower_id: session.user.id, following_id: profileIdToFetch });
                    setIsFollowing((isFollowingCount || 0) > 0);
                }
                
                const { data: postData } = await supabase.from('posts').select('id, content_url').eq('user_id', profileIdToFetch).order('created_at', { ascending: false });
                if (postData) setPosts(postData as PostData[]);

                if ((profileData as ProfileData).xp_balance >= 10000) {
                    const { data: premiumData, error: premiumError } = await supabase
                        .from('premium_features')
                        .select('id, profile_id, music_url, created_at')
                        .eq('profile_id', profileIdToFetch)
                        .single();
                    if(premiumError && premiumError.code !== 'PGRST116') { // Ignore "no rows" error
                        console.warn("Could not fetch premium features, but continuing.", premiumError);
                    }
                    if (premiumData) setPremiumFeatures(premiumData as PremiumFeatures);
                }
            } catch (error: any) {
                setError(error.message || "An error occurred while fetching profile details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [profileIdToFetch, session.user.id, isMyProfile]);

    const handleFollowToggle = async () => {
        if (isMyProfile) return;
        setIsUpdatingFollow(true);
        try {
            if (isFollowing) {
                await supabase.from('follows').delete().match({ follower_id: session.user.id, following_id: profileIdToFetch });
                setFollowerCount(c => c - 1);
                setIsFollowing(false);
            } else {
                await supabase.from('follows').insert([{ follower_id: session.user.id, following_id: profileIdToFetch }] as any);
                setFollowerCount(c => c + 1);
                setIsFollowing(true);
            }
        } catch (error: any) { console.error("Failed to update follow status:", error.message); } 
        finally { setIsUpdatingFollow(false); }
    };

    const handleOpenFollowModal = async (type: 'followers' | 'following') => {
        setModalState({ type, users: [], loading: true, title: type === 'followers' ? 'Followers' : 'Following' });
        try {
            let userIds: string[] = [];
            if (type === 'followers') {
                const { data, error } = await supabase.from('follows').select('follower_id').eq('following_id', profileIdToFetch);
                if (error) throw error;
                if (data) userIds = (data as { follower_id: string }[]).map(d => d.follower_id);
            } else {
                const { data, error } = await supabase.from('follows').select('following_id').eq('follower_id', profileIdToFetch);
                if (error) throw error;
                if (data) userIds = (data as { following_id: string }[]).map(d => d.following_id);
            }
            if (userIds.length > 0) {
                const { data: profiles, error } = await supabase.from('profiles').select('id, name, username, photo_url').in('id', userIds);
                if (error) throw error;
                setModalState(s => ({...s, users: (profiles as ProfileStub[]) || [], loading: false }));
            } else {
                setModalState(s => ({...s, loading: false }));
            }
        } catch (err: any) {
            console.error('Failed to fetch follow list', err);
            setModalState({ type: null, users: [], loading: false, title: '' });
        }
    };
    
    const handleMusicToggle = () => {
        if (!audioRef.current) return;
        if (isPlayingMusic) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
        }
    };


    if (loading) return <div className="flex items-center justify-center pt-20"><LoadingSpinner /></div>;
    
    if (error || !profile) return (
        <div className="flex flex-col items-center justify-center p-4 pt-20">
            {onBack && <button onClick={onBack} className="self-start mb-4 text-gray-400 hover:text-white transition-colors flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>Back</button>}
            <div className="w-full max-w-md space-y-6 bg-[#1C1B33] py-8 px-8 shadow-2xl rounded-2xl text-center">
                <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
                <p className="text-red-400" role="alert">{error || "Could not load profile."}</p>
            </div>
        </div>
    );

    const isPremium = profile.xp_balance >= 10000;
    const musicUrl = premiumFeatures?.music_url;
    
    return (
        <div className="flex flex-col items-center w-full">
             {onBack && !isMyProfile && <button onClick={onBack} className="self-start mb-4 text-gray-400 hover:text-white transition-colors flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>Back</button>}
            <div className="w-full bg-[#1C1B33] rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-28 bg-cover bg-center" style={{ backgroundImage: profile.cover_url ? `url(${profile.cover_url})` : DEFAULT_COVER_SVG }}></div>

                <div className="p-4 relative">
                    <div className="flex justify-between items-end">
                        <div className="relative flex-shrink-0 -mt-12">
                           <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#1C1B33] bg-gray-700">
                               <img src={profile.photo_url || generateAvatar(profile.name || profile.username)} alt={profile.name || profile.username} className="w-full h-full object-cover" />
                           </div>
                           {isPlayingMusic && (
                               <div className="absolute inset-0 rounded-full pointer-events-none">
                                   {[...Array(24)].map((_, i) => (
                                       <div key={i} className="absolute left-1/2 top-0 h-1/2 w-1 bg-blue-500 visualizer-bar" style={{ transform: `rotate(${i * 15}deg)`, animationDelay: `${Math.random() * 0.5}s` }}></div>
                                   ))}
                               </div>
                           )}
                        </div>
                        <div className="flex items-center space-x-2">
                            {isMyProfile ? (
                                <>
                                    {onNavigateToMessages && <div className="w-28"><Button onClick={onNavigateToMessages} size="small" variant="secondary">Messages</Button></div>}
                                    {onNavigateToSettings && <div className="w-28"><Button onClick={onNavigateToSettings} size="small" variant="secondary">Edit Profile</Button></div>}
                                </>
                            ) : (
                                <>
                                     <div className="w-28"><Button onClick={handleFollowToggle} size="small" disabled={isUpdatingFollow} variant={isFollowing ? 'secondary' : 'primary'}>{isUpdatingFollow ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}</Button></div>
                                    {onMessage && <div className="w-28"><Button onClick={() => onMessage({ id: profile.id, name: profile.name || 'Unknown', photo_url: profile.photo_url || generateAvatar(profile.name || profile.username) })} size="small" variant="secondary">Message</Button></div>}
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-3">
                        <div className="flex items-center gap-2">
                             <h1 className="text-xl font-bold text-white">{profile.name || 'No Name'}</h1>
                             {isPremium && musicUrl && (
                                <>
                                    <button onClick={handleMusicToggle} className="text-gray-400 hover:text-blue-400 transition-colors"><MusicIcon isPlaying={isPlayingMusic} /></button>
                                    <audio ref={audioRef} src={musicUrl} loop onPlay={() => setIsPlayingMusic(true)} onPause={() => setIsPlayingMusic(false)} />
                                </>
                             )}
                        </div>
                         <p className="text-xs text-gray-400">@{profile.username}</p>
                    </div>

                    {profile.bio && <p className="mt-3 text-sm text-gray-300 whitespace-pre-wrap">{profile.bio}</p>}

                    <div className="mt-4 flex items-center space-x-6">
                        <button onClick={() => handleOpenFollowModal('followers')} className="text-left hover:opacity-80 transition-opacity">
                            <span className="font-bold text-white">{followerCount}</span>
                            <span className="ml-1 text-gray-400 text-sm">Followers</span>
                        </button>
                        <button onClick={() => handleOpenFollowModal('following')} className="text-left hover:opacity-80 transition-opacity">
                            <span className="font-bold text-white">{followingCount}</span>
                            <span className="ml-1 text-gray-400 text-sm">Following</span>
                        </button>
                        <div><span className="text-yellow-400 font-bold">{formatXp(profile.xp_balance)}</span><span className="ml-1 text-gray-400 text-sm">XP</span></div>
                    </div>
                    
                    <hr className="my-4 border-white/10" />

                    {(profile.website_url || profile.youtube_url || profile.facebook_url) && (
                        <div>
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Links</h2>
                            <div className="flex items-center space-x-4">
                                {profile.website_url && <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors"><WebsiteIcon /></a>}
                                {profile.youtube_url && <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors"><YouTubeIcon /></a>}
                                {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors"><FacebookIcon /></a>}
                            </div>
                        </div>
                    )}
                </div>

                {isMyProfile && onLogout && <div className="p-4 border-t border-white/10"><Button onClick={onLogout} variant="secondary">Sign Out</Button></div>}
            </div>
            
            {posts.length > 0 && (
                <div className="w-full mt-6">
                    <h2 className="text-xl font-bold text-white mb-4">Posts</h2>
                    <div className="grid grid-cols-3 gap-1">
                        {posts.map(post => (
                            <div key={post.id} className="aspect-square bg-[#1C1B33]">
                               {post.content_url && <img src={post.content_url} alt="User post" className="w-full h-full object-cover" loading="lazy" />}
                            </div>
                        ))}
                    </div>
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