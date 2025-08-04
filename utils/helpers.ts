// A place for shared utility functions across the application.

/**
 * Formats a number into a compact string representation.
 * e.g., 1500 -> "1.5k", 10000 -> "10k", 1000000 -> "1m"
 * @param xp The number to format.
 * @returns A formatted string.
 */
export const formatXp = (xp: number): string => {
    if (xp >= 1000000) {
        return `${(xp / 1000000).toFixed(1).replace(/\.0$/, '')}m`;
    }
    if (xp >= 1000) {
        return `${(xp / 1000).toFixed(1).replace(/\.0$/, '')}k`;
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
