import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../../integrations/supabase/client';
import Button from '../common/Button';
import Input from '../common/Input';
import type { Tables, TablesUpdate } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import { BackArrowIcon } from '../common/AppIcons';
import { generateAvatar } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

interface EditProfilePageProps {
    session: Session;
    onBack: () => void;
    onProfileUpdated: () => void;
}

type ProfileData = Pick<Tables<'profiles'>, 'name' | 'username' | 'bio' | 'photo_url' | 'cover_url'>;

const EditProfilePage: React.FC<EditProfilePageProps> = ({ session, onBack, onProfileUpdated }) => {
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    
    const [modalFor, setModalFor] = useState<'avatar' | 'cover' | null>(null);
    const [tempUrl, setTempUrl] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('name, username, bio, photo_url, cover_url, website_url, youtube_url, facebook_url')
                    .eq('id', session.user.id)
                    .maybeSingle();
                if (error) throw error;
                
                if (data) {
                    setName(data.name || '');
                    setUsername(data.username || '');
                    setBio(data.bio || '');
                    setPhotoUrl(data.photo_url || '');
                    setCoverUrl(data.cover_url || '');
                    setWebsiteUrl(data.website_url || '');
                    setYoutubeUrl(data.youtube_url || '');
                    setFacebookUrl(data.facebook_url || '');
                } else {
                    throw new Error("Profile not found");
                }
            } catch (err: any) {
                setError(err.message || "Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [session.user.id]);
    
    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    }

    const openUrlModal = (type: 'avatar' | 'cover') => {
        setModalFor(type);
        setTempUrl(type === 'avatar' ? photoUrl : coverUrl);
    };

    const handleUrlSubmit = () => {
        if (modalFor === 'avatar') {
            setPhotoUrl(tempUrl);
        } else {
            setCoverUrl(tempUrl);
        }
        setModalFor(null);
        setTempUrl('');
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        
        if (!name.trim() || !username.trim()) {
            setError("Name and username cannot be empty.");
            return;
        }

        setIsSaving(true);
        try {
            const updates: TablesUpdate<'profiles'> = {
                name,
                username,
                bio,
                photo_url: photoUrl,
                cover_url: coverUrl,
                website_url: websiteUrl,
                youtube_url: youtubeUrl,
                facebook_url: facebookUrl,
            };

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', session.user.id);

            if (updateError) throw updateError;
            
            showSuccess("Profile saved successfully!");
            onProfileUpdated();
            
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) {
        return <div className="flex items-center justify-center pt-20"><LoadingSpinner /></div>;
    }

    return (
        <div className="pb-6">
             <header className="flex items-center p-4">
                <button onClick={onBack} className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-[var(--theme-text)] mx-auto">Edit Profile</h1>
                <div className="w-6"></div> {/* Placeholder */}
             </header>
            
             <div>
                <div className="relative h-36 bg-gray-200 dark:bg-gray-700">
                    {coverUrl ? <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-[var(--theme-secondary)] to-[var(--theme-primary)]"></div>}
                    <Button size="small" variant="secondary" onClick={() => openUrlModal('cover')} className="absolute bottom-2 right-2 w-auto px-3 py-1 text-xs bg-black/30 text-white border-white/50 hover:bg-black/50">Change Cover</Button>
                </div>

                <div className="relative">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            <img src={photoUrl || generateAvatar(username)} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-[var(--theme-bg)] shadow-lg" />
                        </div>
                    </div>
                    <div className="pt-14 px-4 text-center">
                        <Button variant="secondary" size="small" onClick={() => openUrlModal('avatar')} className="w-auto px-4">Change Photo</Button>
                    </div>
                </div>
             </div>

             <form className="space-y-6 px-4 mt-6" onSubmit={handleSaveChanges}>
                 <Input id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} required />
                 <Input id="username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSaving} required />
                 <div>
                    <label htmlFor="bio" className="absolute text-sm text-[var(--theme-text-secondary)] -z-10">Bio</label>
                    <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="appearance-none block w-full px-4 py-3 bg-[var(--theme-card-bg-alt)] border border-transparent rounded-lg text-[var(--theme-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)] sm:text-sm"
                        disabled={isSaving}
                    />
                </div>
                
                <div className="pt-4 border-t border-[var(--theme-input-border)]">
                    <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4">Social Links</h3>
                    <div className="space-y-6">
                        <Input id="websiteUrl" label="Website URL" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} disabled={isSaving} />
                        <Input id="youtubeUrl" label="YouTube URL" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} disabled={isSaving} />
                        <Input id="facebookUrl" label="Facebook URL" value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} disabled={isSaving} />
                    </div>
                </div>
                
                 <div className="pt-4">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
            
            {error && <p className="text-red-500 text-sm mt-4 text-center px-4">{error}</p>}
            {successMessage && <p className="text-green-600 text-sm mt-4 text-center px-4">{successMessage}</p>}

            <AnimatePresence>
                {modalFor && (
                    <motion.div
                        {...{
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                        } as any}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                        onClick={() => setModalFor(null)}
                    >
                        <motion.div
                            {...{
                                initial: { scale: 0.9, opacity: 0 },
                                animate: { scale: 1, opacity: 1 },
                                exit: { scale: 0.9, opacity: 0 },
                                transition: { type: 'spring', stiffness: 300, damping: 30 },
                            } as any}
                            className="bg-[var(--theme-card-bg)] rounded-2xl p-6 w-full max-w-sm"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-lg font-bold text-[var(--theme-text)]">Set Image URL</h2>
                            <p className="text-sm text-[var(--theme-text-secondary)] mb-4">
                                Enter the URL for your new {modalFor === 'avatar' ? 'profile picture' : 'cover photo'}.
                            </p>
                            <Input
                                id="imageUrl"
                                label="Image URL"
                                value={tempUrl}
                                onChange={e => setTempUrl(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="secondary" size="small" className="w-auto px-4" onClick={() => setModalFor(null)}>Cancel</Button>
                                <Button size="small" className="w-auto px-4" onClick={handleUrlSubmit}>Set Image</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EditProfilePage;