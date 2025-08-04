import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import Button from '../common/Button';
import type { TablesInsert } from '../../integrations/supabase/types';

interface CreatePostProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ isOpen, onClose, onPostCreated }) => {
    const [caption, setCaption] = useState('');
    const [contentUrl, setContentUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to post.");
            
            const newPost: TablesInsert<'posts'> = {
                caption,
                content_url: contentUrl || null,
                user_id: user.id
            };

            const { error: insertError } = await supabase
                .from('posts')
                .insert(newPost as any);
            
            if (insertError) throw insertError;

            // Reset form and close modal
            setCaption('');
            setContentUrl('');
            onPostCreated();

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[#1C1B33] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Close">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold text-white mb-6">Create a New Post</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="caption" className="block text-sm font-medium text-gray-400 mb-2">Caption</label>
                        <textarea
                            id="caption"
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="What's on your mind?"
                            rows={4}
                            className="appearance-none block w-full px-4 py-3 bg-[#100F1F] border-transparent rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent sm:text-sm"
                            disabled={loading}
                        />
                    </div>
                     <div>
                        <label htmlFor="contentUrl" className="block text-sm font-medium text-gray-400 mb-2">Image or YouTube URL</label>
                        <input
                            id="contentUrl"
                            type="url"
                            value={contentUrl}
                            onChange={e => setContentUrl(e.target.value)}
                            placeholder="https://... (e.g., my-image.png or youtube.com/...)"
                            className="appearance-none block w-full px-4 py-3 bg-[#100F1F] border-transparent rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent sm:text-sm"
                            disabled={loading}
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}

                    <div className="pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Posting...' : 'Post'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
