// A place for shared utility functions across the application.

/**
 * Formats a number into a compact string representation.
 * e.g., 1500 -> "1.5K", 1000000 -> "1M", 1500000000 -> "1.5B"
 * @param xp The number to format.
 * @returns A formatted string.
 */
export const formatXp = (xp: number): string => {
    const num = Number(xp); // Ensure it's a number
    if (isNaN(num)) return '0';

    if (num >= 1_000_000_000_000) {
        return `${(num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '')}T`;
    }
    if (num >= 1_000_000_000) {
        return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
    }
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return num.toString();
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


/**
 * Fetches an image from a URL and converts it to a base64 string.
 * Note: This can be blocked by CORS if the image server doesn't allow cross-origin requests.
 * @param url The URL of the image to convert.
 * @returns A Promise that resolves with the base64 encoded string of the image.
 */
export const urlToBase64 = async (url: string): Promise<string> => {
    // Using a CORS proxy for Supabase storage URLs that might not have CORS headers set up for all origins.
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                // result is "data:image/jpeg;base64,...." - we only need the part after the comma
                resolve((reader.result as string).split(',')[1]);
            } else {
                reject('Failed to read blob as data URL.');
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


/**
 * Dynamically loads a Google Font into the document's head.
 * @param fontFamily The name of the font family to load (e.g., "Roboto", "Lato").
 */
export const loadGoogleFont = (fontFamily: string) => {
    if (!fontFamily || typeof document === 'undefined') return;
    
    const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
    
    // Check if the font is already loaded or is being loaded
    if (document.getElementById(fontId)) {
        return;
    }

    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    // Request common weights to ensure they are available
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
    
    document.head.appendChild(link);
};