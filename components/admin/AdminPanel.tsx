import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import AdminDashboard from './AdminDashboard';
import UserManagementPage from './UserManagementPage';
import PaymentQueuePage from './PaymentQueuePage';
import StoreManagementPage from './StoreManagementPage';

interface AdminPanelProps {
    session: Session;
    onExitAdminView: () => void;
}

type AdminView = 'dashboard' | 'users' | 'payments' | 'store';

const AdminPanel: React.FC<AdminPanelProps> = ({ session, onExitAdminView }) => {
    const [view, setView] = useState<AdminView>('dashboard');

    const navItems: { id: AdminView; label: string }[] = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'users', label: 'Users' },
        { id: 'payments', label: 'Payments' },
        { id: 'store', label: 'Store' },
    ];

    let content;
    switch (view) {
        case 'dashboard':
            content = <AdminDashboard />;
            break;
        case 'users':
            content = <UserManagementPage session={session} />;
            break;
        case 'payments':
            content = <PaymentQueuePage session={session} />;
            break;
        case 'store':
            content = <StoreManagementPage session={session} />;
            break;
        default:
            content = <AdminDashboard />;
    }

    return (
        <div className="min-h-screen flex bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="p-6 text-2xl font-bold font-logo text-center border-b border-gray-700">
                    Naxxivo Admin
                </div>
                <nav className="flex-1 px-4 py-6">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                                view === item.id ? 'bg-gray-700' : 'hover:bg-gray-700/50'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <button onClick={onExitAdminView} className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 transition-colors">
                        Return to App
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm p-4">
                    <h1 className="text-2xl font-bold text-gray-800 capitalize">{view}</h1>
                </header>
                <div className="flex-1 p-6 overflow-y-auto">
                    {content}
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
