import React, { useState } from 'react';
import type { Session } from '@supabase/auth-js';
import AdminDashboard from './AdminDashboard';
import UserManagementPage from './UserManagementPage';
import PaymentQueuePage from './PaymentQueuePage';
import AdminStoreItemsPage from './AdminStoreItemsPage'; // Manages store_items (Bazaar)
import ProductsManagementPage from './StoreManagementPage'; // Manages products (TopUp)
import AppSettingsPage from './AppSettingsPage';
import AdminTasksPage from './AdminTasksPage';
import AdminGiftCodesPage from './AdminGiftCodesPage';
import { 
    ToolsIcon, ProfileIcon, CreditCardIcon, StoreIcon, SettingsIcon, 
    LogoutIcon, ClipboardListIcon, GiftIcon, PaintBrushIcon 
} from '../common/AppIcons';

interface AdminPanelProps {
    session: Session;
    onExitAdminView: () => void;
}

// Renamed 'store' to 'products' and added 'store_items' for clarity
type AdminView = 'dashboard' | 'users' | 'payments' | 'products' | 'store_items' | 'settings' | 'tasks' | 'gift_codes';

const AdminPanel: React.FC<AdminPanelProps> = ({ session, onExitAdminView }) => {
    const [view, setView] = useState<AdminView>('dashboard');

    // Updated nav items for better clarity and added icons
    const navItems: { id: AdminView; label: string; icon: JSX.Element }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <ToolsIcon className="w-5 h-5"/> },
        { id: 'users', label: 'Users', icon: <ProfileIcon className="w-5 h-5"/> },
        { id: 'payments', label: 'Payments', icon: <CreditCardIcon className="w-5 h-5"/> },
        { id: 'products', label: 'Top-Up Products', icon: <PaintBrushIcon className="w-5 h-5"/> },
        { id: 'store_items', label: 'Bazaar Items', icon: <StoreIcon className="w-5 h-5"/> },
        { id: 'tasks', label: 'Tasks', icon: <ClipboardListIcon className="w-5 h-5"/> },
        { id: 'gift_codes', label: 'Gift Codes', icon: <GiftIcon className="w-5 h-5"/> },
        { id: 'settings', label: 'App Settings', icon: <SettingsIcon className="w-5 h-5"/> },
    ];

    let content;
    switch (view) {
        case 'dashboard': content = <AdminDashboard />; break;
        case 'users': content = <UserManagementPage session={session} />; break;
        case 'payments': content = <PaymentQueuePage session={session} />; break;
        case 'products': content = <ProductsManagementPage session={session} />; break;
        case 'store_items': content = <AdminStoreItemsPage session={session} />; break;
        case 'tasks': content = <AdminTasksPage />; break;
        case 'gift_codes': content = <AdminGiftCodesPage session={session} />; break;
        case 'settings': content = <AppSettingsPage />; break;
        default: content = <AdminDashboard />;
    }

    const currentNavItem = navItems.find(item => item.id === view);

    return (
        <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col flex-shrink-0">
                <div className="p-5 text-2xl font-bold font-logo text-center border-b border-gray-200 dark:border-gray-700 text-[var(--theme-primary)] dark:text-white">
                    Naxxivo
                    <span className="block text-xs font-sans font-semibold text-gray-400 dark:text-gray-500 tracking-wider">ADMIN</span>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                                view === item.id 
                                ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-md' 
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={onExitAdminView} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm font-medium">
                        <LogoutIcon className="w-5 h-5" />
                        <span>Return to App</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                 <header className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                    {currentNavItem && <div className="text-violet-500">{currentNavItem.icon}</div>}
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 capitalize">
                        {currentNavItem?.label || view.replace(/_/g, ' ')}
                    </h1>
                </header>
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                    {content}
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;