import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../integrations/supabase/client';
import Profile from './Profile';
import GamePage, { type GameStatus } from './home/HomePage';
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
import InfoPage from './info/InfoPage';
import EarnXpPage from './xp/EarnXpPage';
import PasswordModal from './common/PasswordModal';
import UploadCoverPage from './store/UploadCoverPage';
import NotificationsPage from './notifications/NotificationsPage';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationPopup, { type NotificationDetails } from './common/NotificationPopup';
import Button from './common/Button';
import type { Json, Tables } from '../integrations/supabase/types';
import ConfirmationModal from './common/ConfirmationModal';
import GameInviteModal from './game/GameInviteModal';

export type AuthView =
    'game' | 'discover' | 'profile' | 'settings' | 'messages' | 'edit-profile' | 'music-library' |
    'tools' | 'anime' | 'anime-series' | 'create-series' | 'create-episode' |
    'top-up' | 'subscriptions' | 'manual-payment' |
    'store' | 'collection' | 'info' | 'earn-xp' | 'upload-cover' | 'notifications';

type InviteWithProfile = Tables<'game_invites'> & {
    profiles: Pick<Tables<'profiles'>, 'id' | 'name' | 'username' | 'photo_url' | 'active_cover_id'> | null;
};
    
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
    const [authView, setAuthView] = useState<AuthView>('game');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
    const [viewingSeriesId, setViewingSeriesId] = useState<number | null>(null);
    const [paymentProductId, setPaymentProductId] = useState<number | null>(null);
    const [chattingWith, setChattingWith] = useState<{ id: string; name: string; photo_url: string | null; active_cover: { preview_url: string | null; asset_details: Json } | null } | null>(null);
    const [refreshAnimeKey, setRefreshAnimeKey] = useState(0);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    // Game & Invite State
    const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
    const [gameIdToPlay, setGameIdToPlay] = useState<string | null>(null);
    const [sentInvite, setSentInvite] = useState<Tables<'game_invites'> | null>(null);
    const [incomingInvite, setIncomingInvite] = useState<InviteWithProfile | null>(null);
    const [isInviteSearchOpen, setInviteSearchOpen] = useState(false);
    const [pendingInviteIds, setPendingInviteIds] = useState<Set<string>>(new Set());
    const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

    const [notification, setNotification] = useState<NotificationDetails | null>(null);
    const [showPermissionBanner, setShowPermissionBanner] = useState(false);
    
    // Listen for my incoming and sent invites
    useEffect(() => {
        const myId = session.user.id;
        const channel = supabase
            .channel('game-invites')
            .on<Tables<'game_invites'>>(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'game_invites' },
                async (payload) => {
                    const invite = payload.new as Tables<'game_invites'>;

                    // An invite I received
                    if (payload.eventType === 'INSERT' && invite.invitee_id === myId && invite.status === 'pending') {
                        const { data: profile } = await supabase.from('profiles').select('id, name, username, photo_url, active_cover_id').eq('id', invite.inviter_id).single();
                        setIncomingInvite({ ...invite, profiles: profile });
                    }
                    
                    // An invite I sent was updated
                    if (payload.eventType === 'UPDATE' && invite.inviter_id === myId && sentInvite?.id === invite.id) {
                        setSentInvite(invite);
                        if(invite.status === 'accepted' && invite.game_id) {
                            setGameIdToPlay(invite.game_id);
                            setAuthView('game');
                            setSentInvite(null);
                        } else if (invite.status === 'rejected' || invite.status === 'cancelled') {
                             setSentInvite(null); // Clear waiting state
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session.user.id, sentInvite]);

    
    const showNotification = (details: NotificationDetails) => {
        setNotification(details);
    };
    
    // Browser notifications
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

    const handleSetAuthView = (view: 'game' | 'discover' | 'profile' | 'messages') => {
        setViewingProfileId(null);
        setChattingWith(null);
        setViewingSeriesId(null);
        setGameIdToPlay(null);
        setSentInvite(null);
        setAuthView(view);
    };
    
    // --- Invite Flow Handlers ---
    const handleSendInvite = async (invitee: Pick<Tables<'profiles'>, 'id'>) => {
        setInviteSearchOpen(false);
        const { data, error } = await supabase
            .from('game_invites')
            .insert({ inviter_id: session.user.id, invitee_id: invitee.id })
            .select()
            .single();
        if (error) {
            showNotification({ type: 'error', title: 'Invite Failed', message: error.message });
        } else {
            setSentInvite(data);
            setPendingInviteIds(prev => new Set(prev).add(invitee.id));
        }
    };
    
    const handleAcceptInvite = async (inviteId: string) => {
        const { data: gameId, error } = await supabase.rpc('accept_game_invite', { p_invite_id: inviteId });
        setIncomingInvite(null);
        if (error) {
            showNotification({ type: 'error', title: 'Error', message: 'Could not accept invite. It may have expired.' });
        } else {
            setGameIdToPlay(gameId);
            setAuthView('game');
        }
    };
    
    const handleDeclineInvite = async (inviteId: string) => {
        await supabase.rpc('decline_game_invite', { p_invite_id: inviteId });
        setIncomingInvite(null);
    };

    const handleCancelInvite = async (inviteId: string) => {
        await supabase.rpc('cancel_game_invite', { p_invite_id: inviteId });
        setSentInvite(null);
    };

    const handleCenterButtonClick = () => {
        if (gameStatus === 'idle' || gameStatus === 'finished') {
            // This is now handled inside GamePage.
            // A better approach would be to manage game state here.
            // For now, we just go to the game page.
            handleSetAuthView('game');
        }
        if (gameStatus === 'playing') {
            setIsLeaveConfirmOpen(true);
        }
    };

    const handleLeaveGame = () => {
        setGameIdToPlay(null);
        setGameStatus('idle');
        setIsLeaveConfirmOpen(false);
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
    const handleNavigateToUploadCover = () => setAuthView('upload-cover');
    const handleNavigateToNotifications = () => setAuthView('notifications');

    const handleViewProfile = (userId: string) => {
        setInviteSearchOpen(false);
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
            game: <GamePage 
                session={session} 
                onStatusChange={setGameStatus} 
                onInviteFriend={() => setInviteSearchOpen(true)}
                sentInvite={sentInvite}
                gameIdToPlay={gameIdToPlay}
                onCancelInvite={handleCancelInvite}
             />,
            discover: <UsersPage session={session} onViewProfile={handleViewProfile} />,
            messages: <MessagesPage session={session} onStartChat={setChattingWith} />,
            profile: <Profile 
                        session={session} 
                        userId={viewingProfileId || session.user.id} 
                        onBack={viewingProfileId ? () => { setViewingProfileId(null); setAuthView('game');} : undefined}
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
            'top-up': <TopUpPage onBack={() => setAuthView('tools')} onPurchase={handleNavigateToManualPayment} onManageSubscriptions={handleNavigateToSubscriptions} showBrowserNotification={(title, body) => {}} />,
            'subscriptions': <SubscriptionClaimPage onBack={() => setAuthView('top-up')} session={session} showNotification={showNotification} showBrowserNotification={(title, body) => {}} />,
            'manual-payment': <ManualPaymentPage onBack={() => setAuthView('top-up')} session={session} productId={paymentProductId!} onSubmit={() => setAuthView('top-up')} showNotification={showNotification} />,
            store: <StorePage onBack={() => setAuthView('tools')} session={session} onNavigateToUploadCover={handleNavigateToUploadCover} showNotification={showNotification} />,
            collection: <CollectionPage onBack={() => setAuthView('tools')} session={session} showNotification={showNotification} />,
            info: <InfoPage onBack={() => setAuthView('tools')} />,
            'earn-xp': <EarnXpPage onBack={() => setAuthView('tools')} session={session} />,
            'upload-cover': <UploadCoverPage onBack={() => setAuthView('store')} session={session} />,
            'notifications': <NotificationsPage session={session} onBack={() => setAuthView('game')} onMarkAllRead={() => setUnreadNotificationCount(0)} />,
        }[authView];

        const isFullScreenPage = [
            'profile', 'music-library', 'tools', 'anime', 'anime-series', 'create-series', 'create-episode',
            'top-up', 'subscriptions', 'manual-payment', 'settings', 'edit-profile',
            'store', 'collection', 'info', 'earn-xp', 'upload-cover', 'notifications'
        ].includes(authView);

        pageContent = (
            <>
                <main className={`pb-20 ${!isFullScreenPage ? 'pt-4 px-4' : ''}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={authView + (viewingProfileId || '') + (viewingSeriesId || '') + (gameIdToPlay || '')}
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
                    onCenterButtonClick={handleCenterButtonClick}
                    gameStatus={gameStatus}
                />
                 <AnimatePresence>
                    {isInviteSearchOpen && <SearchOverlay 
                        onClose={() => setInviteSearchOpen(false)} 
                        onInvite={handleSendInvite} 
                        mode="invite" 
                        pendingInviteIds={pendingInviteIds}
                    />}
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
                 <ConfirmationModal
                    isOpen={isLeaveConfirmOpen}
                    onClose={() => setIsLeaveConfirmOpen(false)}
                    onConfirm={handleLeaveGame}
                    title="Leave Game?"
                    message="Are you sure you want to leave? This will count as a forfeit."
                    confirmText="Yes, Leave"
                />
            </>
        )
    }

    return (
        <div className="w-full min-h-screen bg-gray-200 dark:bg-black flex justify-center">
            <div className="w-full max-w-sm bg-[var(--theme-bg)] min-h-screen shadow-2xl relative overflow-x-hidden">
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
                <GameInviteModal 
                    invite={incomingInvite}
                    onAccept={handleAcceptInvite}
                    onDecline={handleDeclineInvite}
                />
            </div>
        </div>
    );
}

export default UserApp;