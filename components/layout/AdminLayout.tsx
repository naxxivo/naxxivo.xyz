
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../admin/AdminSidebar';
import AdminHeader from '../admin/AdminHeader';

const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const useMediaQuery = (query: string) => {
        const [matches, setMatches] = useState(false);
        useEffect(() => {
            const media = window.matchMedia(query);
            if (media.matches !== matches) {
                setMatches(media.matches);
            }
            const listener = () => setMatches(media.matches);
            window.addEventListener('resize', listener);
            return () => window.removeEventListener('resize', listener);
        }, [matches, query]);
        return matches;
    };

    const isLargeScreen = useMediaQuery('(min-width: 768px)');

    useEffect(() => {
        // Close sidebar by default on smaller screens
        if (!isLargeScreen) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(true);
        }
    }, [isLargeScreen]);

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-dark-bg text-secondary-purple dark:text-dark-text">
            <AdminSidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col transition-all duration-300">
                <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
                <main className={`flex-1 p-4 sm:p-6 md:p-10 transition-all duration-300 ${isLargeScreen && (isSidebarOpen ? 'md:ml-64' : 'md:ml-20')}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
