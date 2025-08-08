import React, { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../../integrations/supabase/client';
import LoadingSpinner from '../common/LoadingSpinner';
import { SearchIcon as SearchIconSVG } from '../common/AppIcons';
import { motion, AnimatePresence } from 'framer-motion';
import type { Json } from '../../integrations/supabase/types';
import Avatar from '../common/Avatar';


// --- Local Types --- //
interface ProfileStub {
    id: string;
    name: string | null;
    username: string;
    photo_url: string | null;
    active_cover: { preview_url: string | null; asset_details: Json } | null;
}

type FetchedMessage = {
    content: string;
    created_at: string;
    is_read: boolean;
    sender_id: string;
    recipient_id: string;
};

interface Conversation {
    other_user: ProfileStub;
    last_message: {
        content: string;
        created_at: string;
    };
    unread_count: number;
}

interface MessagesPageProps {
    session: Session;
    onStartChat: (user: ProfileStub) => void;
}


const MessagesPage: React.FC<MessagesPageProps> = ({ session, onStartChat }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<ProfileStub[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const myId = session.user.id;

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch recent messages
                const { data: typedMessages, error: messagesError } = await supabase
                    .from('messages')
                    .select('content, created_at, is_read, sender_id, recipient_id')
                    .or(`sender_id.eq.${myId},recipient_id.eq.${myId}`)
                    .order('created_at', { ascending: false });

                if (messagesError) throw messagesError;
                
                const conversationsMap = new Map<string, { last_message: any; unread_count: number }>();
                const otherUserIds = new Set<string>();

                for (const message of typedMessages) {
                    const otherUserId = message.sender_id === myId ? message.recipient_id : message.sender_id;
                    otherUserIds.add(otherUserId);

                    if (!conversationsMap.has(otherUserId)) {
                        conversationsMap.set(otherUserId, {
                            last_message: message,
                            unread_count: 0
                        });
                    }
                    if (!message.is_read && message.recipient_id === myId) {
                        const existing = conversationsMap.get(otherUserId)!;
                        existing.unread_count += 1;
                    }
                }
                
                // Fetch some users for the "online" list (dummy data for now)
                const { data: onlineUsersData, error: onlineUsersError } = await supabase
                    .from('profiles')
                    .select('id, name, username, photo_url, active_cover:active_cover_id(preview_url, asset_details)')
                    .limit(10);
                if(onlineUsersError) throw onlineUsersError;
                setOnlineUsers((onlineUsersData as any[]) || []);

                if (otherUserIds.size === 0) {
                    setConversations([]);
                    setLoading(false);
                    return;
                }
                
                // Fetch profiles for the conversations
                const { data: typedProfiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, name, username, photo_url, active_cover:active_cover_id(preview_url, asset_details)')
                    .in('id', Array.from(otherUserIds));

                if (profilesError) throw profilesError;
                
                const profilesMap = new Map(typedProfiles.map(p => [p.id, p]));

                const convos: Conversation[] = Array.from(conversationsMap.entries()).map(([userId, convoData]) => ({
                    other_user: profilesMap.get(userId) as ProfileStub,
                    last_message: {
                        content: convoData.last_message.content,
                        created_at: convoData.last_message.created_at,
                    },
                    unread_count: convoData.unread_count,
                })).filter(c => c.other_user);

                setConversations(convos);

            } catch (err: any) {
                setError(err.message || 'Failed to load conversations.');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [myId]);

     const filteredConversations = useMemo(() => {
        if (!searchTerm) return conversations;
        return conversations.filter(convo =>
            convo.other_user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            convo.other_user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [conversations, searchTerm]);
    
    return (
        <div className="min-h-full">
            <div className="relative mb-4">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--theme-text-secondary)]">
                   <SearchIconSVG />
               </div>
               <input
                   type="text"
                   placeholder="Search"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full bg-[var(--theme-secondary)] border-transparent rounded-full text-[var(--theme-text)] placeholder-[var(--theme-text-secondary)] px-4 py-2.5 pl-12 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)]"
               />
           </div>
           <div className="mb-4">
               <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
                    {onlineUsers.map(user => (
                       <button key={user.id} onClick={() => onStartChat(user)} className="flex flex-col items-center space-y-1 text-center flex-shrink-0 w-16">
                           <Avatar 
                               photoUrl={user.photo_url}
                               name={user.username}
                               activeCover={user.active_cover}
                               size="lg"
                               imageClassName="border-2 border-[var(--theme-primary)]/50"
                           />
                       </button>
                   ))}
               </div>
           </div>
            
            <main>
                {loading && (
                     <div className="flex justify-center pt-20">
                        <LoadingSpinner />
                    </div>
                )}
                
                {error && (
                    <div className="text-center pt-20 px-4 text-red-500" role="alert">
                        <p>Error loading messages: {error}</p>
                    </div>
                )}

                {!loading && !error && filteredConversations.length === 0 && (
                    <div className="text-center py-16 px-4">
                        <h2 className="text-xl font-semibold text-[var(--theme-text)]">No conversations yet</h2>
                        <p className="text-[var(--theme-text-secondary)] mt-2">Find users on the Discover page to start a chat.</p>
                    </div>
                )}

                {!loading && filteredConversations.length > 0 && (
                    <div className="space-y-1">
                         <AnimatePresence>
                            {filteredConversations.map(({ other_user, last_message, unread_count }, index) => {
                                const isUnread = unread_count > 0;
                                return (
                                 <motion.button 
                                    key={other_user.id} 
                                    {...{
                                        initial: { opacity: 0, y: 20 },
                                        animate: { opacity: 1, y: 0 },
                                        exit: { opacity: 0, y: -20 },
                                        transition: { delay: index * 0.05 }
                                    } as any}
                                    onClick={() => onStartChat(other_user)}
                                    className="w-full flex items-center p-3 rounded-2xl hover:bg-[var(--theme-secondary)] transition-colors text-left"
                                >
                                    <div className="relative flex-shrink-0">
                                        <Avatar
                                            photoUrl={other_user.photo_url}
                                            name={other_user.name || other_user.username}
                                            activeCover={other_user.active_cover}
                                            size="lg"
                                        />
                                    </div>
                                    <div className="ml-4 flex-grow overflow-hidden">
                                        <div className="flex justify-between items-start">
                                            <p className={`truncate ${isUnread ? 'font-bold text-[var(--theme-text)]' : 'font-semibold text-[var(--theme-text)]'}`}>{other_user.name || other_user.username}</p>
                                            <span className="text-xs text-[var(--theme-text-secondary)] flex-shrink-0 ml-2">{new Date(last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex justify-between items-start mt-1">
                                            <p className={`text-sm truncate ${isUnread ? 'text-[var(--theme-text)]' : 'text-[var(--theme-text-secondary)]'}`}>{last_message.content}</p>
                                            {isUnread && (
                                                <span className="h-5 w-5 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] text-xs flex items-center justify-center rounded-full font-bold flex-shrink-0 ml-2">{unread_count}</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.button>
                            )})}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MessagesPage;