import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { pb, getAvatarUrl, getCoverUrl } from '../services/pocketbase';
import { Spinner } from '../components/Spinner';
import type { User } from '../types';

export const EditProfilePage: React.FC = () => {
  const { user: authUser, refreshAuthUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [contect, setContect] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (authUser) {
      setName(authUser.name || '');
      setBio(authUser.bio || '');
      setContect(authUser.contect || '');
      setFacebook(authUser.facebook || '');
      setYoutube(authUser.youtube || '');
      setAvatarPreview(getAvatarUrl(authUser));
      setCoverPreview(getCoverUrl(authUser as User));
    } else {
        // Redirect if not logged in
        navigate('/login');
    }
  }, [authUser, navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      formData.append('contect', contect);
      formData.append('facebook', facebook);
      formData.append('youtube', youtube);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      if (coverFile) {
        formData.append('cover', coverFile);
      }
      
      await pb.collection('users').update(authUser.id, formData, { requestKey: null });
      await refreshAuthUser();

      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate(`/profile/${authUser.id}`), 1500);

    } catch (err: any) {
      console.error("Profile update failed:", err);
      
      let errorMessage = 'Failed to update profile.';
      if (err?.data?.data) {
        const fieldErrors = Object.entries(err.data.data)
          .map(([field, error]: [string, any]) => `${field.charAt(0).toUpperCase() + field.slice(1)}: ${error.message}`)
          .join(' ');
        errorMessage = `Please correct the following errors: ${fieldErrors}`;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!authUser) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Spinner size="lg" />
        </div>
    );
  }

  return (
      <main className="max-w-3xl mx-auto">
        <div className="bg-surface rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Edit Your Profile</h1>

          {error && <div className="bg-danger/20 text-danger p-3 rounded-md text-sm mb-4">{error}</div>}
          {success && <div className="bg-success/20 text-success p-3 rounded-md text-sm mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
             <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Cover Photo</label>
                <div className="aspect-[3/1] w-full bg-background rounded-lg overflow-hidden mb-2">
                    <img src={coverPreview || ''} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
                <label htmlFor="cover-upload" className="cursor-pointer px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover text-sm font-medium">
                  Upload New Cover
                </label>
                <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
             </div>


            <div className="flex items-center space-x-6">
              <img src={avatarPreview || ''} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover bg-background" />
              <div>
                 <label className="block text-sm font-medium text-text-secondary mb-2">Avatar</label>
                <label htmlFor="avatar-upload" className="cursor-pointer px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover text-sm font-medium">
                  Upload New Avatar
                </label>
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <p className="text-xs text-text-secondary mt-2">PNG, JPG, GIF up to 5MB.</p>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
              <textarea id="bio" rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary"></textarea>
            </div>

            <fieldset className="border-t border-border pt-6">
              <legend className="text-lg font-semibold text-text-primary mb-2">Contact & Social Links</legend>
              <div className="space-y-4">
                <div>
                    <label htmlFor="contect" className="block text-sm font-medium text-text-secondary mb-1">Contact Email</label>
                    <input id="contect" type="email" value={contect} onChange={e => setContect(e.target.value)} placeholder="public-contact@example.com" className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
                 <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-text-secondary mb-1">Facebook URL</label>
                    <input id="facebook" type="url" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="https://facebook.com/yourprofile" className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
                 <div>
                    <label htmlFor="youtube" className="block text-sm font-medium text-text-secondary mb-1">YouTube URL</label>
                    <input id="youtube" type="url" value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="https://youtube.com/yourchannel" className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
              </div>
            </fieldset>

            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={() => navigate('/profile')} className="px-6 py-2 border border-border rounded-md text-text-secondary hover:bg-border">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-opacity-50 flex items-center">
                    {loading ? <><Spinner size="sm" /> <span className="ml-2">Saving...</span></> : 'Save Changes'}
                </button>
            </div>
          </form>
        </div>
      </main>
  );
};