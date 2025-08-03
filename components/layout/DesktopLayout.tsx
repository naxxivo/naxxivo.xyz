
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar.tsx';
import Header from './Header.tsx'; // We can reuse the header

interface DesktopLayoutProps {
    children: React.ReactNode;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-secondary-white dark:bg-dark-bg text-secondary-purple dark:text-dark-text">
            <DesktopSidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col transition-all duration-300" style={{ marginLeft: isSidebarOpen ? '16rem' : '5rem' }}>
                 {/* The main header is not strictly needed if the sidebar has profile links, but can be kept for consistency */}
                 <Header />
                 <main className="flex-1 p-4 sm:p-6 md:p-10">
                    <div className="h-16" /> {/* Spacer for fixed header */}
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DesktopLayout;