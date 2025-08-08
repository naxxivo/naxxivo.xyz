import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../integrations/supabase/client';
import Profile from '../Profile';
import HomePage from '../home/HomePage';
import CreatePost from '../home/CreatePost';
import MessagesPage from '../messages/MessagesPage';
import ChatPage from '../messages/ChatPage';
import SettingsPage from '../settings/SettingsPage';
import EditProfilePage from '../settings/EditProfilePage';
import UsersPage from '../users/UsersPage';
import MusicLibraryPage from '../music/MusicLibraryPage';
import SearchOverlay from '../search/SearchOverlay';
import ToolsPage from '../tools/ToolsPage';
import AnimePage from '../anime/AnimePage';
import SeriesDetailPage from '../anime/SeriesDetailPage';
import CreateSeriesPage from '../anime/CreateSeriesPage';
import CreateEpisodePage from '../anime/CreateEpisodePage';
import TopUpPage from '../xp/TopUpPage';
import SubscriptionClaimPage from '../xp/SubscriptionClaimPage';
import ManualPaymentPage from '../xp/ManualPaymentPage';
import StorePage from '../store/StorePage';
import CollectionPage from '../store/CollectionPage';
import InfoPage from '../info/InfoPage';
import EarnXpPage from '../xp/EarnXpPage';
import PasswordModal from '../common/PasswordModal';
import UploadCoverPage from '../store/UploadCoverPage';
import NotificationsPage from '../notifications/NotificationsPage';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationPopup, { type NotificationDetails } from '../common/NotificationPopup';
import type { Json, Tables } from '../integrations/supabase/types';
import SideNav from './layout/SideNav';
import TopBar from './layout/TopBar';

export type AuthView =
    'home' | 'discover' | 'profile' | 'settings' | 'messages' | 'edit-profile' | 'music-library' |
    'tools' | 'anime' | 'anime-series' | 'create-series' | 'create-episode' |
    'top-up' | 'subscriptions' | 'manual-payment' |
    'store' | 'collection' | 'info' | 'earn-xp' | 'upload-cover' | 'notifications';
    
type UserProfileForTopBar = Pick<Tables<'profiles'>, 'photo_url' | 'name' | 'username' | 'xp_balance'> & {
    active_cover: { preview_url: string | null; asset_details: Json } | null;
};

interface UserAppProps {
    session: Session;
    onEnterAdminView: () => void;
}

const UserApp: React.FC<UserAppProps> = ({ session, onEnterAdminView }) => {
    const [authView, setAuthView] = useState<AuthView>('home');
    const [isCreatePostOpen, setCreatePostOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
    const [viewingSeriesId, setViewingSeriesId] = useState<number | null>(null);
    const [paymentProductId, setPaymentProductId] = useState<number | null>(null);
    const [chattingWith, setChattingWith] = useState<{ id: string; name: string; photo_url: string | null; active_cover: { preview_url: string | null; asset_details: Json } | null } | null>(null);
    const [refreshFeedKey, setRefreshFeedKey] = useState(0);
    const [refreshAnimeKey, setRefreshAnimeKey] = useState(0);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    const [notification, setNotification] = useState<NotificationDetails | null>(null);
    const [showPermissionBanner, setShowPermissionBanner] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfileForTopBar | null>(null);
    
    useEffect(() => {
        // Fetch user profile for top bar
        const fetchUserProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('photo_url, name, username, xp_balance, active_cover:active_cover_id(preview_url, asset_details)')
                .eq('id', session.user.id)
                .single();
            if (data) setUserProfile(data as any);
        };
        fetchUserProfile();

        // Set up a listener for profile changes (like XP balance)
        const profileChannel = supabase.channel('public:profiles:id=eq.' + session.user.id)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: 'id=eq.' + session.user.id },
                payload => {
                    setUserProfile(prev => prev ? ({ ...prev, ...(payload.new as any) }) : (payload.new as any));
                }
            )
            .subscribe();

        // Fetch initial unread count
        const fetchUnreadCount = async () => {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id)
                .eq('is_read', false);
            if(error) console.error(error);
            setUnreadNotificationCount(count || 0);
        };
        fetchUnreadCount();

        // Listen for new notifications in real-time
        const notificationsChannel = supabase
            .channel('public:notifications:user_id=eq.'+session.user.id)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'notifications',
                filter: `user_id=eq.${session.user.id}`
            }, (payload) => {
                setUnreadNotificationCount(current => current + 1);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(profileChannel);
            supabase.removeChannel(notificationsChannel);
        };
    }, [session.user.id]);
    
    const showNotification = (details: NotificationDetails) => {
        setNotification(details);
    };
    
    const showBrowserNotification = (title: string, body: string) => {
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
        }
    };
    
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            setShowPermissionBanner(true);
        }
    }, []);

    const handleRequestPermission = () => {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification({ type: 'success', title: 'Notifications Enabled!', message: 'You will now receive updates from NAXXIVO.'});
            } else {
                 showNotification({ type: 'info', title: 'Notifications Blocked', message: 'You can enable them in your browser settings later.'});
            }
            setShowPermissionBanner(false);
        });
    };
    
    const handleLogout = async () => {
        await (supabase.auth as any).signOut();
    };

    const handlePostCreated = () => {
        setCreatePostOpen(false);
        setRefreshFeedKey(prevKey => prevKey + 1);
        if (authView !== 'home') {
           setAuthView('home');
        }
    };
    
    const handleSetAuthView = (view: 'home' | 'discover' | 'profile' | 'messages' | 'tools') => {
        if (view !== 'profile') {
            setViewingProfileId(null);
        } else if (!viewingProfileId) {
            setViewingProfileId(session.user.id);
        }
        setChattingWith(null);
        setViewingSeriesId(null);
        setAuthView(view);
    };
    
    const handleBack = () => {
        // This is a simple back logic, not a full history stack
        if (authView.startsWith('anime-') || authView.startsWith('create-')) setAuthView('anime');
        else if (['top-up', 'subscriptions', 'manual-payment', 'store', 'collection', 'info', 'earn-xp', 'upload-cover', 'music-library', 'anime'].includes(authView)) setAuthView('tools');
        else if (['settings', 'edit-profile'].includes(authView)) setAuthView('profile');
        else if (viewingProfileId && viewingProfileId !== session.user.id) { setViewingProfileId(null); setAuthView('discover'); }
        else if (chattingWith) setChattingWith(null);
        else setAuthView('home'); // Default back
    };
    
    const handleNavigateToSettings = () => setAuthView('settings');
    const handleNavigateToMusicLibrary = () => setAuthView('music-library');
    const handleNavigateToEditProfile = () => setAuthView('edit-profile');
    const handleNavigateToTools = () => setAuthView('tools');
    const handleNavigateToAnime = () => setAuthView('anime');
    const handleNavigateToCreateSeries = () => setAuthView('create-series');
    const handleNavigateToCreateEpisode = () => setAuthView('create-episode');
    const handleNavigateToTopUp = () => setAuthView('top-up');
    const handleNavigateToSubscriptions = () => setAuthView('subscriptions');
    const handleNavigateToManualPayment = (productId: number) => { setPaymentProductId(productId); setAuthView('manual-payment'); };
    const handleNavigateToStore = () => setAuthView('store');
    const handleNavigateToCollection = () => setAuthView('collection');
    const handleNavigateToInfo = () => setAuthView('info');
    const handleNavigateToEarnXp = () => setAuthView('earn-xp');
    const handleNavigateToUploadCover = () => setAuthView('upload-cover');
    const handleNavigateToNotifications = () => setAuthView('notifications');

    const handleViewProfile = (userId: string) => {
        setIsSearchOpen(false);
        setAuthView('profile');
        setViewingProfileId(userId);
    };

    const handleViewSeries = (seriesId: number) => {
        setViewingSeriesId(seriesId);
        setAuthView('anime-series');
    };

    const profileName = userProfile?.name || userProfile?.username;

    const viewTitles: Record<string, string> = {
        home: 'Lobby',
        discover: 'Leaderboard',
        messages: 'Messenger',
        profile: viewingProfileId === session.user.id ? (profileName || 'My Profile') : 'Profile',
        tools: 'Arsenal',
        settings: 'Settings',
        'edit-profile': 'Edit Profile',
        'music-library': 'Music & Animations',
        anime: 'Anime Hub',
        'anime-series': 'Series Details',
        'create-series': 'Create Series',
        'create-episode': 'Add Episode',
        'top-up': 'Top Up XP',
        subscriptions: 'Subscriptions',
        'manual-payment': 'Manual Payment',
        store: 'The Bazaar',
        collection: 'My Satchel',
        info: 'The Guidebook',
        'earn-xp': 'Earn XP',
        'upload-cover': 'Upload Cover',
        notifications: 'Notifications',
    };
    
    let pageContent;
    if (chattingWith) {
         pageContent = (
            <ChatPage session={session} otherUser={chattingWith} onBack={() => setChattingWith(null)}/>
        );
    } else {
        pageContent = {
            home: <HomePage session={session} onViewProfile={handleViewProfile} refreshKey={refreshFeedKey} onOpenSearch={() => setIsSearchOpen(true)} onOpenNotifications={handleNavigateToNotifications} unreadNotificationCount={unreadNotificationCount} />,
            discover: <UsersPage session={session} onViewProfile={handleViewProfile} />,
            messages: <MessagesPage session={session} onStartChat={setChattingWith} />,
            profile: <Profile 
                        session={session} 
                        userId={viewingProfileId || session.user.id} 
                        onBack={viewingProfileId && viewingProfileId !== session.user.id ? handleBack : undefined}
                        onMessage={(user) => setChattingWith(user)}
                        onNavigateToSettings={handleNavigateToSettings}
                        onNavigateToTools={handleNavigateToTools}
                        onViewProfile={handleViewProfile}
                     />,
            settings: <SettingsPage 
                        session={session}
                        onBack={() => setAuthView('profile')} 
                        onNavigateToEditProfile={handleNavigateToEditProfile}
                        onNavigateToMusicLibrary={handleNavigateToMusicLibrary}
                        onLogout={handleLogout}
                        onNavigateToAdminPanel={() => setIsPasswordModalOpen(true)}
                      />,
            'edit-profile': <EditProfilePage 
                                session={session} 
                                onBack={() => setAuthView('settings')} 
                                onProfileUpdated={() => {
                                    setAuthView('profile');
                                    setViewingProfileId(session.user.id);
                                }}
                            />,
            'music-library': <MusicLibraryPage
                                session={session}
                                onBack={() => setAuthView('tools')}
                                showNotification={showNotification}
                            />,
            tools: <ToolsPage 
                        onBack={() => setAuthView('profile')} 
                        onNavigateToAnime={handleNavigateToAnime} 
                        onNavigateToTopUp={handleNavigateToTopUp} 
                        onNavigateToMusicLibrary={handleNavigateToMusicLibrary} 
                        onNavigateToStore={handleNavigateToStore} 
                        onNavigateToCollection={handleNavigateToCollection} 
                        onNavigateToInfo={handleNavigateToInfo} 
                        onNavigateToEarnXp={handleNavigateToEarnXp}
                   />,
            anime: <AnimePage 
                        key={refreshAnimeKey}
                        onBack={() => setAuthView('tools')}
                        onViewSeries={handleViewSeries}
                        onCreateSeries={handleNavigateToCreateSeries}
                        onCreateEpisode={handleNavigateToCreateEpisode}
                    />,
            'anime-series': <SeriesDetailPage 
                                seriesId={viewingSeriesId!} 
                                onBack={() => setAuthView('anime')} 
                            />,
            'create-series': <CreateSeriesPage onBack={() => setAuthView('anime')} onSeriesCreated={() => { setAuthView('anime'); setRefreshAnimeKey(k => k + 1); }} />,
            'create-episode': <CreateEpisodePage onBack={() => setAuthView('anime')} onEpisodeCreated={() => setAuthView('anime')} />,
            'top-up': <TopUpPage onBack={() => setAuthView('tools')} onPurchase={handleNavigateToManualPayment} onManageSubscriptions={handleNavigateToSubscriptions} showBrowserNotification={showBrowserNotification} />,
            'subscriptions': <SubscriptionClaimPage onBack={() => setAuthView('top-up')} session={session} showNotification={showNotification} showBrowserNotification={showBrowserNotification} />,
            'manual-payment': <ManualPaymentPage onBack={() => setAuthView('top-up')} session={session} productId={paymentProductId!} onSubmit={() => setAuthView('top-up')} showNotification={showNotification} />,
            store: <StorePage onBack={() => setAuthView('tools')} session={session} onNavigateToUploadCover={handleNavigateToUploadCover} showNotification={showNotification} />,
            collection: <CollectionPage onBack={() => setAuthView('tools')} session={session} showNotification={showNotification} />,
            info: <InfoPage onBack={() => setAuthView('tools')} />,
            'earn-xp': <EarnXpPage onBack={() => setAuthView('tools')} session={session} />,
            'upload-cover': <UploadCoverPage onBack={() => setAuthView('store')} session={session} />,
            'notifications': <NotificationsPage session={session} onBack={() => setAuthView('home')} onMarkAllRead={() => setUnreadNotificationCount(0)} />,
        }[authView];
    }
    
    const mainViews = ['home', 'discover', 'messages', 'profile', 'tools'];
    const showBackButton = !mainViews.includes(authView) || (authView === 'profile' && !!viewingProfileId && viewingProfileId !== session.user.id);


    return (
        <div className="w-screen h-screen flex bg-[var(--theme-bg)] text-[var(--theme-text)]">
            <SideNav activeView={authView} setAuthView={handleSetAuthView as any} />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar 
                    title={viewTitles[authView] || 'NAXXIVO'}
                    showBackButton={showBackButton}
                    onBack={handleBack}
                    userProfile={userProfile}
                    unreadNotificationCount={unreadNotificationCount}
                    onOpenNotifications={handleNavigateToNotifications}
                />
                <main className="flex-1 overflow-y-auto relative p-4 lg:p-6">
                    {pageContent}
                </main>
            </div>
            
            <CreatePost
                isOpen={isCreatePostOpen}
                onClose={() => setCreatePostOpen(false)}
                onPostCreated={handlePostCreated}
            />
            <AnimatePresence>
                {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} onViewProfile={handleViewProfile} />}
            </AnimatePresence>
            <PasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSuccess={() => {
                    setIsPasswordModalOpen(false);
                    onEnterAdminView();
                }}
                session={session}
            />
            <NotificationPopup notification={notification} onClose={() => setNotification(null)} />
        </div>
    );
}

export default UserApp;