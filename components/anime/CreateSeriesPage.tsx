import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { TablesInsert } from '../../integrations/supabase/types';
import Button from '../common/Button';
import Input from '../common/Input';
import { BackArrowIcon } from '../common/AppIcons';

interface CreateSeriesPageProps {
    onBack: () => void;
    onSeriesCreated: () => void;
}

const CreateSeriesPage: React.FC<CreateSeriesPageProps> = ({ onBack, onSeriesCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in.");

            const newSeries: TablesInsert<'anime_series'> = {
                title,
                description,
                thumbnail_url: thumbnailUrl || null,
                banner_url: bannerUrl || null,
                user_id: user.id
            };

            const { error: insertError } = await supabase.from('anime_series').insert([newSeries]);
            if (insertError) throw insertError;

            onSeriesCreated();

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="flex items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-gray-800 mx-auto">Create New Series</h1>
                <div className="w-6"></div> {/* Placeholder */}
            </header>
            
            <main className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
                    <Input id="title" label="Series Title" type="text" value={title} onChange={e => setTitle(e.target.value)} required disabled={loading} />
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="appearance-none block w-full px-4 py-3 bg-gray-100 border-gray-200 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm"
                            disabled={loading}
                        />
                    </div>
                    <Input id="thumbnailUrl" label="Thumbnail URL" type="url" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} disabled={loading} placeholder="https://..." />
                    <Input id="bannerUrl" label="Banner URL" type="url" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} disabled={loading} placeholder="https://..." />

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    <div className="pt-4">
                        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Series'}</Button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreateSeriesPage;