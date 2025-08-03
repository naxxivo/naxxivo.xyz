



import React, { useState, useEffect } from 'react';
import { supabase } from '@/locales/en/pages/services/supabase.ts';
import { Post } from '@/types.ts';
import { AnimeLoader } from '@/components/ui/Loader.tsx';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/solid';

const AdminPostsPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            let query = supabase.from('posts').select(`id, user_id, caption, content_url, created_at, profiles(name, username, photo_url)`);

            if (searchTerm) {
                query = query.ilike('caption', `%${searchTerm}%`);
            }
            
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;
            if (error) {
                setError('Failed to fetch posts.');
                console.error(error);
            } else {
                setPosts(data as any[] || []);
            }
            setLoading(false);
        };
        
        const debounceTimer = setTimeout(() => fetchPosts(), 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleDeletePost = async (postId: number) => {
        if (window.confirm(`Are you sure you want to delete this post? This action cannot be undone.`)) {
            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (error) {
                alert(`Failed to delete post: ${error.message}`);
            } else {
                alert('Post deleted successfully.');
                setPosts(posts.filter(p => p.id !== postId));
            }
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-display font-bold mb-8">Post Management</h1>
            <div className="mb-6 bg-white dark:bg-dark-card p-4 rounded-xl shadow-md">
                 <div className="relative flex-grow w-full">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by caption content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-bg/50 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none"
                    />
                </div>
            </div>

            {loading ? <AnimeLoader /> : error ? <p className="text-red-500">{error}</p> : (
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-dark-bg/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Content</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {posts.map(post => (
                                <tr key={post.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {post.content_url && <img src={post.content_url} className="w-16 h-16 object-cover rounded-md" />}
                                            <p className="text-sm text-gray-900 dark:text-white max-w-sm truncate">{post.caption || "No caption"}</p>
                                        </div>
                                    </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/profile/${post.user_id}`} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
                                            {post.profiles?.name || post.profiles?.username}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(post.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeletePost(post.id)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {posts.length === 0 && <p className="text-center py-10">No posts found.</p>}
                </div>
            )}
        </div>
    );
};

export default AdminPostsPage;