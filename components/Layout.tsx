import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';

export const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 sm:px-6 py-6">
                <div className="grid grid-cols-12 gap-8">
                    <aside className="hidden lg:block col-span-3">
                        <LeftSidebar />
                    </aside>
                    <div className="col-span-12 lg:col-span-6">
                        <Outlet />
                    </div>
                    <aside className="hidden md:block col-span-12 md:col-span-3">
                       <RightSidebar />
                    </aside>
                </div>
            </div>
        </div>
    );
}