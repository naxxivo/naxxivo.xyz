import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { generateAvatar } from '../../utils/helpers';
import type { TablesInsert } from '../../integrations/supabase/types';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';

interface QuickPostInputProps {
    session: Session;
    onPostCreated: () => void;
}

const QuickPostInput: React.FC<QuickPostInputProps> = ({ session, onPostCreated }) => {
    const [caption, setCaption] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handlePost = async () => {
        if (!caption.trim() || isPosting) return;

        setIsPosting(true);
        try {
            const newPost: TablesInsert<'posts'> = {
                user_id: session.user.id,
                caption: caption.trim(),
                content_url: null,
            };
            const { error } = await supabase.from('posts').insert([newPost] as any);
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
            <img 
                src={session.user.user_metadata.photo_url || generateAvatar(session.user.id)} 
                alt="My avatar" 
                className="w-10 h-10 rounded-full" 
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
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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