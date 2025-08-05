import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import Button from '../common/Button';
import Input from '../common/Input';
import type { Tables, TablesUpdate } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';

interface SettingsPageProps {
    session: Session;
    onBack: () => void;
}

type ProfileData = Tables<'profiles'>;
type PremiumFeaturesData = Tables<'premium_features'>;

const SettingsPage: React.FC<SettingsPageProps> = ({ session, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [musicUrl, setMusicUrl] = useState('');
    const [musicFile, setMusicFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                if (profileError) throw profileError;
                
                if (profileData) {
                    const typedProfile = profileData as ProfileData;
                    setProfile(typedProfile);
                    setName(typedProfile.name || '');
                    setBio(typedProfile.bio || '');
                    setWebsiteUrl(typedProfile.website_url || '');
                    setYoutubeUrl(typedProfile.youtube_url || '');
                    setFacebookUrl(typedProfile.facebook_url || '');

                    if (typedProfile.xp_balance >= 10000) {
                        const { data: premiumData, error: premiumError } = await supabase
                            .from('premium_features')
                            .select('music_url')
                            .eq('profile_id', session.user.id)
                            .single();
                        if(premiumError && premiumError.code !== 'PGRST116') { // Ignore no rows found
                            console.warn("Could not load premium features", premiumError);
                        }
                        if (premiumData) {
                            const typedPremiumData = premiumData as PremiumFeaturesData;
                            setMusicUrl(typedPremiumData.music_url || '');
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

        fetchData();
    }, [session.user.id]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setMusicFile(file);
        }
    };
    
    const handleRemoveMusic = () => {
        setMusicFile(null);
        setMusicUrl('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        let finalMusicUrl = musicUrl;

        try {
            // 1. Handle music file upload if a new one is selected
            if (musicFile) {
                setIsUploading(true);
                const fileName = `${session.user.id}-${Date.now()}-${musicFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('premium')
                    .upload(fileName, musicFile, {
                        cacheControl: '3600',
                        upsert: true,
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('premium')
                    .getPublicUrl(fileName);
                
                finalMusicUrl = publicUrl;
                setMusicFile(null);
                setIsUploading(false);
            }

            // 2. Update profile details
            const profileUpdates: TablesUpdate<'profiles'> = { name, bio, website_url: websiteUrl, youtube_url: youtubeUrl, facebook_url: facebookUrl };
            await supabase.from('profiles').update(profileUpdates as any).eq('id', session.user.id);


            // 3. Update premium features, including the final music URL
            if (profile && profile.xp_balance >= 10000) {
                const premiumFeaturesUpdate = {
                    profile_id: session.user.id,
                    music_url: finalMusicUrl,
                };
                await supabase.from('premium_features').upsert(premiumFeaturesUpdate as any);

                setMusicUrl(finalMusicUrl); // Update local state to reflect change
            }

            setSuccessMessage("Profile updated successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
            
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            setIsUploading(false);
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-center text-3xl font-bold text-white">Settings</h1>
            </div>
            
             <form className="bg-[#1C1B33] rounded-2xl p-6 space-y-6 shadow-lg" onSubmit={handleSubmit}>
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

                {profile && profile.xp_balance >= 10000 && (
                     <>
                        <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3 pt-4">Premium Features</h2>
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-2">Profile Music</label>
                            <div className="flex items-center space-x-4 p-3 bg-[#100F1F] rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
                                <div className="flex-grow overflow-hidden">
                                    <p className="text-white truncate text-sm">
                                        {musicFile ? musicFile.name : (musicUrl ? decodeURIComponent(musicUrl.split('/').pop() || '') : 'No music selected')}
                                    </p>
                                    {isUploading && <p className="text-xs text-yellow-400">Uploading...</p>}
                                </div>
                                <div className="flex-shrink-0 flex items-center space-x-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="audio/*"
                                        disabled={isSaving || isUploading}
                                    />
                                    <Button type="button" size="small" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isSaving || isUploading}>
                                        {musicUrl || musicFile ? 'Change' : 'Upload'}
                                    </Button>
                                    {(musicUrl || musicFile) && (
                                        <Button type="button" size="small" variant="secondary" onClick={handleRemoveMusic} disabled={isSaving || isUploading}>
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
                
                {error && <p className="text-red-400 text-sm">{error}</p>}
                {successMessage && <p className="text-green-400 text-sm">{successMessage}</p>}

                 <div className="pt-4">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? (isUploading ? 'Uploading Music...' : 'Saving...') : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
