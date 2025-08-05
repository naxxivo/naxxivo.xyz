// A place for shared utility functions across the application.

/**
 * Formats a number into a compact string representation.
 * e.g., 1500 -> "1.5K", 1000000 -> "1M", 1500000000 -> "1.5B"
 * @param xp The number to format.
 * @returns A formatted string.
 */
export const formatXp = (xp: number): string => {
    if (xp >= 1_000_000_000_000) {
        return `${(xp / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '')}T`;
    }
    if (xp >= 1_000_000_000) {
        return `${(xp / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
    }
    if (xp >= 1_000_000) {
        return `${(xp / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (xp >= 1_000) {
        return `${(xp / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return xp.toString();
};


/**
 * Generates a unique, cartoon-style avatar URL based on a seed string.
 * Uses the DiceBear API to create consistent avatars.
 * @param seed A string (like a username or ID) to generate the avatar from.
 * @returns A URL to an SVG avatar.
 */
export const generateAvatar = (seed: string): string => {
  // The 'adventurer' style is a nice, gender-neutral cartoon style.
  // The seed ensures the same avatar is generated for the same user every time.
  return `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
};