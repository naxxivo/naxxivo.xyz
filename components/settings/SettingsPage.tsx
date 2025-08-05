import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../integrations/supabase/client';
import Button from '../common/Button';
import Input from '../common/Input';
import type { Tables, TablesUpdate, TablesInsert } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Session } from '@supabase/supabase-js';

interface SettingsPageProps {
    session: Session;
    onBack: () => void;
}

type ProfileData = Tables<'profiles'>;
type PremiumFeaturesData = Tables<'premium_features'>;
type ProfileMusic = Tables<'profile_music'>;

const SettingsPage: React.FC<SettingsPageProps> = ({ session, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    
    // Music state
    const [activeMusicUrl, setActiveMusicUrl] = useState('');
    const [musicLibrary, setMusicLibrary] = useState<ProfileMusic[]>([]);
    const [musicFile, setMusicFile] = useState<File | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchSettingsData = async () => {
        setLoading(true);
        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, name, bio, website_url, youtube_url, facebook_url, xp_balance, cover_url, created_at, photo_url, role, username, admin, address')
                .eq('id', session.user.id)
                .single();
            if (profileError) throw profileError;
            
            if (profileData) {
                const typedProfileData = profileData as ProfileData;
                setProfile(typedProfileData);
                setName(typedProfileData.name || '');
                setBio(typedProfileData.bio || '');
                setWebsiteUrl(typedProfileData.website_url || '');
                setYoutubeUrl(typedProfileData.youtube_url || '');
                setFacebookUrl(typedProfileData.facebook_url || '');

                if (typedProfileData.xp_balance >= 10000) {
                    const { data: premiumData } = await supabase
                        .from('premium_features')
                        .select('id, created_at, music_url, profile_id')
                        .eq('profile_id', session.user.id)
                        .single();
                    if (premiumData) {
                        setActiveMusicUrl((premiumData as PremiumFeaturesData).music_url || '');
                    }

                    const { data: libraryData } = await supabase
                        .from('profile_music')
                        .select('id, created_at, file_name, music_url, profile_id')
                        .eq('profile_id', session.user.id)
                        .order('created_at', { ascending: false });
                    if (libraryData) {
                        setMusicLibrary(libraryData as ProfileMusic[]);
                    }
                }
            } else {
                throw new Error("Profile not found");
            }
        } catch (err: any) {
            setError(err.message || "Failed to load settings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettingsData();
    }, [session.user.id]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        try {
            const fileName = `${session.user.id}-${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('premium')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('premium')
                .getPublicUrl(fileName);

            const newMusicTrack: TablesInsert<'profile_music'> = {
                profile_id: session.user.id,
                music_url: publicUrl,
                file_name: file.name,
            };
            
            const { data: insertedTrack, error: insertError } = await supabase
                .from('profile_music')
                .insert([newMusicTrack])
                .select()
                .single();
            
            if (insertError) throw insertError;

            if (insertedTrack) {
                 setMusicLibrary(prev => [insertedTrack as ProfileMusic, ...prev]);
                 // If this is the first song, set it as active
                 if (!activeMusicUrl) {
                    await handleSetActiveMusic(publicUrl);
                 }
            }

        } catch (err: any) {
            setError(err.message || "Failed to upload music.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSetActiveMusic = async (url: string) => {
        setActiveMusicUrl(url); // Optimistic update
        try {
            const payload: TablesInsert<'premium_features'> = { profile_id: session.user.id, music_url: url };
            await supabase
                .from('premium_features')
                .upsert(payload, { onConflict: 'profile_id' });
        } catch (err: any) {
            setError(err.message || "Failed to set active music.");
        }
    };
    
    const handleDeleteMusic = async (trackId: number, trackUrl: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this track? This cannot be undone.");
        if (!confirmed) return;

        // Optimistic UI update
        const originalLibrary = musicLibrary;
        const originalActiveUrl = activeMusicUrl;
        setMusicLibrary(prev => prev.filter(t => t.id !== trackId));
        if (activeMusicUrl === trackUrl) {
            setActiveMusicUrl('');
        }
        
        try {
            // Delete from library table
            await supabase.from('profile_music').delete().eq('id', trackId);
            
            // Delete from storage
            const filePath = trackUrl.split('/').pop();
            if (filePath) {
                await supabase.storage.from('premium').remove([decodeURIComponent(filePath)]);
            }

            // If it was the active track, remove it from premium_features
            if (originalActiveUrl === trackUrl) {
                const payload: TablesInsert<'premium_features'> = { profile_id: session.user.id, music_url: null };
                await supabase
                    .from('premium_features')
                    .upsert(payload, { onConflict: 'profile_id' });
            }
        } catch(err: any) {
            setError(err.message || "Failed to delete track.");
            // Revert on error if needed
            setMusicLibrary(originalLibrary);
            setActiveMusicUrl(originalActiveUrl);
        }
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const profileUpdates: TablesUpdate<'profiles'> = { name, bio, website_url: websiteUrl || null, youtube_url: youtubeUrl || null, facebook_url: facebookUrl || null };
            await supabase.from('profiles').update(profileUpdates).eq('id', session.user.id);
            
            setSuccessMessage("Profile details saved successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
            
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center pt-20">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <div className="relative mb-6">
                <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-center text-3xl font-bold text-white">Settings</h1>
            </div>
            
             <form className="bg-[#1C1B33] rounded-2xl p-6 space-y-6 shadow-lg" onSubmit={handleSaveChanges}>
                <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3">Edit Profile</h2>
                 <Input
                    id="name"
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSaving}
                />
                 <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                    <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="appearance-none block w-full px-4 py-3 bg-[#100F1F] border-transparent rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent sm:text-sm"
                        disabled={isSaving}
                    />
                </div>
                
                <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3 pt-4">Social Links</h2>
                 <Input id="website" label="Website URL" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} disabled={isSaving} />
                 <Input id="youtube" label="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} disabled={isSaving} />
                 <Input id="facebook" label="Facebook URL" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} disabled={isSaving} />

                 <div className="pt-4">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving Profile...' : 'Save Profile Changes'}
                    </Button>
                </div>
            </form>

            {profile && profile.xp_balance >= 10000 && (
                 <div className="bg-[#1C1B33] rounded-2xl p-6 space-y-6 shadow-lg">
                    <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3">Premium Features</h2>
                    <div>
                         <label className="block text-sm font-medium text-gray-400 mb-2">Profile Music</label>
                        <div className="flex items-center space-x-4 p-3 bg-[#100F1F] rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
                            <div className="flex-grow">
                                <p className="text-white text-sm">Upload a new track to your library.</p>
                                {isUploading && <p className="text-xs text-yellow-400">Uploading...</p>}
                            </div>
                            <div className="flex-shrink-0">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="audio/*" disabled={isUploading} />
                                <Button type="button" size="small" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                    Upload Music
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Your Music Library</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                             {musicLibrary.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-4">Your library is empty. Upload some music!</p>
                             ) : (
                                musicLibrary.map(track => (
                                    <div key={track.id} className="flex items-center p-3 bg-[#100F1F] rounded-lg">
                                        <p className="flex-grow text-white truncate text-sm">{track.file_name || decodeURIComponent(track.music_url.split('/').pop() || '')}</p>
                                        <div className="flex-shrink-0 flex items-center space-x-2">
                                            {activeMusicUrl === track.music_url ? (
                                                <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">ACTIVE</span>
                                            ) : (
                                                <Button type="button" size="small" variant="secondary" onClick={() => handleSetActiveMusic(track.music_url)}>Set as Active</Button>
                                            )}
                                            <Button type="button" size="small" variant="secondary" className="!border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white" onClick={() => handleDeleteMusic(track.id, track.music_url)}>Delete</Button>
                                        </div>
                                    </div>
                                ))
                             )}
                        </div>
                    </div>
                </div>
            )}
            
            {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
            {successMessage && <p className="text-green-400 text-sm mt-4 text-center">{successMessage}</p>}
        </div>
    );
};

export default SettingsPage;