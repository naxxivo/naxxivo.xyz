import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../integrations/supabase/client';
import Button from './common/Button';
import type { Tables, TablesInsert, Json } from '../integrations/supabase/types';
import { formatXp } from '../utils/helpers';
import LoadingSpinner from './common/LoadingSpinner';
import { 
    BackArrowIcon, SettingsIcon, MusicNoteIcon, ToolsIcon, GoldCoinIcon, SilverCoinIcon, 
    DiamondIcon, WebsiteIcon, YouTubeIcon, FacebookIcon, TrophyIcon,
    InstagramIcon, TwitterIcon, TikTokIcon, DiscordIcon
} from './common/AppIcons';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import ItemPreviewModal from './profile/ItemPreviewModal';


// --- Types --- //
type UserInventoryItem = Tables<'user_inventory'> & {
    store_items: Pick<Tables<'store_items'>, 'id' | 'name' | 'preview_url' | 'description'> | null;
};
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
    active_cover?: StoreItem | null;
};
const ensureProtocol = (url: string) => {
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
        return `https://${url}`;
    }
    return url;
};

const SocialLink = ({ href, children, brandColorClass }: { href: string, children: React.ReactNode, brandColorClass: string }) => (
    <motion.a 
        href={ensureProtocol(href)} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`w-11 h-11 flex items-center justify-center bg-[var(--theme-card-bg-alt)] text-[var(--theme-text-secondary)] rounded-full transition-all duration-300 ${brandColorClass}`}
        {...{
            variants: {
                hidden: { opacity: 0, scale: 0.5 },
                visible: { opacity: 1, scale: 1 },
            }
        } as any}
    >
        {children}
    </motion.a>
);

const Profile: React.FC<ProfileProps> = ({ session, userId, onBack, onMessage, onNavigateToSettings, onNavigateToTools, onViewProfile }) => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
    const [collectionItems, setCollectionItems] = useState<UserInventoryItem[]>([]);
    const [isCollectionLoading, setIsCollectionLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<UserInventoryItem['store_items'] | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    
    const isMyProfile = userId === session.user.id;
    
    // --- Scroll & Animation Hooks --- //
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: scrollRef });
    const coverScale = useTransform(scrollY, [0, 300], [1, 1.2]);
    const coverY = useTransform(scrollY, [0, 300], [0, -50]);
    
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
    };
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
    };
    
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
                setIsCollectionLoading(true);
                const [profileRes, inventoryRes] = await Promise.all([
                    supabase.from('profiles').select('*, instagram_url, twitter_url, tiktok_url, discord_url').eq('id', userId).single(),
                    supabase.from('user_inventory').select('*, store_items(id, name, preview_url, description)').eq('user_id', userId),
                ]);

                if (profileRes.error || !profileRes.data) throw new Error(profileRes.error?.message || "Profile not found.");
                const profileBase = profileRes.data;

                const [musicRes, gifRes, coverRes] = await Promise.all([
                    profileBase.selected_music_id ? supabase.from('profile_music').select('music_url').eq('id', profileBase.selected_music_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
                    profileBase.active_gif_id ? supabase.from('profile_gifs').select('gif_url').eq('id', profileBase.active_gif_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
                    profileBase.active_cover_id ? supabase.from('store_items').select('id, asset_details, preview_url').eq('id', profileBase.active_cover_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
                ]);

                const fullProfileData: ProfileData = {
                    ...(profileBase as any),
                    selected_music: musicRes.data,
                    profile_gifs: gifRes.data,
                    active_cover: coverRes.data as StoreItem | null,
                };
                setProfile(fullProfileData);
                
                if (inventoryRes.error) throw inventoryRes.error;
                setCollectionItems((inventoryRes.data as any[]) || []);
                setIsCollectionLoading(false);
                
                if (!isMyProfile) {
                    const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).match({ follower_id: session.user.id, following_id: userId });
                    setIsFollowing((count || 0) > 0);
                }
                
            } catch (error: any) {
                setError(error.message || "An error occurred.");
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
            try {
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (error) {
                console.error("Audio play failed:", error);
            }
        }
    };

    const handleFollowToggle = async () => {
        if (isMyProfile || isUpdatingFollow) return;
        setIsUpdatingFollow(true);
        const originalFollowStatus = isFollowing;
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
        } finally { 
            setIsUpdatingFollow(false);
        }
    };
    
    if (loading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>;
    
    if (error || !profile) return (
        <div className="flex flex-col items-center justify-center p-4 h-screen text-center">
            <p className="text-red-500">{error || "Could not load profile."}</p>
            {onBack && <Button onClick={onBack} variant="secondary" className="mt-4 w-auto px-6">Back</Button>}
        </div>
    );

    const activeGifUrl = profile.profile_gifs?.gif_url;
    const profileImageUrl = isPlaying && activeGifUrl ? activeGifUrl : (profile.photo_url);
    const activeCoverUrl = profile.active_cover?.preview_url;
    const transform = (profile.active_cover?.asset_details as { transform?: { scale: number; translateX: number; translateY: number; } })?.transform;
    const baseTransform = 'translate(-50%, -50%)';
    const dynamicTransform = transform 
        ? ` translateX(${transform.translateX}px) translateY(${transform.translateY}px) scale(${transform.scale})`
        : '';
    const transformStyle = {
        transform: `${baseTransform}${dynamicTransform}`
    };

    return (
        <>
            <div ref={scrollRef} className="bg-[var(--theme-bg)] h-screen overflow-y-auto hide-scrollbar relative">
                {/* --- BACKGROUND COVER --- */}
                <motion.div style={{ y: coverY } as any} className="absolute top-0 left-0 right-0 h-52 z-0">
                    <motion.div style={{ scale: coverScale } as any} className="w-full h-full relative">
                        {profile.cover_url && <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--theme-card-bg)] to-transparent" />
                    </motion.div>
                </motion.div>
                
                {/* --- HEADER BUTTONS --- */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
                    <button onClick={onBack} className={`text-white p-2 rounded-full transition-colors bg-black/20 hover:bg-black/40 ${onBack ? 'visible' : 'invisible'}`}><BackArrowIcon /></button>
                    <div className="flex items-center gap-1">
                        {isMyProfile && <button onClick={onNavigateToTools} className="text-white p-2 rounded-full transition-colors bg-black/20 hover:bg-black/40"><ToolsIcon /></button>}
                        {isMyProfile && <button onClick={onNavigateToSettings} className="text-white p-2 rounded-full transition-colors bg-black/20 hover:bg-black/40"><SettingsIcon /></button>}
                    </div>
                </div>
                
                {/* --- MAIN CONTENT (SCROLLABLE) --- */}
                <div className="relative z-10 mt-36">
                    <motion.div
                        {...{
                            variants: containerVariants, initial: "hidden", animate: "visible"
                        } as any}
                        className="bg-[var(--theme-card-bg)] rounded-t-3xl p-6 text-center relative"
                    >
                         {/* --- AVATAR --- */}
                        <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                             <button onClick={handleAvatarClick} className="relative w-36 h-36 block group focus:outline-none rounded-full">
                               <img src={profileImageUrl || undefined} alt="avatar" className="w-36 h-36 rounded-full object-cover border-8 border-[var(--theme-card-bg)] shadow-lg" />
                               {activeCoverUrl && <img src={activeCoverUrl} alt="Profile Cover" className="absolute top-1/2 left-1/2 pointer-events-none" style={transformStyle} />}
                               {profile.selected_music && (
                                   <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md z-20">
                                       <MusicNoteIcon className="text-[var(--theme-primary)]" />
                                   </div>
                               )}
                           </button>
                        </motion.div>

                        <div className="pt-20">
                            <motion.h1
                               {...{variants:itemVariants} as any}
                               className="text-3xl font-bold text-[var(--theme-text)]"
                            >
                               {profile.name}
                            </motion.h1>
                            <motion.p {...{variants:itemVariants} as any} className="text-[var(--theme-text-secondary)] mt-1">@{profile.username}</motion.p>
                            {profile.bio && <motion.p {...{variants:itemVariants} as any} className="text-sm text-[var(--theme-text)] mt-4 max-w-md mx-auto">{profile.bio}</motion.p>}

                            <motion.div {...{variants:containerVariants} as any} className="flex justify-center flex-wrap gap-3 my-6">
                                {profile.website_url && <SocialLink href={profile.website_url} brandColorClass="hover:bg-gray-500"><WebsiteIcon className="w-6 h-6"/></SocialLink>}
                                {profile.youtube_url && <SocialLink href={profile.youtube_url} brandColorClass="hover:bg-[#FF0000]"><YouTubeIcon className="w-6 h-6"/></SocialLink>}
                                {profile.facebook_url && <SocialLink href={profile.facebook_url} brandColorClass="hover:bg-[#1877F2]"><FacebookIcon className="w-6 h-6"/></SocialLink>}
                                {profile.instagram_url && <SocialLink href={profile.instagram_url} brandColorClass="hover:bg-[#E4405F]"><InstagramIcon className="w-6 h-6"/></SocialLink>}
                                {profile.twitter_url && <SocialLink href={profile.twitter_url} brandColorClass="hover:bg-[#1DA1F2] dark:hover:bg-white dark:hover:text-black"><TwitterIcon className="w-6 h-6"/></SocialLink>}
                                {profile.tiktok_url && <SocialLink href={profile.tiktok_url} brandColorClass="hover:bg-black"><TikTokIcon className="w-6 h-6"/></SocialLink>}
                                {profile.discord_url && <SocialLink href={profile.discord_url} brandColorClass="hover:bg-[#5865F2]"><DiscordIcon className="w-6 h-6"/></SocialLink>}
                            </motion.div>
                            
                            <motion.div
                                 {...{variants:containerVariants} as any}
                                 className="grid grid-cols-4 gap-x-2 gap-y-4 items-start border-t border-b border-gray-200 dark:border-gray-700 py-5 my-6"
                            >
                                <motion.div className="text-center" {...{variants:itemVariants} as any}>
                                    <TrophyIcon className="h-7 w-7 text-violet-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-[var(--theme-text)] leading-tight">{formatXp(profile.xp_balance ?? 0)}</p>
                                    <p className="text-[10px] tracking-wide text-[var(--theme-text-secondary)] uppercase">XP</p>
                                </motion.div>
                                <motion.div className="text-center" {...{variants:itemVariants} as any}>
                                    <GoldCoinIcon className="h-7 w-7 text-yellow-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-[var(--theme-text)] leading-tight">{formatXp(profile.gold_coins ?? 0)}</p>
                                    <p className="text-[10px] tracking-wide text-[var(--theme-text-secondary)] uppercase">GOLD</p>
                                </motion.div>
                                <motion.div className="text-center" {...{variants:itemVariants} as any}>
                                    <SilverCoinIcon className="h-7 w-7 text-gray-400 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-[var(--theme-text)] leading-tight">{formatXp(profile.silver_coins ?? 0)}</p>
                                    <p className="text-[10px] tracking-wide text-[var(--theme-text-secondary)] uppercase">SILVER</p>
                                </motion.div>
                                <motion.div className="text-center" {...{variants:itemVariants} as any}>
                                    <DiamondIcon className="h-7 w-7 text-cyan-400 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-[var(--theme-text)] leading-tight">{formatXp(profile.diamond_coins ?? 0)}</p>
                                    <p className="text-[10px] tracking-wide text-[var(--theme-text-secondary)] uppercase">DIAMOND</p>
                                </motion.div>
                            </motion.div>

                            {!isMyProfile && (
                                <motion.div {...{variants:itemVariants} as any} className="px-4 flex items-center gap-3">
                                    <Button onClick={handleFollowToggle} disabled={isUpdatingFollow} variant={isFollowing ? 'secondary' : 'primary'} className="flex-1">
                                        {isUpdatingFollow ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
                                    </Button>
                                    <Button variant="secondary" className="flex-1" onClick={() => onMessage && profile && onMessage({ id: profile.id, name: profile.name || profile.username, photo_url: profile.photo_url, active_cover: profile.active_cover || null })}>
                                        Message
                                    </Button>
                                </motion.div>
                            )}

                            <motion.div {...{variants:itemVariants} as any} className="text-left mt-8">
                                <h2 className="text-xl font-bold text-[var(--theme-text)] mb-4">Collection ({collectionItems.length})</h2>
                                {isCollectionLoading ? (
                                    <div className="flex justify-center"><LoadingSpinner /></div>
                                ) : collectionItems.length > 0 ? (
                                    <motion.div {...{variants:containerVariants} as any} className="grid grid-cols-3 gap-3">
                                        {collectionItems.map((item) => item.store_items && (
                                            <motion.button
                                                key={item.id}
                                                {...{
                                                    variants: itemVariants,
                                                    whileHover: { y: -5, scale: 1.05 },
                                                    whileTap: { scale: 0.98 },
                                                } as any}
                                                onClick={() => item.store_items && setSelectedItem(item.store_items)}
                                                className="group relative aspect-square bg-[var(--theme-bg)] rounded-xl overflow-hidden flex items-center justify-center shadow-sm hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-ring)]"
                                            >
                                                <img src={item.store_items.preview_url || undefined} alt={item.store_items.name} className="object-contain max-h-full max-w-full" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <p className="text-center text-[var(--theme-text-secondary)] py-6">This traveler's satchel is empty.</p>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
            
            <ItemPreviewModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} />
        </>
    );
};

export default Profile;