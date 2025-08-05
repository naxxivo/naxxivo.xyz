import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './integrations/supabase/client';
import Login from './components/Login';
import Signup from './components/Signup';
import Welcome from './components/Welcome';
import Profile from './components/Profile';
import HomePage from './components/home/HomePage';
import BottomNav from './components/layout/BottomNav';
import CreatePost from './components/home/CreatePost';
import MessagesPage from './components/messages/MessagesPage';
import ChatPage from './components/messages/ChatPage';
import AnimePage from './components/anime/AnimePage';
import SeriesDetailPage from './components/anime/SeriesDetailPage';
import SettingsPage from './components/settings/SettingsPage';
import UsersPage from './components/users/UsersPage';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import LoadingSpinner from './components/common/LoadingSpinner';

type AuthView = 'home' | 'anime' | 'leaderboard' | 'profile' | 'settings' | 'messages';
type UnauthView = 'welcome' | 'login' | 'signup';

const slideVariants = {
    initial: { x: '100%', opacity: 0 },
    in: { x: 0, opacity: 1 },
    out: { x: '-100%', opacity: 0 },
};

const slideTransition: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
};

const animationProps = {
    initial: "initial",
    animate: "in",
    exit: "out",
    variants: slideVariants,
    transition: slideTransition,
};


const App: React.FC = () => {
    const [unauthView, setUnauthView] = useState<UnauthView>('welcome');
    const [authView, setAuthView] = useState<AuthView>('home');
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreatePostOpen, setCreatePostOpen] = useState(false);
    const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
    const [chattingWith, setChattingWith] = useState<{ id: string; name: string; photo_url: string | null } | null>(null);
    const [viewingSeriesId, setViewingSeriesId] = useState<number | null>(null);
    const [refreshFeedKey, setRefreshFeedKey] = useState(0);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };
        
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) {
                setAuthView('home'); // Reset to home on logout
                setUnauthView('welcome');
                setViewingProfileId(null);
                setChattingWith(null);
                setViewingSeriesId(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handlePostCreated = () => {
        setCreatePostOpen(false);
        // This key change will force HomePage to re-run its useEffect
        setRefreshFeedKey(prevKey => prevKey + 1);
    };
    
    const handleSetAuthView = (view: 'home' | 'anime' | 'leaderboard' | 'profile') => {
        setViewingProfileId(null); // Always reset when using bottom nav
        setChattingWith(null);
        setViewingSeriesId(null);
        setAuthView(view);
    };
    
    const handleNavigateToSettings = () => {
        setViewingProfileId(null);
        setAuthView('settings');
    }
    
    const handleNavigateToMessages = () => {
        setViewingProfileId(null);
        setAuthView('messages');
    }

    const handleViewProfile = (userId: string) => {
        setAuthView('profile'); // Ensure the view is correct
        setViewingProfileId(userId);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-200 space-y-4 bg-[#100F1F]">
                <LoadingSpinner />
                <span>Loading Session...</span>
            </div>
        );
    }
    
    if (session) {
        let pageContent;
        if (chattingWith) {
             pageContent = (
                <motion.div key="chat" {...animationProps}>
                    <ChatPage session={session} otherUser={chattingWith} onBack={() => setChattingWith(null)}/>
                </motion.div>
            );
        } else if (viewingSeriesId) {
            pageContent = (
                <motion.div key="series" {...animationProps}>
                    <SeriesDetailPage session={session} seriesId={viewingSeriesId} onBack={() => setViewingSeriesId(null)}/>
                </motion.div>
            );
        } else if (viewingProfileId) {
             pageContent = (
                <motion.div key="profile-detail" {...animationProps}>
                     <main className="w-full max-w-2xl mx-auto px-4 pt-4 sm:pt-8 pb-8">
                        <Profile 
                            session={session} 
                            userId={viewingProfileId} 
                            onBack={() => setViewingProfileId(null)}
                            onMessage={(user) => setChattingWith(user)}
                            onViewProfile={handleViewProfile}
                        />
                    </main>
                </motion.div>
             );
        } else {
            // Main content with bottom nav
             pageContent = (
                <motion.div key="main-view" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.2}}>
                    <div className="min-h-screen bg-[#100F1F] pb-20">
                        <main className="w-full max-w-2xl mx-auto px-4 pt-4 sm:pt-8 relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div key={authView} {...animationProps}>
                                    {authView === 'home' && <HomePage session={session} onViewProfile={handleViewProfile} refreshKey={refreshFeedKey} />}
                                    {authView === 'anime' && <AnimePage session={session} onViewSeries={setViewingSeriesId} />}
                                    {authView === 'leaderboard' && <UsersPage session={session} onViewProfile={handleViewProfile} />}
                                    {authView === 'messages' && <MessagesPage session={session} onStartChat={setChattingWith} />}
                                    {authView === 'profile' && <Profile session={session} onMessage={(user) => setChattingWith(user)} onLogout={handleLogout} onNavigateToSettings={handleNavigateToSettings} onNavigateToMessages={handleNavigateToMessages} onViewProfile={handleViewProfile} />}
                                    {authView === 'settings' && <SettingsPage session={session} onBack={() => setAuthView('profile')} />}
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
                    </div>
                </motion.div>
             );
        }

        return (
             <div className="min-h-screen bg-[#100F1F] overflow-hidden">
                <AnimatePresence mode="wait">
                    {pageContent}
                </AnimatePresence>
             </div>
       );
    }

    const renderView = () => {
        switch (unauthView) {
            case 'login':
                return <Login setView={setUnauthView} />;
            case 'signup':
                return <Signup setView={setUnauthView} />;
            case 'welcome':
            default:
                return <Welcome setView={setUnauthView} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden animated-gradient-bg">
            <AnimatePresence mode="wait">
                <motion.div
                    key={unauthView}
                    className="w-full max-w-md mx-auto"
                    {...animationProps}
                >
                    {renderView()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default App;