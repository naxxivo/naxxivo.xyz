import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../../integrations/supabase/client';
import type { TablesInsert, Json } from '../../integrations/supabase/types';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

interface QuickPostInputProps {
    session: Session;
    onPostCreated: () => void;
}

type CurrentUserProfile = {
    photo_url: string | null;
    username: string;
    active_cover: { preview_url: string | null; asset_details: Json } | null;
};


const QuickPostInput: React.FC<QuickPostInputProps> = ({ session, onPostCreated }) => {
    const [caption, setCaption] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [profile, setProfile] = useState<CurrentUserProfile | null>(null);

    useEffect(() => {
        const fetchMyProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('username, photo_url, active_cover:active_cover_id(preview_url, asset_details)')
                .eq('id', session.user.id)
                .single();
            if (data) {
                setProfile(data as any);
            }
        };
        fetchMyProfile();
    }, [session.user.id]);

    const handlePost = async () => {
        if (!caption.trim() || isPosting) return;

        setIsPosting(true);
        try {
            const newPost: TablesInsert<'posts'> = {
                user_id: session.user.id,
                caption: caption.trim(),
                content_url: null,
            };
            const { error } = await supabase.from('posts').insert(newPost as any);
            if (error) throw error;
            setCaption('');
            onPostCreated();
        } catch (error: any) {
            console.error("Failed to create post:", error);
            // Optionally: show an error to the user via a toast or alert
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="flex items-center space-x-3 bg-[var(--theme-card-bg)] p-2 rounded-2xl shadow-sm">
            <Avatar 
                photoUrl={profile?.photo_url} 
                name={profile?.username}
                activeCover={profile?.active_cover}
                size="sm"
            />
            <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePost(); }}
                placeholder="Share your memories..."
                className="flex-grow bg-[var(--theme-bg)] border-transparent rounded-full text-[var(--theme-text)] placeholder-gray-500 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)]"
                disabled={isPosting}
            />
            <AnimatePresence>
            {caption.trim() && (
                 <motion.div 
                    {...{
                        initial: { opacity: 0, width: 0 },
                        animate: { opacity: 1, width: 'auto' },
                        exit: { opacity: 0, width: 0 },
                        transition: { type: 'spring', stiffness: 500, damping: 30 },
                    } as any}
                    className="overflow-hidden"
                >
                     <Button
                        size="small"
                        className="w-auto px-4 ml-2"
                        onClick={handlePost}
                        disabled={isPosting}
                     >
                        {isPosting ? '...' : 'Post'}
                     </Button>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default QuickPostInput;