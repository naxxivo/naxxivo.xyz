import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/auth-js';
import type { Tables, TablesInsert, TablesUpdate } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { BackArrowIcon, PlayIcon, PauseIcon, UploadIcon, DeleteIcon, CheckCircleIcon } from '../common/AppIcons';
import { generateAvatar } from '../../utils/helpers';
import ConfirmationModal from '../common/ConfirmationModal';

interface MusicLibraryPageProps {
    session: Session;
    onBack: () => void;
}

type MusicTrack = Tables<'profile_music'> & {
    profiles: Pick<Tables<'profiles'>, 'name' | 'username' | 'photo_url'> | null;
};
type ProfileGif = Tables<'profile_gifs'>;

const MusicLibraryPage: React.FC<MusicLibraryPageProps> = ({ session, onBack }) => {
    // Music State
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const musicFileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploadingMusic, setIsUploadingMusic] = useState(false);

    // GIF State
    const [gifs, setGifs] = useState<ProfileGif[]>([]);
    const [activeGifId, setActiveGifId] = useState<number | null>(null);
    const gifFileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploadingGif, setIsUploadingGif] = useState(false);
    const [isConfirmingGifUpload, setIsConfirmingGifUpload] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // General State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const myId = session.user.id;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [music, gifs, profile] = await Promise.all([
                supabase.from('profile_music').select(`*, profiles (name, username, photo_url)`).order('created_at', { ascending: false }),
                supabase.from('profile_gifs').select('*').eq('user_id', myId).order('created_at', { ascending: false }),
                supabase.from('profiles').select('active_gif_id').eq('id', myId).single(),
            ]);
            
            if (music.error) throw music.error;
            setTracks(music.data || []);

            if (gifs.error) throw gifs.error;
            setGifs(gifs.data || []);

            if (profile.error) throw profile.error;
            setActiveGifId(profile.data.active_gif_id);

        } catch (err: any) {
            setError(err.message || 'Failed to load library data.');
        } finally {
            setLoading(false);
        }
    }, [myId]);

    useEffect(() => {
        fetchData();
        return () => {
            audioRef.current?.pause();
        };
    }, [fetchData]);

    // --- Music Logic ---
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
            const { error } = await supabase.from('profiles').update({ selected_music_id: trackId }).eq('id', myId);
            if (error) throw error;
            alert('Profile music updated!');
            onBack();
        } catch(err: any) {
             alert('Failed to update profile music.');
             console.error(err);
        }
    }
    
    const handleMusicFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploadingMusic(true);
        setError(null);
        try {
            const fileName = `${myId}-${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage.from('music').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('music').getPublicUrl(fileName);
            const { error: insertError } = await supabase.from('profile_music').insert([{ profile_id: myId, music_url: publicUrl, file_name: file.name }]);
            if (insertError) throw insertError;
            await fetchData();
        } catch (err: any) {
            setError(err.message || "Failed to upload music.");
        } finally {
            setIsUploadingMusic(false);
            if (musicFileInputRef.current) musicFileInputRef.current.value = '';
        }
    }

    // --- GIF Logic ---
    const handleGifUploadClick = () => {
        setIsConfirmModalOpen(true);
    };

    const handleConfirmGifUpload = async () => {
        setIsConfirmingGifUpload(true);
        try {
            const { error: rpcError } = await supabase.rpc('deduct_xp_for_action', { p_user_id: myId, p_cost: 10 });
            if (rpcError) {
                throw new Error(rpcError.message.includes('Insufficient XP') ? rpcError.message : "Failed to charge XP.");
            }
            setIsConfirmModalOpen(false);
            gifFileInputRef.current?.click();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsConfirmingGifUpload(false);
        }
    };

    const handleGifFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploadingGif(true);
        setError(null);
        try {
            const filePath = `${myId}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage.from('gifs').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('gifs').getPublicUrl(filePath);
            const { error: insertError } = await supabase.from('profile_gifs').insert([{ user_id: myId, gif_url: publicUrl, storage_path: filePath }]);
            if (insertError) throw insertError;

            await fetchData();
        } catch (err: any) {
            setError(err.message || "Failed to upload GIF.");
        } finally {
            setIsUploadingGif(false);
            if (gifFileInputRef.current) gifFileInputRef.current.value = '';
        }
    };
    
    const handleSetActiveGif = async (gifId: number) => {
        const { error } = await supabase.from('profiles').update({ active_gif_id: gifId }).eq('id', myId);
        if (error) {
            alert(`Error: ${error.message}`);
        } else {
            setActiveGifId(gifId);
        }
    };
    
    const handleDeleteGif = async (gif: ProfileGif) => {
        if (!window.confirm("Are you sure you want to delete this GIF? This action cannot be undone.")) return;
        try {
            const { error: storageError } = await supabase.storage.from('gifs').remove([gif.storage_path]);
            if (storageError) throw storageError;

            const { error: dbError } = await supabase.from('profile_gifs').delete().eq('id', gif.id);
            if (dbError) throw dbError;

            await fetchData();
        } catch(err: any) {
            alert(`Failed to delete GIF: ${err.message}`);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[var(--theme-bg)]">
            <header className="flex items-center p-4 border-b border-black/10 dark:border-white/10 bg-[var(--theme-card-bg)] flex-shrink-0">
                <button onClick={onBack} className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-[var(--theme-text)] mx-auto">Music & Animations</h1>
                <div className="w-6"></div> {/* Placeholder */}
            </header>

            <main className="flex-grow overflow-y-auto p-4 space-y-8">
                {loading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                {error && <p className="text-red-500 text-center">{error}</p>}
                
                {/* Animations Section */}
                <section>
                    <h2 className="font-bold text-lg text-[var(--theme-text)] mb-3">Profile Animations</h2>
                     <div className="grid grid-cols-3 gap-2">
                        {gifs.map(gif => (
                            <div key={gif.id} className="relative group aspect-square">
                                <img src={gif.gif_url} alt="Uploaded GIF" className="w-full h-full object-cover rounded-md bg-gray-200" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 space-y-1">
                                    <Button
                                        size="small"
                                        variant={activeGifId === gif.id ? 'primary' : 'secondary'}
                                        onClick={() => handleSetActiveGif(gif.id)}
                                        className={`w-full text-xs ${activeGifId === gif.id ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                    >
                                        {activeGifId === gif.id ? <CheckCircleIcon/> : 'Set Active'}
                                    </Button>
                                    <Button size="small" variant="secondary" onClick={() => handleDeleteGif(gif)} className="w-full text-xs bg-red-500/80 hover:bg-red-600/80 text-white !border-red-500/80">
                                        <DeleteIcon/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                         <button onClick={handleGifUploadClick} disabled={isUploadingGif} className="aspect-square flex flex-col items-center justify-center bg-[var(--theme-card-bg-alt)] border-2 border-dashed border-[var(--theme-secondary)]/50 rounded-md hover:border-[var(--theme-primary)] transition-colors text-[var(--theme-text-secondary)]">
                             {isUploadingGif ? <LoadingSpinner/> : <><UploadIcon className="w-8 h-8"/> <span className="text-xs mt-1">Upload GIF</span></>}
                         </button>
                     </div>
                     <p className="text-xs text-[var(--theme-text-secondary)] mt-3 text-center">Uploading a GIF costs 10 XP. Storing GIFs costs 5 XP per day.</p>
                </section>
                
                {/* Music Section */}
                <section>
                     <h2 className="font-bold text-lg text-[var(--theme-text)] mb-3">Music Library</h2>
                    {!loading && !error && tracks.length > 0 ? (
                        <div className="space-y-3">
                            {tracks.map(track => (
                                <div key={track.id} className="bg-[var(--theme-card-bg)] p-3 rounded-lg shadow-sm flex items-center space-x-3">
                                    <button onClick={() => handlePlayPause(track)} className="w-10 h-10 flex-shrink-0 bg-[var(--theme-primary)]/20 rounded-full flex items-center justify-center text-[var(--theme-primary)]">
                                        {currentTrack?.id === track.id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                                    </button>
                                    <div className="flex-grow overflow-hidden">
                                        <p className="font-semibold truncate text-[var(--theme-text)]">{track.file_name || 'Untitled'}</p>
                                        <div className="flex items-center space-x-1 text-xs text-[var(--theme-text-secondary)]">
                                            <img src={track.profiles?.photo_url || generateAvatar(track.profiles?.name || '')} alt={track.profiles?.name || ''} className="w-4 h-4 rounded-full" />
                                            <span>{track.profiles?.name || 'Anonymous'}</span>
                                        </div>
                                    </div>
                                    <Button size="small" variant="secondary" className="w-auto px-3" onClick={() => handleSelectTrack(track.id)}>Select</Button>
                                </div>
                            ))}
                        </div>
                    ) : !loading && (
                        <p className="text-center text-[var(--theme-text-secondary)] pt-4">The library is empty. Upload the first track!</p>
                    )}
                </section>
            </main>
            
            <footer className="p-4 border-t border-black/10 dark:border-white/10 bg-[var(--theme-card-bg)] flex-shrink-0">
                {isUploadingMusic && <div className="text-center text-sm text-[var(--theme-primary)] mb-2">Uploading music...</div>}
                <Button onClick={() => musicFileInputRef.current?.click()} disabled={isUploadingMusic}>
                    <UploadIcon />
                    <span className="ml-2">{isUploadingMusic ? 'Please wait...' : 'Upload Music'}</span>
                </Button>
                <input type="file" ref={musicFileInputRef} onChange={handleMusicFileUpload} className="hidden" accept="audio/*" disabled={isUploadingMusic} />
                <input type="file" ref={gifFileInputRef} onChange={handleGifFileChange} className="hidden" accept="image/gif" disabled={isUploadingGif} />
            </footer>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmGifUpload}
                title="Confirm GIF Upload"
                message="Uploading a new GIF will cost 10 XP from your balance. Do you want to continue?"
                confirmText="Yes, pay 10 XP"
                isConfirming={isConfirmingGifUpload}
            />
        </div>
    );
};

export default MusicLibraryPage;