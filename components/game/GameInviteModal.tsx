import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tables, Json } from '../../integrations/supabase/types';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

type InviteWithProfile = Tables<'game_invites'> & {
    profiles: {
        id: string;
        name: string | null;
        username: string;
        photo_url: string | null;
        active_cover_id: number | null;
    } | null;
};

interface GameInviteModalProps {
    invite: InviteWithProfile | null;
    onAccept: (inviteId: string) => void;
    onDecline: (inviteId: string) => void;
}

const GameInviteModal: React.FC<GameInviteModalProps> = ({ invite, onAccept, onDecline }) => {
    return (
        <AnimatePresence>
            {invite && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-[70] flex justify-center items-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="bg-[var(--theme-card-bg)] w-full max-w-sm rounded-2xl shadow-xl p-6 relative flex flex-col items-center"
                    >
                        <Avatar
                            photoUrl={invite.profiles?.photo_url}
                            name={invite.profiles?.name || invite.profiles?.username}
                            size="lg"
                            containerClassName="-mt-16 mb-4 border-4 border-[var(--theme-card-bg)] rounded-full"
                        />
                        <h2 className="text-xl font-bold text-[var(--theme-text)]">Game Invitation</h2>
                        <p className="text-sm text-[var(--theme-text-secondary)] mt-2 mb-6">
                           <span className="font-semibold text-[var(--theme-text)]">{invite.profiles?.name || invite.profiles?.username}</span> has invited you to a game of Tic-Tac-Toe!
                        </p>
                        <div className="w-full flex gap-3">
                            <Button variant="secondary" onClick={() => onDecline(invite.id)} className="flex-1">Decline</Button>
                            <Button onClick={() => onAccept(invite.id)} className="flex-1">Accept</Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GameInviteModal;