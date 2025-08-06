import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { Tables, TablesInsert } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { BackArrowIcon, PlayIcon, PauseIcon, UploadIcon } from '../common/AppIcons';
import { generateAvatar } from '../../utils/helpers';

interface MusicLibraryPageProps {
    session: Session;
    onBack: () => void;
}

type MusicTrack = Tables<'profile_music'> & {
    profiles: Pick<Tables<'profiles'>, 'name' | 'username' | 'photo_url'> | null;
};

const MusicLibraryPage: React.FC<MusicLibraryPageProps> = ({ session, onBack }) => {
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [isUploading, setIsUploading] = useState(false);

    const myId = session.user.id;

    const fetchTracks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Correctly fetch all music from all users by not filtering by profile_id
            const { data, error } = await supabase
                .from('profile_music')
                .select(`*, profiles (name, username, photo_url)`)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setTracks(data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load music.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTracks();
        return () => {
            audioRef.current?.pause();
        };
    }, [fetchTracks]);

    const handlePlayPause = (track: MusicTrack) => {
        if (currentTrack?.id === track.id && isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            if (audioRef.current && currentTrack?.id !== track.id) {
                audioRef.current.src = track.music_url;
            } else if (!audioRef.current) {
                audioRef.current = new Audio(track.music_url);
                audioRef.current.addEventListener('ended', () => setIsPlaying(false));
            }
            audioRef.current.play().catch(e => console.error("Playback failed", e));
            setCurrentTrack(track);
            setIsPlaying(true);
        }
    };
    
    const handleSelectTrack = async (trackId: number) => {
        try {
            const { error } = await supabase.from('profiles').update({ selected_music_id: trackId } as any).eq('id', myId);
            if (error) throw error;
            alert('Profile music updated!');
            onBack();
        } catch(err: any) {
             alert('Failed to update profile music.');
             console.error(err);
        }
    }
    
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const fileName = `${myId}-${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('music')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });
            
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('music').getPublicUrl(fileName);

            const newTrack = {
                profile_id: myId,
                music_url: publicUrl,
                file_name: file.name
            };
            
            const { error: insertError } = await supabase.from('profile_music').insert([newTrack]);
            if (insertError) throw insertError;
            
            await fetchTracks();
            
        } catch (err: any) {
            setError(err.message || "Failed to upload music.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    return (
        <div className="flex flex-col h-screen">
             <header className="flex items-center p-4 border-b border-gray-200 flex-shrink-0">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-gray-800 mx-auto">Music Library</h1>
             </header>

            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {loading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {!loading && !error && (
                    tracks.length > 0 ? (
                        tracks.map(track => (
                            <div key={track.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center space-x-3">
                                <button onClick={() => handlePlayPause(track)} className="w-10 h-10 flex-shrink-0 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
                                    {currentTrack?.id === track.id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                                </button>
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-semibold truncate">{track.file_name || 'Untitled'}</p>
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <img src={track.profiles?.photo_url || generateAvatar(track.profiles?.name || '')} alt={track.profiles?.name || ''} className="w-4 h-4 rounded-full" />
                                        <span>{track.profiles?.name || 'Anonymous'}</span>
                                    </div>
                                </div>
                                <Button size="small" variant="secondary" className="w-auto px-3" onClick={() => handleSelectTrack(track.id)}>Select</Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 pt-10">The library is empty. Upload the first track!</p>
                    )
                )}
            </main>
            
            <footer className="p-4 border-t border-gray-200 flex-shrink-0">
                {isUploading && <div className="text-center text-sm text-violet-600 mb-2">Uploading...</div>}
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    <UploadIcon />
                    <span className="ml-2">{isUploading ? 'Please wait...' : 'Upload Music'}</span>
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="audio/*" disabled={isUploading} />
            </footer>
        </div>
    );
};

export default MusicLibraryPage;