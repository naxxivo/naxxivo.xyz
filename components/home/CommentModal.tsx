

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { generateAvatar } from '../../utils/helpers';
import type { Tables, TablesInsert } from '../../integrations/supabase/types';

type CommentWithProfile = {
    id: number;
    content: string;
    user_id: string;
    created_at: string;
    profiles: {
        name: string | null;
        username: string;
        photo_url: string | null;
    };
};

interface CommentModalProps {
    postId: number;
    session: Session;
    onClose: () => void;
    onCommentAdded: (postId: number) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ postId, session, onClose, onCommentAdded }) => {
    const [comments, setComments] = useState<CommentWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    const fetchComments = useCallback(async () => {
        setLoading(true);
        // Add !inner hint to ensure Supabase returns a single object for the 'profiles' relation.
        // This fixes the type mismatch where the API was returning an array.
        const { data, error } = await supabase
            .from('comments')
            .select(`
                id,
                content,
                user_id,
                created_at,
                profiles!inner (name, username, photo_url)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error("Failed to fetch comments:", error);
        } else {
            setComments((data as CommentWithProfile[]) || []);
        }
        setLoading(false);
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);
    
    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const commentData: TablesInsert<'comments'> = {
                post_id: postId,
                user_id: session.user.id,
                content: newComment.trim(),
            };
            const { error } = await supabase.from('comments').insert([commentData] as any);
            if (error) throw error;
            
            setNewComment('');
            onCommentAdded(postId);
            await fetchComments(); // Refetch to show the new comment
        } catch (error: any) {
            console.error('Failed to post comment:', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-end"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-white w-full max-w-sm max-h-[80vh] rounded-t-2xl shadow-xl flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    <header className="flex-shrink-0 p-4 border-b border-gray-200 text-center relative">
                        <h2 className="text-lg font-bold">Comments</h2>
                        <button onClick={onClose} className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-500 hover:text-gray-800" aria-label="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </header>
                    
                    <main className="flex-grow overflow-y-auto p-4 space-y-4 min-h-0">
                        {loading ? (
                            <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
                        ) : comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment.id} className="flex items-start space-x-3">
                                    <img src={comment.profiles?.photo_url || generateAvatar(comment.profiles?.name || '')} alt={comment.profiles?.name || ''} className="w-8 h-8 rounded-full flex-shrink-0" />
                                    <div className="bg-gray-100 rounded-lg p-3 text-sm">
                                        <p className="font-semibold text-gray-800">{comment.profiles?.name || 'Anonymous'}</p>
                                        <p className="text-gray-700">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 pt-10">No comments yet. Be the first!</p>
                        )}
                        <div ref={commentsEndRef} />
                    </main>

                    <footer className="flex-shrink-0 p-2 border-t border-gray-200">
                        <form onSubmit={handleSubmitComment} className="flex items-center space-x-2">
                             <img src={session.user.user_metadata.photo_url || generateAvatar(session.user.id)} alt="My avatar" className="w-8 h-8 rounded-full" />
                            <input
                                type="text"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-grow bg-gray-100 border-transparent rounded-full text-gray-800 placeholder-gray-500 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                disabled={isSubmitting}
                                autoFocus
                            />
                            <Button type="submit" size="small" className="w-auto px-4" disabled={isSubmitting || !newComment.trim()}>
                                {isSubmitting ? '...' : 'Post'}
                            </Button>
                        </form>
                    </footer>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CommentModal;