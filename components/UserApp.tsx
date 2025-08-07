import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../integrations/supabase/client';
import AuthPage from './auth/AuthPage';
import AuthForm from './auth/AuthForm';
import Profile from './Profile';
import HomePage from './home/HomePage';
import BottomNav from './layout/BottomNav';
import CreatePost from './home/CreatePost';
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
import InfoPage from './info/InfoPage';
import EarnXpPage from './xp/EarnXpPage';
import PasswordModal from './common/PasswordModal';
import { motion, AnimatePresence } from 'framer-motion';

export type AuthView =
    'home' | 'discover' | 'profile' | 'settings' | 'messages' | 'edit-profile' | 'music-library' |
    'tools' | 'anime' | 'anime-series' | 'create-series' | 'create-episode' |
    'top-up' | 'subscriptions' | 'manual-payment' |
    'store' | 'collection' | 'info' | 'earn-xp';

const pageVariants = {
    initial: { opacity: 0, x: "100%" },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: "-100%" },
};

const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.5
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
    const [chattingWith, setChattingWith] = useState<{ id: string; name: string; photo_url: string | null } | null>(null);
    const [refreshFeedKey, setRefreshFeedKey] = useState(0);
    const [refreshAnimeKey, setRefreshAnimeKey] = useState(0);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handlePostCreated = () => {
        setCreatePostOpen(false);
        setRefreshFeedKey(prevKey => prevKey + 1);
        if (authView !== 'home') {
           handleSetAuthView('home');
        }
    };
    
    const handleSetAuthView = (view: 'home' | 'discover' | 'profile' | 'messages') => {
        setViewingProfileId(null);
        setChattingWith(null);
        setViewingSeriesId(null);
        setAuthView(view);
    };
    
    const handleNavigateToSettings = () => {
        setViewingProfileId(null);
        setAuthView('settings');
    }

    const handleNavigateToMusicLibrary = () => {
        setAuthView('music-library');
    }
    
     const handleNavigateToEditProfile = () => {
        setAuthView('edit-profile');
    }

    const handleNavigateToTools = () => {
        setAuthView('tools');
    };

    const handleNavigateToAnime = () => {
        setAuthView('anime');
    }
    
    const handleNavigateToCreateSeries = () => {
        setAuthView('create-series');
    }

    const handleNavigateToCreateEpisode = () => {
        setAuthView('create-episode');
    }

    const handleNavigateToTopUp = () => {
        setAuthView('top-up');
    }

    const handleNavigateToSubscriptions = () => {
        setAuthView('subscriptions');
    }
    
    const handleNavigateToManualPayment = (productId: number) => {
        setPaymentProductId(productId);
        setAuthView('manual-payment');
    }

    const handleNavigateToStore = () => setAuthView('store');
    const handleNavigateToCollection = () => setAuthView('collection');
    const handleNavigateToInfo = () => setAuthView('info');
    const handleNavigateToEarnXp = () => setAuthView('earn-xp');

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
            home: <HomePage session={session} onViewProfile={handleViewProfile} refreshKey={refreshFeedKey} onOpenSearch={() => setIsSearchOpen(true)} />,
            discover: <UsersPage session={session} onViewProfile={handleViewProfile} />,
            messages: <MessagesPage session={session} onStartChat={setChattingWith} />,
            profile: <Profile 
                        session={session} 
                        userId={viewingProfileId || session.user.id} 
                        onBack={viewingProfileId ? () => { setViewingProfileId(null); setAuthView('home');} : undefined}
                        onMessage={(user) => setChattingWith(user)}
                        onNavigateToSettings={handleNavigateToSettings}
                        onNavigateToTools={handleNavigateToTools}
                        onViewProfile={handleViewProfile}
                     />,
            settings: <SettingsPage 
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
                                    setViewingProfileId(null); 
                                    setTimeout(() => setViewingProfileId(session.user.id), 0);
                                }}
                            />,
            'music-library': <MusicLibraryPage
                                session={session}
                                onBack={() => setAuthView('profile')}
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
            'top-up': <TopUpPage onBack={() => setAuthView('tools')} onPurchase={handleNavigateToManualPayment} onManageSubscriptions={handleNavigateToSubscriptions} />,
            'subscriptions': <SubscriptionClaimPage onBack={() => setAuthView('top-up')} session={session} />,
            'manual-payment': <ManualPaymentPage onBack={() => setAuthView('top-up')} session={session} productId={paymentProductId!} onSubmit={() => setAuthView('top-up')} />,
            store: <StorePage onBack={() => setAuthView('tools')} session={session} />,
            collection: <CollectionPage onBack={() => setAuthView('tools')} session={session} />,
            info: <InfoPage onBack={() => setAuthView('tools')} />,
            'earn-xp': <EarnXpPage onBack={() => setAuthView('tools')} session={session} />,
        }[authView];

        const isFullScreenPage = [
            'profile', 'music-library', 'tools', 'anime', 'anime-series', 'create-series', 'create-episode',
            'top-up', 'subscriptions', 'manual-payment', 'settings', 'edit-profile',
            'store', 'collection', 'info', 'earn-xp'
        ].includes(authView);

        pageContent = (
            <>
                <main className={`pb-20 ${!isFullScreenPage ? 'pt-4 px-4' : ''}`}>
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
                <BottomNav
                    activeView={authView}
                    setAuthView={handleSetAuthView}
                    onAddPost={() => setCreatePostOpen(true)}
                />
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
                />
            </>
        )
    }

    return (
        <div className="w-full min-h-screen bg-gray-200 dark:bg-black flex justify-center">
            <div className="w-full max-w-sm bg-[var(--theme-bg)] min-h-screen shadow-2xl relative overflow-x-hidden">
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
            </div>
        </div>
    );
}

export default UserApp;