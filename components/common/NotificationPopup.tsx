import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, AdminIcon, InfoIcon } from './AppIcons'; // Assuming AdminIcon can be used for error.

export interface NotificationDetails {
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
}

interface NotificationPopupProps {
    notification: NotificationDetails | null;
    onClose: () => void;
}

const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    error: <AdminIcon className="w-6 h-6 text-red-500" />, // Using AdminIcon as a placeholder for an error X icon
    info: <InfoIcon className="w-6 h-6 text-blue-500" />,
};

const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/50 border-green-400',
    error: 'bg-red-50 dark:bg-red-900/50 border-red-500',
    info: 'bg-blue-50 dark:bg-blue-900/50 border-blue-500',
};

const NotificationPopup: React.FC<NotificationPopupProps> = ({ notification, onClose }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000); // Auto-dismiss after 4 seconds
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="fixed bottom-24 md:bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100]"
                >
                    <div className={`flex items-start p-4 rounded-xl shadow-2xl border ${bgColors[notification.type]} backdrop-blur-lg bg-opacity-80`}>
                        <div className="flex-shrink-0">
                            {icons[notification.type]}
                        </div>
                        <div className="ml-3 w-0 flex-1 pt-0.5">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{notification.title}</p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-200">{notification.message}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                onClick={onClose}
                                className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationPopup;
