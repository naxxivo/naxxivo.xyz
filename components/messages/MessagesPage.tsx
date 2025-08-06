import React, { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { generateAvatar } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import { SearchIcon as SearchIconSVG } from '../common/AppIcons';


// --- Local Types --- //
interface ProfileStub {
    id: string;
    name: string | null;
    username: string;
    photo_url: string | null;
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
    onStartChat: (user: { id: string; name: string; photo_url: string | null }) => void;
}


const MessagesPage: React.FC<MessagesPageProps> = ({ session, onStartChat }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const myId = session.user.id;

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            setError(null);
            try {
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
                
                if (otherUserIds.size === 0) {
                    setConversations([]);
                    setLoading(false);
                    return;
                }

                const { data: typedProfiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, name, username, photo_url')
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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[var(--theme-text)]">Messages</h1>
            
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIconSVG />
                </div>
                <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[var(--theme-card-bg)] border-transparent rounded-full text-[var(--theme-text)] placeholder-gray-500 px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)]"
                />
            </div>
            
            {loading && (
                 <div className="flex justify-center pt-20">
                    <LoadingSpinner />
                </div>
            )}
            
            {error && (
                <div className="text-center pt-20 text-red-500" role="alert">
                    <p>Error loading messages: {error}</p>
                </div>
            )}

            {!loading && !error && filteredConversations.length === 0 && (
                <div className="text-center py-16 px-4 bg-[var(--theme-card-bg-alt)] rounded-2xl">
                    <h2 className="text-xl font-semibold text-[var(--theme-text)]">No conversations yet</h2>
                    <p className="text-[var(--theme-text-secondary)] mt-2">Find users on the Discover page to start a chat.</p>
                </div>
            )}

            {!loading && filteredConversations.length > 0 && (
                <div className="space-y-3">
                    {filteredConversations.map(({ other_user, last_message, unread_count }) => {
                        const isUnread = unread_count > 0;
                        return (
                         <button 
                            key={other_user.id} 
                            onClick={() => onStartChat({ id: other_user.id, name: other_user.name || 'Unknown', photo_url: other_user.photo_url })}
                            className="w-full flex items-center p-3 bg-[var(--theme-card-bg)] rounded-2xl hover:bg-opacity-80 transition-colors text-left shadow-sm"
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
                                    <img 
                                        src={other_user.photo_url || generateAvatar(other_user.name || other_user.username)} 
                                        alt={other_user.name || ''} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                {isUnread && (
                                     <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-[var(--theme-primary)] ring-2 ring-[var(--theme-card-bg)]" />
                                )}
                            </div>
                            <div className="ml-4 flex-grow overflow-hidden">
                                <p className={`truncate ${isUnread ? 'font-bold text-[var(--theme-text)]' : 'font-semibold text-[var(--theme-text)]'}`}>{other_user.name || other_user.username}</p>
                                <p className={`text-sm truncate ${isUnread ? 'text-[var(--theme-text)]' : 'text-[var(--theme-text-secondary)]'}`}>{last_message.content}</p>
                            </div>
                            <div className="flex flex-col items-end ml-2 text-xs text-gray-400 self-start pt-1">
                                <span>{new Date(last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {isUnread && (
                                    <span className="mt-1.5 h-5 w-5 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] text-xs flex items-center justify-center rounded-full font-bold">{unread_count}</span>
                                )}
                            </div>
                        </button>
                    )})}
                </div>
            )}
        </div>
    );
};

export default MessagesPage;