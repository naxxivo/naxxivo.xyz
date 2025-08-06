

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { generateAvatar } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Tables, TablesUpdate, TablesInsert } from '../../integrations/supabase/types';
import Button from '../common/Button';
import { BackArrowIcon } from '../common/AppIcons';


// --- Types --- //
interface ChatPageProps {
    session: Session;
    otherUser: { id: string; name: string; photo_url: string | null };
    onBack: () => void;
}

type Message = Tables<'messages'>;


// --- Icons --- //
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
)

const ReadReceiptIcon = ({ isRead }: { isRead: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isRead ? 'text-violet-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        {isRead && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l4 4L23 7" />}
    </svg>
);


// --- Date Formatting Helper --- //
const formatDateSeparator = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};


// --- Main Component --- //
const MESSAGES_PER_PAGE = 25;

const ChatPage: React.FC<ChatPageProps> = ({ session, otherUser, onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const myId = session.user.id;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const fetchMessages = useCallback(async (pageNum: number) => {
        const from = pageNum * MESSAGES_PER_PAGE;
        const to = from + MESSAGES_PER_PAGE - 1;

        const filter = `and(sender_id.eq.${myId},recipient_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},recipient_id.eq.${myId})`;

        const { data, error } = await supabase
            .from('messages')
            .select('id, created_at, content, sender_id, recipient_id, is_read, status')
            .or(filter)
            .order('created_at', { ascending: false })
            .range(from, to);
        
        if (error) {
            console.error("Failed to fetch messages:", error);
            return [];
        }

        return (data || []).reverse();
    }, [myId, otherUser.id]);

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        const nextPage = page + 1;
        const newMessages = await fetchMessages(nextPage);

        if (newMessages.length > 0) {
            const container = chatContainerRef.current;
            const oldScrollHeight = container?.scrollHeight || 0;
            
            setMessages(prev => [...newMessages, ...prev]);
            
            if (container) {
                 requestAnimationFrame(() => {
                    container.scrollTop = container.scrollHeight - oldScrollHeight;
                });
            }
            
            setPage(nextPage);
        }
        
        if (newMessages.length < MESSAGES_PER_PAGE) {
            setHasMore(false);
        }

        setLoadingMore(false);
    };
    
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`; // Max height of 128px (8rem)
        }
    }, [newMessage]);


    useEffect(() => {
        const initChat = async () => {
            setLoading(true);
            const initialMessages = await fetchMessages(0);
            setMessages(initialMessages);

            if (initialMessages.length < MESSAGES_PER_PAGE) setHasMore(false);
            setLoading(false);
            
             setTimeout(() => { messagesEndRef.current?.scrollIntoView(); }, 100);

            const unreadMessageIds = initialMessages.filter(m => m.recipient_id === myId && !m.is_read).map(m => m.id);

            if (unreadMessageIds.length > 0) {
                await supabase.from('messages').update({ is_read: true } as any).in('id', unreadMessageIds);
            }
        };
        initChat();

        const channel = supabase.channel(`chat:${[myId, otherUser.id].sort().join(':')}`);
        
        const subscriptions = {
            insert: channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
                const newMessage = payload.new as Message;
                if (newMessage.sender_id === otherUser.id && newMessage.recipient_id === myId) {
                    setMessages(current => [...current, newMessage]);
                    await supabase.from('messages').update({ is_read: true } as any).eq('id', newMessage.id);
                }
            }),
            update: channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
                const updatedMessage = payload.new as Message;
                 if (updatedMessage.sender_id === myId && updatedMessage.recipient_id === otherUser.id) {
                     setMessages(current => current.map(m => m.id === updatedMessage.id ? { ...m, is_read: updatedMessage.is_read } : m));
                 }
            }),
        };

        channel.subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [myId, otherUser.id, fetchMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content) return;
        setNewMessage('');

        const tempId = Date.now();
        const optimisticMessage: Message = { id: tempId, content, created_at: new Date().toISOString(), sender_id: myId, recipient_id: otherUser.id, is_read: false, status: 'sent' };
        setMessages(current => [...current, optimisticMessage]);

        const messagePayload: TablesInsert<'messages'> = { sender_id: myId, recipient_id: otherUser.id, content, is_read: false, status: "sent" };
        const { data, error } = await supabase.from('messages').insert([messagePayload]).select().single();
        
        if (data) {
             setMessages(current => current.map(m => m.id === tempId ? { ...m, id: data.id, created_at: data.created_at } : m));
        }
        if (error) {
            setMessages(current => current.filter(m => m.id !== tempId));
            setNewMessage(content);
        }
    };
    
    let lastDate: string | null = null;
    
    return (
         <div className="min-h-screen flex flex-col bg-white">
            <header className="flex items-center p-3 bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900 transition-colors mr-3"><BackArrowIcon /></button>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <img src={otherUser.photo_url || generateAvatar(otherUser.name)} alt={otherUser.name} className="w-full h-full object-cover" />
                </div>
                <h2 className="ml-3 text-lg font-bold text-gray-800">{otherUser.name}</h2>
            </header>

            <main 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50"
            >
                {loading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                
                {!loading && hasMore && (
                     <div className="text-center">
                        <Button onClick={handleLoadMore} disabled={loadingMore} variant="secondary" className="w-auto px-4" size="small">
                            {loadingMore ? 'Loading...' : 'Load more'}
                        </Button>
                    </div>
                )}

                {!loading && messages.map((msg) => {
                    const isMine = msg.sender_id === myId;
                    const currentDate = new Date(msg.created_at).toDateString();
                    const showDateSeparator = currentDate !== lastDate;
                    lastDate = currentDate;

                    return (
                        <React.Fragment key={msg.id}>
                            {showDateSeparator && (
                                <div className="text-center text-xs text-gray-400 my-4 uppercase tracking-wider">
                                    {formatDateSeparator(msg.created_at)}
                                </div>
                            )}
                            <div className={`flex items-end gap-2 group ${isMine ? 'justify-end' : 'justify-start'}`}>
                               <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl ${isMine ? 'bg-violet-500 text-white rounded-br-lg' : 'bg-gray-200 text-gray-800 rounded-bl-lg'}`}>
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                               </div>
                               <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0 flex items-center gap-1">
                                    {isMine && <ReadReceiptIcon isRead={msg.is_read} />}
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </div>
                            </div>
                        </React.Fragment>
                    )
                })}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-2 sm:p-4 bg-white border-t border-gray-200 sticky bottom-0">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-3 max-w-2xl mx-auto">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={newMessage}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow bg-gray-100 border-transparent rounded-2xl text-gray-800 placeholder-gray-500 px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button type="submit" className="p-3 bg-violet-500 text-white rounded-full hover:bg-violet-600 disabled:bg-violet-300 disabled:cursor-not-allowed transition-colors" disabled={!newMessage.trim()}>
                        <SendIcon />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatPage;