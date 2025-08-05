import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { generateAvatar } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Tables, TablesUpdate } from '../../integrations/supabase/types';
import Button from '../common/Button';


// --- Types --- //
interface ChatPageProps {
    session: Session;
    otherUser: { id: string; name: string; photo_url: string | null };
    onBack: () => void;
}

type Message = Tables<'messages'>;


// --- Icons --- //
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
)

const ReadReceiptIcon = ({ isRead }: { isRead: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isRead ? 'text-blue-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

    const bgPattern = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='%231C1B33'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`;

    const fetchMessages = useCallback(async (pageNum: number) => {
        const from = pageNum * MESSAGES_PER_PAGE;
        const to = from + MESSAGES_PER_PAGE - 1;

        const filter = `and(sender_id.eq.${myId},recipient_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},recipient_id.eq.${myId})`;

        const { data, error } = await supabase
            .from('messages')
            .select('id, created_at, content, sender_id, recipient_id, is_read, status')
            .or(filter)
            .order('created_at', { ascending: false })
            .range(from, to)
            .returns<Message[]>();
        
        if (error) {
            console.error("Failed to fetch messages:", error);
            return [];
        }

        return (data || []).reverse(); // Reverse to maintain ascending order
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
            
            // Maintain scroll position after prepending new messages
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
    
    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [newMessage]);


    // Initial fetch and subscriptions
    useEffect(() => {
        const initChat = async () => {
            setLoading(true);
            const initialMessages = await fetchMessages(0);
            setMessages(initialMessages);

            if (initialMessages.length < MESSAGES_PER_PAGE) {
                setHasMore(false);
            }

            setLoading(false);
            
             setTimeout(() => {
                messagesEndRef.current?.scrollIntoView();
            }, 100);

            const unreadMessageIds = initialMessages
                .filter(m => m.recipient_id === myId && !m.is_read)
                .map(m => m.id);

            if (unreadMessageIds.length > 0) {
                const updatePayload: TablesUpdate<'messages'> = { is_read: true };
                await supabase
                    .from('messages')
                    .update(updatePayload)
                    .in('id', unreadMessageIds);
            }
        };
        initChat();

        const channel = supabase.channel(`chat:${[myId, otherUser.id].sort().join(':')}`);
        
        const subscriptions = {
            insert: channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
                const newMessage = payload.new as Message;
                if (newMessage.sender_id === otherUser.id && newMessage.recipient_id === myId) {
                    setMessages(current => [...current, newMessage]);
                    const updatePayload: TablesUpdate<'messages'> = { is_read: true };
                    await supabase.from('messages').update(updatePayload).eq('id', newMessage.id);
                }
            }),
            update: channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
                const updatedMessage = payload.new as Message;
                // Check if it's a read receipt for a message I sent
                 if (updatedMessage.sender_id === myId && updatedMessage.recipient_id === otherUser.id) {
                     setMessages(current => current.map(m => m.id === updatedMessage.id ? { ...m, is_read: updatedMessage.is_read } : m));
                 }
            }),
        };

        channel.subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [myId, otherUser.id, fetchMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content) return;

        setNewMessage('');

        const tempId = Date.now(); // Temporary ID for optimistic update
        const optimisticMessage: Message = {
            id: tempId,
            content,
            created_at: new Date().toISOString(),
            sender_id: myId,
            recipient_id: otherUser.id,
            is_read: false,
            status: 'sent', // Added from schema
        };
        setMessages(current => [...current, optimisticMessage]);

        const { data, error } = await supabase.from('messages').insert([{
            sender_id: myId,
            recipient_id: otherUser.id,
            content,
            is_read: false,
            status: "sent",
        }]).select().single();
        
        if (data) {
             const realMsg = data as unknown as Message;
             setMessages(current => current.map(m => 
                m.id === tempId 
                ? { ...m, id: realMsg.id, created_at: realMsg.created_at } // Update optimistic msg with real data
                : m
            ));
        }
        if (error) {
            setMessages(current => current.filter(m => m.id !== tempId));
            setNewMessage(content);
            console.error(error);
        }
    };
    
    let lastDate: string | null = null;
    
    return (
         <div className="min-h-screen flex flex-col bg-[#100F1F]">
            <header className="flex items-center p-3 bg-[#1C1B33] shadow-md sticky top-0 z-10 w-full">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                    <img 
                        src={otherUser.photo_url || generateAvatar(otherUser.name)} 
                        alt={otherUser.name} 
                        className="w-full h-full object-cover" 
                    />
                </div>
                <h2 className="ml-3 text-lg font-bold text-white">{otherUser.name}</h2>
            </header>

            <main 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-2"
                style={{ backgroundImage: bgPattern }}
            >
                {loading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                
                {!loading && hasMore && (
                     <div className="text-center">
                        <Button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            variant="secondary"
                            className="w-auto px-4"
                            size="small"
                        >
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
                                <div className="text-center text-xs text-gray-500 my-4 uppercase">
                                    {formatDateSeparator(msg.created_at)}
                                </div>
                            )}
                            <div className={`flex items-end gap-2 group ${isMine ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                               <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${isMine ? 'bg-yellow-400 text-gray-900 rounded-br-none' : 'bg-[#2a2942] text-white rounded-bl-none'}`}>
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                               </div>
                               <div className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0 flex items-center gap-1">
                                    {isMine && <ReadReceiptIcon isRead={msg.is_read} />}
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </div>
                            </div>
                        </React.Fragment>
                    )
                })}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-2 sm:p-4 bg-[#1C1B33] sticky bottom-0">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3 max-w-2xl mx-auto">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={newMessage}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow bg-[#100F1F] border-transparent rounded-2xl text-white placeholder-gray-500 px-4 py-3 resize-none overflow-hidden max-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors" disabled={!newMessage.trim()}>
                        <SendIcon />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatPage;