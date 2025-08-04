
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/locales/en/pages/services/supabase.ts';
import { useAuth } from '@/App.tsx';
import { Message, Profile, Database, MessageWithProfile, MessageInsert } from '@/types.ts';
import { AnimeLoader } from '@/components/ui/Loader.tsx';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface ChatWindowProps {
  otherUserId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ otherUserId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  const defaultAvatar = (seed: string | null) => `https://api.dicebear.com/8.x/pixel-art/svg?seed=${seed || 'default'}`;

  useEffect(() => {
    const fetchMessagesAndParticipant = async () => {
      if (!user) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`id, sender_id, recipient_id, content, is_read, status, created_at, sender:profiles!sender_id(name, username, photo_url)`)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error.message);
      } else if (data) {
        setMessages(data as unknown as MessageWithProfile[]);
      }
      
      const { data: otherUserData, error: pError } = await supabase.from('profiles').select('id, username, name, bio, photo_url, cover_url, website_url, youtube_url, facebook_url, address, role, created_at').eq('id', otherUserId).single();
      if (pError) {
        console.error("Error fetching other user:", pError.message);
      } else {
        setOtherUser(otherUserData as unknown as Profile);
      }
      
      setLoading(false);
    };
    fetchMessagesAndParticipant();
  }, [otherUserId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if(!user) return;
    const channel = supabase.channel(`direct-chat:${[user.id, otherUserId].sort().join('-')}`).on<Message>('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}`},
      async (payload) => {
        const {data: senderProfile} = await supabase.from('profiles').select('name, username, photo_url').eq('id', payload.new.sender_id).single();
        if (senderProfile) {
            const newMessage: MessageWithProfile = {
                ...(payload.new),
                sender: senderProfile as unknown as Pick<Profile, 'name' | 'photo_url' | 'username'>,
            };
            setMessages((prev) => [...prev, newMessage]);
        }
      }
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [otherUserId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;
    const content = newMessage.trim();
    setNewMessage('');
    
    const payload: MessageInsert = { sender_id: user.id, recipient_id: otherUserId, content: content };
    const { data: insertedMessage, error } = await supabase.from('messages').insert(payload).select('*, sender:profiles!sender_id(name, username, photo_url)').single();

    if (error) {
      console.error('Error sending message:', error);
      setNewMessage(content);
    } else if (insertedMessage) {
      setMessages(prev => [...prev, insertedMessage as unknown as MessageWithProfile]);
    }
  };

  if (loading) return <div className="flex-grow flex items-center justify-center"><AnimeLoader /></div>;

  return (
    <div className="flex flex-col h-full">
      {otherUser && (
         <div className="p-4 border-b border-primary-yellow/20 dark:border-primary-yellow/10 flex items-center space-x-3 bg-white/50 dark:bg-dark-bg/50">
            <img src={otherUser.photo_url || defaultAvatar(otherUser.username)} alt={otherUser.name || 'User'} className="w-12 h-12 rounded-full object-cover border-2 border-primary-blue" />
            <div>
              <h2 className="font-bold text-lg">{otherUser.name || otherUser.username}</h2>
              <p className="text-xs text-secondary-purple/70 dark:text-dark-text/70">@{otherUser.username}</p>
            </div>
         </div>
      )}
      <div className="flex-grow p-4 overflow-y-auto bg-primary-yellow/5 dark:bg-dark-bg/20 space-y-4">
        {messages.map((msg) => {
          const isSender = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex items-end gap-3 ${isSender ? 'justify-end' : 'justify-start'}`}>
              {!isSender && (<img src={msg.sender?.photo_url || defaultAvatar(msg.sender?.username || 'p')} alt="avatar" className="w-8 h-8 rounded-full object-cover" />)}
              <div className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow ${isSender ? 'bg-accent text-white rounded-br-none' : 'bg-white dark:bg-dark-card text-secondary-purple dark:text-dark-text rounded-bl-none'}`}>
                <p>{msg.content || ''}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-primary-yellow/20 dark:border-primary-yellow/10 bg-white dark:bg-dark-card">
        <div className="flex items-center space-x-3">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-grow px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-full focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner"/>
          <button type="submit" className="bg-accent hover:bg-secondary-coral text-white rounded-full p-3 transition-colors shadow-lg hover:shadow-accent/50 disabled:bg-gray-400 disabled:shadow-none" disabled={!newMessage.trim()}>
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;