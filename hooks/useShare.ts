
import { useState, useCallback } from 'react';
import { ShareData, UseShareReturn } from '../types';

export const useShare = (): UseShareReturn => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shareData, setShareData] = useState<ShareData | null>(null);

    const share = useCallback(async (data: ShareData) => {
        // Use the native Web Share API if available (on mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: data.title,
                    text: data.text,
                    url: data.url,
                });
            } catch (error) {
                console.error('Error using Web Share API:', error);
                // If user cancels, it's not an error, so we don't open the modal.
                // If it's a real error, we might still want the modal.
                if (error instanceof DOMException && error.name !== 'AbortError') {
                    setShareData(data);
                    setIsModalOpen(true);
                }
            }
        } else {
            // Fallback to a custom modal for desktop browsers
            setShareData(data);
            setIsModalOpen(true);
        }
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setShareData(null);
    }, []);

    return { share, isModalOpen, shareData, closeModal };
};
