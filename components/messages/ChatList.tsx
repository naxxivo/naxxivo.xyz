
import React from 'react';
import { ChatPartner } from '@/types';

interface ChatListProps {
  chatPartners: ChatPartner[];
  onSelectChat: (id: string) => void;
  activeChatUserId?: string;
}

const ChatList: React.FC<ChatListProps> = ({
  chatPartners,
  onSelectChat,
  activeChatUserId,
}) => {
  const defaultAvatar = (seed: string | null) => `https://api.dicebear.com/8.x/pixel-art/svg?seed=${seed || 'default'}`;

  return (
    <div className="overflow-y-auto flex-grow">
      {chatPartners.length === 0 && (
        <p className="p-4 text-center text-black/70">No chats yet. Find a user to message!</p>
      )}
      <ul>
        {chatPartners.map((partner) => {
          const isActive = partner.id === activeChatUserId;

          return (
            <li
              key={partner.id}
              onClick={() => onSelectChat(partner.id)}
              className={`p-4 flex items-center space-x-3 cursor-pointer transition-colors duration-200 ${isActive ? 'bg-primary-pink/20' : 'hover:bg-primary-yellow/20'}`}
            >
              <img
                src={partner.photo_url || defaultAvatar(partner.username)}
                alt={partner.name || partner.username}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary-pink"
              />
              <div className="flex-grow overflow-hidden">
                <p className="font-bold text-black">{partner.name || partner.username}</p>
                <p className="text-sm text-black/80 truncate">
                  {partner.last_message || 'No messages yet...'}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatList;