
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XMarkIcon, LinkIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/solid';
import { ShareData } from '@/types';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareData: ShareData | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareData }) => {
    const [copied, setCopied] = useState(false);

    if (!shareData) return null;

    const { title, text, url } = shareData;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
    };

    const socialPlatforms = [
        { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
        { name: 'Twitter', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-dark-card w-full max-w-md rounded-2xl shadow-2xl p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-display text-2xl font-bold">Share This</h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <p className="text-sm text-secondary-purple/80 dark:text-dark-text/80 mb-6">{title}</p>

                        <div className="flex justify-center space-x-4 mb-6">
                            {socialPlatforms.map(p => (
                                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                                     <div className="w-14 h-14 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                                        <svg className="w-8 h-8 text-secondary-purple dark:text-dark-text" fill="currentColor" viewBox="0 0 24 24"><path d={p.icon} /></svg>
                                    </div>
                                    <span className="text-xs mt-2">{p.name}</span>
                                </a>
                            ))}
                        </div>

                        <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-dark-bg rounded-lg">
                            <LinkIcon className="h-5 w-5 text-gray-500 flex-shrink-0 ml-2" />
                            <input
                                type="text"
                                value={url}
                                readOnly
                                className="bg-transparent text-sm w-full outline-none truncate"
                            />
                            <button
                                onClick={copyToClipboard}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-accent text-white hover:bg-secondary-coral'}`}
                            >
                               {copied ? <ClipboardDocumentCheckIcon className="h-5 w-5"/> : null}
                               {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShareModal;
