


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/locales/en/pages/services/supabase.ts';
import { useAuth } from '@/App.tsx';
import PageTransition from '@/components/ui/PageTransition.tsx';
import ChatList from '@/components/messages/ChatList.tsx';
import ChatWindow from '@/components/messages/ChatWindow.tsx';
import { ChatPartner, Profile } from '@/types.ts';
import { AnimeLoader } from '@/components/ui/Loader.tsx';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { otherUserId } = useParams<{ otherUserId?: string }>();
  const navigate = useNavigate();
  
  const [chatPartners, setChatPartners] = useState<ChatPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientSide = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      const profileColumns = 'id, username, created_at, role, name, bio, photo_url, cover_url, address, website_url, youtube_url, facebook_url';
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id, sender_id, recipient_id, content, is_read, status, created_at,
          sender:profiles!sender_id(${profileColumns}),
          recipient:profiles!recipient_id(${profileColumns})
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load your conversations.');
        console.error(error);
      } else if (messages) {
        const partnersMap = new Map<string, ChatPartner>();
        for (const msg of (messages as any[])) {
            const partnerProfile = msg.sender_id === user.id ? msg.recipient : msg.sender;
            if (partnerProfile && !partnersMap.has(partnerProfile.id)) {
                partnersMap.set(partnerProfile.id, {
                    ...(partnerProfile as Profile),
                    last_message: msg.content,
                    last_message_at: msg.created_at,
                });
            }
        }
        const sortedPartners = Array.from(partnersMap.values()).sort((a,b) => 
            new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
        );
        setChatPartners(sortedPartners);
      } else {
        setChatPartners([]);
      }
      setLoading(false);
    }
    fetchClientSide();
  }, [user]);

  const handleSelectChat = (id: string) => {
    navigate(`/messages/${id}`);
  };

  return (
    <PageTransition>
      <div className="flex h-[calc(100vh-120px)] bg-white/60 dark:bg-dark-card/70 backdrop-blur-lg rounded-2xl shadow-2xl shadow-primary-blue/20 overflow-hidden">
        <div className={`w-full md:w-1/3 border-r border-primary-yellow/20 dark:border-primary-yellow/10 flex flex-col transition-all duration-300 ${otherUserId && 'hidden md:flex'}`}>
          <div className="p-4 border-b border-primary-yellow/20 dark:border-primary-yellow/10">
            <h1 className="font-display text-2xl">Chats</h1>
          </div>
          {loading ? (
            <div className="flex-grow flex items-center justify-center">
              <AnimeLoader />
            </div>
          ) : error ? (
             <p className="p-4 text-red-500">{error}</p>
          ) : (
            <ChatList
              chatPartners={chatPartners}
              onSelectChat={handleSelectChat}
              activeChatUserId={otherUserId}
            />
          )}
        </div>
        <div className={`w-full md:w-2/3 flex flex-col transition-all duration-300 ${!otherUserId && 'hidden md:flex'}`}>
          {otherUserId ? (
            <ChatWindow key={otherUserId} otherUserId={otherUserId} />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
               <ChatBubbleLeftRightIcon className="h-24 w-24 mb-4 text-primary-blue/30 dark:text-primary-blue/50"/>
              <h2 className="font-display text-2xl">Select a conversation</h2>
              <p>Choose one of your chats from the list to see the messages.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default MessagesPage;