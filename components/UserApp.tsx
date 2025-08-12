import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../integrations/supabase/client';
import Profile from './Profile';
import BottomNav from './layout/BottomNav';
import MessagesPage from './messages/MessagesPage';
import ChatPage from './messages/ChatPage';
import SettingsPage from './settings/SettingsPage';
import EditProfilePage from './settings/EditProfilePage';
import UsersPage from './users/UsersPage';
import MusicLibraryPage from './music/MusicLibraryPage';
import SearchOverlay from './search/SearchOverlay';
import ToolsPage from './tools/ToolsPage';
import AnimePage from './anime/AnimePage';
import SeriesDetailPage from './anime/SeriesDetailPage';
import CreateSeriesPage from './anime/CreateSeriesPage';
import CreateEpisodePage from './anime/CreateEpisodePage';
import TopUpPage from './xp/TopUpPage';
import SubscriptionClaimPage from './xp/SubscriptionClaimPage';
import ManualPaymentPage from './xp/ManualPaymentPage';
import StorePage from './store/StorePage';
import CollectionPage from './store/CollectionPage';
import SellPage from './store/SellPage';
import InfoPage from './info/InfoPage';
import EarnXpPage from './xp/EarnXpPage';
import PasswordModal from './common/PasswordModal';
import UploadCoverPage from './store/UploadCoverPage';
import NotificationsPage from './notifications/NotificationsPage';
import EventsPage from './events/EventsPage';
import LuckRoyalePage from './events/LuckRoyalePage';
import ReversiPage from './game/ReversiPage';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationPopup, { type NotificationDetails } from './common/NotificationPopup';
import Button from './common/Button';
import type { Json } from '../integrations/supabase/types';
import PasswordSecurityPage from './settings/PasswordSecurityPage';
import PrivacyPage from './settings/PrivacyPage';

export type AuthView =
    'discover' | 'profile' | 'settings' | 'messages' | 'edit-profile' | 'music-library' |
    'tools' | 'anime' | 'anime-series' | 'create-series' | 'create-episode' |
    'top-up' | 'subscriptions' | 'manual-payment' |
    'store' | 'collection' | 'info' | 'earn-xp' | 'upload-cover' | 'notifications' | 'events' | 'luck-royale' | 'sell-page' |
    'password-security' | 'privacy' | 'reversi';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
};

const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
};

interface UserAppProps {
    session: Session;
    onEnterAdminView: () => void;
}

const UserApp: React.FC<UserAppProps> = ({ session, onEnterAdminView }) => {
    const [authView, setAuthView] = useState<AuthView>('discover');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
    const [viewingSeriesId, setViewingSeriesId] = useState<number | null>(null);
    const [paymentProductId, setPaymentProductId] = useState<number | null>(null);
    const [chattingWith, setChattingWith] = useState<{ id: string; name: string; photo_url: string | null; active_cover: { preview_url: string | null; asset_details: Json } | null } | null>(null);
    const [refreshAnimeKey, setRefreshAnimeKey] = useState(0);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    const [notification, setNotification] = useState<NotificationDetails | null>(null);
    const [showPermissionBanner, setShowPermissionBanner] = useState(false);
    
    const isLuckRoyale = authView === 'luck-royale';
    
    useEffect(() => {
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
        const channel = supabase
            .channel('public:notifications')
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
            supabase.removeChannel(channel);
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

    const handleSetAuthView = (view: 'discover' | 'profile' | 'messages') => {
        setViewingProfileId(null);
        setChattingWith(null);
        setViewingSeriesId(null);
        setAuthView(view);
    };
    
    const handleNavigateToSettings = () => {
        setViewingProfileId(null);
        setAuthView('settings');
    }

    const handleNavigateToMusicLibrary = () => setAuthView('music-library');
    const handleNavigateToEditProfile = () => setAuthView('edit-profile');
    const handleNavigateToTools = () => setAuthView('tools');
    const handleNavigateToAnime = () => setAuthView('anime');
    const handleNavigateToCreateSeries = () => setAuthView('create-series');
    const handleNavigateToCreateEpisode = () => setAuthView('create-episode');
    const handleNavigateToTopUp = () => setAuthView('top-up');
    const handleNavigateToSubscriptions = () => setAuthView('subscriptions');
    const handleNavigateToManualPayment = (productId: number) => {
        setPaymentProductId(productId);
        setAuthView('manual-payment');
    }
    const handleNavigateToStore = () => setAuthView('store');
    const handleNavigateToCollection = () => setAuthView('collection');
    const handleNavigateToSellPage = () => setAuthView('sell-page');
    const handleNavigateToInfo = () => setAuthView('info');
    const handleNavigateToEarnXp = () => setAuthView('earn-xp');
    const handleNavigateToUploadCover = () => setAuthView('upload-cover');
    const handleNavigateToNotifications = () => setAuthView('notifications');
    const handleNavigateToEvents = () => setAuthView('events');
    const handleNavigateToLuckRoyale = () => setAuthView('luck-royale');
    const handleNavigateToReversi = () => setAuthView('reversi');
    const handleNavigateToPasswordSecurity = () => setAuthView('password-security');
    const handleNavigateToPrivacy = () => setAuthView('privacy');

    const handleViewProfile = (userId: string) => {
        setIsSearchOpen(false);
        setAuthView('profile');
        setViewingProfileId(userId);
    };

    const handleViewSeries = (seriesId: number) => {
        setViewingSeriesId(seriesId);
        setAuthView('anime-series');
    };

    let pageContent;
    if (chattingWith) {
         pageContent = (
            <ChatPage session={session} otherUser={chattingWith} onBack={() => setChattingWith(null)}/>
        );
    } else {
        const CurrentPage = {
            discover: <UsersPage session={session} onViewProfile={handleViewProfile} />,
            messages: <MessagesPage session={session} onStartChat={setChattingWith} />,
            profile: <Profile 
                        session={session} 
                        userId={viewingProfileId || session.user.id} 
                        onBack={viewingProfileId ? () => { setViewingProfileId(null); setAuthView('discover');} : undefined}
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
                        onNavigateToSubscriptions={handleNavigateToSubscriptions}
                        onNavigateToNotifications={handleNavigateToNotifications}
                        onNavigateToInfo={handleNavigateToInfo}
                        onNavigateToPasswordSecurity={handleNavigateToPasswordSecurity}
                        onNavigateToPrivacy={handleNavigateToPrivacy}
                      />,
            'edit-profile': <EditProfilePage 
                                session={session} 
                                onBack={() => setAuthView('settings')} 
                                onProfileUpdated={() => {
                                    setAuthView('profile');
                                    setViewingProfileId(null); 
                                    setTimeout(() => setViewingProfileId(session.user.id), 0);
                                }}
                            />,
            'music-library': <MusicLibraryPage
                                session={session}
                                onBack={() => setAuthView('profile')}
                                showNotification={showNotification}
                            />,
            tools: <ToolsPage 
                        onBack={() => setAuthView('profile')} 
                        onNavigateToAnime={handleNavigateToAnime} 
                        onNavigateToTopUp={handleNavigateToTopUp} 
                        onNavigateToMusicLibrary={handleNavigateToMusicLibrary} 
                        onNavigateToStore={handleNavigateToStore} 
                        onNavigateToCollection={handleNavigateToCollection}
                        onNavigateToSellPage={handleNavigateToSellPage}
                        onNavigateToInfo={handleNavigateToInfo} 
                        onNavigateToEarnXp={handleNavigateToEarnXp}
                        onNavigateToEvents={handleNavigateToEvents}
                        onNavigateToReversi={handleNavigateToReversi}
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
            'sell-page': <SellPage onBack={() => setAuthView('tools')} session={session} showNotification={showNotification} />,
            info: <InfoPage onBack={() => setAuthView('tools')} />,
            'earn-xp': <EarnXpPage onBack={() => setAuthView('tools')} session={session} />,
            'upload-cover': <UploadCoverPage onBack={() => setAuthView('store')} session={session} />,
            notifications: <NotificationsPage session={session} onBack={() => setAuthView('discover')} onMarkAllRead={() => setUnreadNotificationCount(0)} />,
            events: <EventsPage onBack={() => setAuthView('tools')} onNavigateToLuckRoyale={handleNavigateToLuckRoyale} />,
            'luck-royale': <LuckRoyalePage onBack={() => setAuthView('events')} session={session} showNotification={showNotification} />,
            reversi: <ReversiPage onBack={() => setAuthView('tools')} />,
            'password-security': <PasswordSecurityPage onBack={() => setAuthView('settings')} showNotification={showNotification} />,
            'privacy': <PrivacyPage onBack={() => setAuthView('settings')} />,
        }[authView];

        const isFullScreenPage = [
            'profile', 'music-library', 'tools', 'anime', 'anime-series', 'create-series', 'create-episode',
            'top-up', 'subscriptions', 'manual-payment', 'settings', 'edit-profile', 'password-security', 'privacy',
            'store', 'collection', 'sell-page', 'info', 'earn-xp', 'upload-cover', 'notifications', 'events', 'luck-royale', 'reversi'
        ].includes(authView);

        pageContent = (
            <>
                <main className={`${isLuckRoyale ? '' : `pb-20 ${!isFullScreenPage ? 'pt-4 px-4' : ''}`}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={authView + (viewingProfileId || '') + (viewingSeriesId || '')}
                            {...{
                                variants: pageVariants,
                                initial: "initial",
                                animate: "in",
                                exit: "out",
                                transition: pageTransition,
                            } as any}
                        >
                            {CurrentPage}
                        </motion.div>
                    </AnimatePresence>
                </main>
                {!isLuckRoyale && <BottomNav
                    activeView={authView}
                    setAuthView={handleSetAuthView}
                />}
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
            </>
        )
    }

    return (
        <div className="w-full min-h-screen bg-gray-200 dark:bg-black flex justify-center">
            <div className={`w-full max-w-sm bg-[var(--theme-bg)] min-h-screen shadow-2xl relative overflow-x-hidden ${isLuckRoyale ? 'h-screen overflow-hidden' : ''}`}>
                {showPermissionBanner && (
                    <div className="absolute top-0 left-0 right-0 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] p-3 z-[101] text-center shadow-lg">
                        <p className="text-sm">Want to get notified about rewards? Enable notifications!</p>
                        <div className="flex gap-2 justify-center mt-2">
                            <Button size="small" variant="secondary" onClick={handleRequestPermission} className="w-auto !text-[var(--theme-primary-text)] !bg-white/30 hover:!bg-white/50">Enable</Button>
                            <Button size="small" variant="secondary" onClick={() => setShowPermissionBanner(false)} className="w-auto !text-[var(--theme-primary-text)] !bg-transparent hover:!bg-white/20">Maybe Later</Button>
                        </div>
                    </div>
                )}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={chattingWith ? 'chat' : 'main'}
                        {...{
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                            transition: { duration: 0.3 },
                        } as any}
                    >
                        {pageContent}
                    </motion.div>
                </AnimatePresence>
                <NotificationPopup notification={notification} onClose={() => setNotification(null)} />
            </div>
        </div>
    );
}

export default UserApp;