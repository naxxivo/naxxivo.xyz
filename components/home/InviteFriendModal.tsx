import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../integrations/supabase/client';
import type { Tables, Json } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import Avatar from '../common/Avatar';
import Input from '../common/Input';
import Button from '../common/Button';

type ProfileSearchResult = Pick<Tables<'profiles'>, 'id' | 'name' | 'username' | 'photo_url'> & {
    active_cover: { preview_url: string | null; asset_details: Json } | null;
};
type GameInvite = Tables<'game_invites'>;

interface InviteFriendModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: any;
    onInviteSent: (invite: GameInvite) => void;
}

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};


const InviteFriendModal: React.FC<InviteFriendModalProps> = ({ isOpen, onClose, session, onInviteSent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<ProfileSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [inviteStatus, setInviteStatus] = useState<Record<string, 'idle' | 'sending' | 'sent'>>({});
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const myId = session.user.id;

    useEffect(() => {
        const searchUsers = async () => {
            if (!debouncedSearchTerm.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, name, username, photo_url, active_cover:active_cover_id(preview_url, asset_details)')
                    .or(`name.ilike.%${debouncedSearchTerm}%,username.ilike.%${debouncedSearchTerm}%`)
                    .not('id', 'eq', myId)
                    .limit(5);
                
                if (error) throw error;
                setResults(data as any || []);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        searchUsers();
    }, [debouncedSearchTerm, myId]);
    
    const handleInvite = async (inviteeId: string) => {
        setInviteStatus(prev => ({ ...prev, [inviteeId]: 'sending' }));
        const betAmount = 100; // Hardcoded for now

        const { data, error } = await supabase.rpc('create_game_invite', {
            p_invitee_id: inviteeId,
            p_bet_amount: betAmount,
        });
        
        if (error || (data as any)?.error) {
            alert((data as any)?.error || error?.message || "Failed to send invite.");
            setInviteStatus(prev => ({ ...prev, [inviteeId]: 'idle' }));
        } else {
            setInviteStatus(prev => ({ ...prev, [inviteeId]: 'sent' }));
            // We don't have the full invite object here, so we might need to adjust logic
            // For now, let's assume the onInviteSent will trigger a global listener on GamePage
            onInviteSent(data as any); // This is an assumption, RPC needs to return the invite
            onClose();
        }
    };


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-end p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="bg-[var(--theme-card-bg)] w-full max-w-sm rounded-t-2xl shadow-xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                         <header className="flex-shrink-0 p-4 border-b border-black/10 dark:border-white/10 text-center relative">
                            <h2 className="text-lg font-bold text-[var(--theme-text)]">Invite a Friend</h2>
                            <button onClick={onClose} className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-500" aria-label="Close">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </header>
                         <div className="p-4">
                            <Input id="search-invite" label="Search by name or username" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus />
                        </div>
                        <main className="flex-grow overflow-y-auto p-4 pt-0 space-y-2 min-h-[200px]">
                            {loading ? <div className="flex justify-center"><LoadingSpinner /></div> : 
                             results.length > 0 ? results.map(user => (
                                 <div key={user.id} className="flex items-center p-2 bg-[var(--theme-bg)] rounded-lg">
                                    <Avatar photoUrl={user.photo_url} name={user.username} activeCover={user.active_cover} size="sm" />
                                    <div className="ml-3 flex-grow">
                                        <p className="font-semibold text-sm text-[var(--theme-text)]">{user.name || user.username}</p>
                                        <p className="text-xs text-[var(--theme-text-secondary)]">@{user.username}</p>
                                    </div>
                                    <Button
                                        size="small"
                                        className="w-24"
                                        disabled={inviteStatus[user.id] === 'sending' || inviteStatus[user.id] === 'sent'}
                                        onClick={() => handleInvite(user.id)}
                                    >
                                        {inviteStatus[user.id] === 'sending' ? '...' : inviteStatus[user.id] === 'sent' ? 'Sent' : 'Invite'}
                                    </Button>
                                 </div>
                             )) : 
                             <p className="text-center text-sm text-[var(--theme-text-secondary)] pt-8">No users found.</p>}
                        </main>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InviteFriendModal;
