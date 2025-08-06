

import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import Button from '../common/Button';
import Input from '../common/Input';
import type { Tables, TablesUpdate } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import { BackArrowIcon } from '../common/AppIcons';
import { generateAvatar } from '../../utils/helpers';

interface EditProfilePageProps {
    session: Session;
    onBack: () => void;
    onProfileUpdated: () => void;
}

type ProfileData = Tables<'profiles'>;

const EditProfilePage: React.FC<EditProfilePageProps> = ({ session, onBack, onProfileUpdated }) => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    
    const [isUploading, setIsUploading] = useState<'avatar' | 'cover' | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('name, username, bio, photo_url, cover_url')
                    .eq('id', session.user.id)
                    .single();
                if (error) throw error;
                
                if (data) {
                    setProfile(data as ProfileData);
                    setName(data.name || '');
                    setUsername(data.username || '');
                    setBio(data.bio || '');
                    setPhotoUrl(data.photo_url || '');
                    setCoverUrl(data.cover_url || '');
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
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(type);
        setError(null);
        try {
            const bucket = type === 'avatar' ? 'avatars' : 'covers';
            const fileName = `${session.user.id}-${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);
            
            const updatePayload: TablesUpdate<'profiles'> = type === 'avatar'
                ? { photo_url: publicUrl }
                : { cover_url: publicUrl };
            
            await supabase.from('profiles').update(updatePayload).eq('id', session.user.id);
            
            if (type === 'avatar') setPhotoUrl(publicUrl);
            if (type === 'cover') setCoverUrl(publicUrl);
            
            showSuccess(`${type === 'avatar' ? 'Profile picture' : 'Cover photo'} updated!`);

        } catch (err: any) {
            setError(err.message || "Failed to upload photo.");
        } finally {
            setIsUploading(null);
        }
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
            const profileUpdates: TablesUpdate<'profiles'> = { name, username, bio };
            const { error: updateError } = await supabase
                .from('profiles')
                .update(profileUpdates)
                .eq('id', session.user.id);

            if (updateError) throw updateError;
            
            showSuccess("Profile details saved successfully!");
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
        <div className="space-y-6">
             <header className="flex items-center p-4">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-gray-800 mx-auto">Edit Profile</h1>
             </header>
            
             <div className="px-4">
                 <div className="relative h-32 rounded-lg overflow-hidden bg-gray-200">
                    {coverUrl ? <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-violet-200 to-purple-300"></div>}
                    {isUploading === 'cover' && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"><LoadingSpinner/></div>}
                    <Button size="small" variant="secondary" onClick={() => coverInputRef.current?.click()} disabled={isUploading === 'cover'} className="absolute bottom-2 right-2 w-auto px-3 py-1 text-xs">Change Cover</Button>
                 </div>
                 <div className="flex flex-col items-center -mt-12">
                    <div className="relative">
                        <img src={photoUrl || generateAvatar(name || username)} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                        {isUploading === 'avatar' && <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"><LoadingSpinner/></div>}
                    </div>
                     <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" accept="image/*" disabled={isUploading === 'avatar'} />
                     <input type="file" ref={coverInputRef} onChange={(e) => handleFileChange(e, 'cover')} className="hidden" accept="image/*" disabled={isUploading === 'cover'} />
                    <Button variant="secondary" size="small" onClick={() => avatarInputRef.current?.click()} disabled={isUploading === 'avatar'} className="mt-2 w-auto px-4">Change Photo</Button>
                 </div>
             </div>

             <form className="space-y-6 px-4" onSubmit={handleSaveChanges}>
                 <Input id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} required />
                 <Input id="username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSaving} required />
                 <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="appearance-none block w-full px-4 py-3 bg-gray-100 border-gray-200 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm transition-all duration-300"
                        disabled={isSaving}
                    />
                </div>
                
                 <div className="pt-4">
                    <Button type="submit" disabled={isSaving || isUploading !== null}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
            
            {error && <p className="text-red-500 text-sm mt-4 text-center px-4">{error}</p>}
            {successMessage && <p className="text-green-600 text-sm mt-4 text-center px-4">{successMessage}</p>}
        </div>
    );
};

export default EditProfilePage;