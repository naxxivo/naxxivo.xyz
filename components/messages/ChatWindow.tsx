
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../App';
import { Message, Profile, Database } from '../../types';
import { AnimeLoader } from '../ui/Loader';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface ChatWindowProps {
  otherUserId: string;
}

type MessageWithProfile = Message & {
    profiles: Pick<Profile, 'name' | 'photo_url' | 'username'> | null;
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
      const { data, error } = await supabase.from('messages').select(`*, sender:profiles!messages_sender_id_fkey(*)`).or(`(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`).order('created_at', { ascending: true });
      if (error) console.error('Error fetching messages:', error);
      else if (data) setMessages((data as any[]).map(msg => ({ ...msg, profiles: msg.sender as Profile | null })));
      const { data: otherUserData, error: pError } = await supabase.from('profiles').select('*').eq('id', otherUserId).single();
      if(pError) console.error("Error fetching other user", pError);
      else setOtherUser(otherUserData);
      setLoading(false);
    };
    fetchMessagesAndParticipant();
  }, [otherUserId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if(!user) return;
    const channel = supabase.channel(`direct-chat:${[user.id, otherUserId].sort().join('-')}`).on<Database['public']['Tables']['messages']['Row']>('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}`},
      async (payload) => {
        const {data: profileData} = await supabase.from('profiles').select('*').eq('id', payload.new.sender_id).single();
        if(profileData) setMessages((prev) => [...prev, { ...(payload.new as any), profiles: profileData }]);
      }
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [otherUserId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;
    const content = newMessage.trim();
    setNewMessage('');
    const { data: insertedMessage, error } = await supabase.from('messages').insert([{ sender_id: user.id, recipient_id: otherUserId, content: content }] as any).select('*, sender:profiles!messages_sender_id_fkey(*)').single();
    if (error) {
      console.error('Error sending message:', error);
      setNewMessage(content);
    } else if (insertedMessage) {
      setMessages(prev => [...prev, { ...(insertedMessage as any), profiles: insertedMessage.sender as Profile | null }]);
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
              {!isSender && (<img src={msg.profiles?.photo_url || defaultAvatar(msg.profiles?.username || 'p')} alt="avatar" className="w-8 h-8 rounded-full object-cover" />)}
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
