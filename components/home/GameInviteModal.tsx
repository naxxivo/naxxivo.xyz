import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../integrations/supabase/client';
import type { Tables, Json, Enums } from '../../integrations/supabase/types';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

type GameInviteWithProfile = Tables<'game_invites'> & {
    profiles: Pick<Tables<'profiles'>, 'id' | 'name' | 'username' | 'photo_url'> & {
        active_cover: { preview_url: string | null; asset_details: Json } | null;
    } | null;
};


interface GameInviteModalProps {
    invite: GameInviteWithProfile;
    onClose: () => void;
    onRespond: (inviteId: number, response: 'accepted' | 'declined') => void;
}

const GameInviteModal: React.FC<GameInviteModalProps> = ({ invite, onClose, onRespond }) => {
    const [isResponding, setIsResponding] = useState(false);

    const handleResponse = async (response: 'accepted' | 'declined') => {
        setIsResponding(true);
        await onRespond(invite.id, response);
        setIsResponding(false);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-70 z-[80] flex justify-center items-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="bg-[var(--theme-card-bg)] w-full max-w-sm rounded-2xl shadow-xl p-6 relative flex flex-col text-center"
                >
                    <h2 className="text-xl font-bold text-[var(--theme-text)] mb-3">Game Invitation</h2>
                    <div className="flex flex-col items-center my-4">
                        <Avatar
                            photoUrl={invite.profiles?.photo_url}
                            name={invite.profiles?.name || invite.profiles?.username}
                            activeCover={null}
                            size="lg"
                        />
                        <p className="mt-3 text-[var(--theme-text)]">
                            <strong className="font-bold">{invite.profiles?.name || invite.profiles?.username}</strong> has invited you to a game for <strong>{invite.bet_amount}</strong> coins.
                        </p>
                    </div>

                    <div className="mt-4 flex gap-3">
                        <Button variant="secondary" onClick={() => handleResponse('declined')} disabled={isResponding} className="flex-1">
                            Decline
                        </Button>
                        <Button onClick={() => handleResponse('accepted')} disabled={isResponding} className="flex-1">
                            {isResponding ? <LoadingSpinner /> : 'Accept'}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GameInviteModal;
