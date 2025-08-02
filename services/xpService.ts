import { supabase } from './supabase';

const XP_AMOUNTS = {
    CREATE_POST: 25,
    CREATE_COMMENT: 5,
    GIVE_LIKE: 1,
    RECEIVE_LIKE: 10,
    RECEIVE_COMMENT: 15,
};

type ActionType = keyof typeof XP_AMOUNTS;

/**
 * Awards XP to a user for a specific action by calling a secure Supabase RPC function.
 * @param userId - The UUID of the user to award XP to.
 * @param action - The type of action performed (e.g., 'CREATE_POST').
 */
export const awardXp = async (userId: string, action: ActionType): Promise<void> => {
    if (!userId) {
        console.error("XP Service: No user ID provided.");
        return;
    }

    const amount = XP_AMOUNTS[action];
    if (typeof amount !== 'number') {
        console.error(`XP Service: Invalid action type "${action}".`);
        return;
    }

    try {
        const { error } = await supabase.rpc('add_xp', {
            user_id_to_add: userId,
            xp_to_add: amount
        });
        
        if (error) {
            throw error;
        }
        
        console.log(`Awarded ${amount} XP to user ${userId} for action: ${action}`);

    } catch (error: any) {
        console.error(`XP Service: Failed to award XP for action "${action}" to user ${userId}.`, error.message);
    }
};