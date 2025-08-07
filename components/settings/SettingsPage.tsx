import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { motion } from 'framer-motion';
import {
    BackArrowIcon, UserCircleIcon, LockIcon, CreditCardIcon,
    BellIcon, ShieldCheckIcon, QuestionMarkCircleIcon, InfoIcon, LogoutIcon, AdminIcon
} from '../common/AppIcons';
import Button from '../common/Button';

interface SettingsPageProps {
    onBack: () => void;
    onNavigateToEditProfile: () => void;
    onNavigateToMusicLibrary: () => void;
    onLogout: () => void;
    onNavigateToAdminPanel: () => void;
}

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean, onChange: (enabled: boolean) => void }) => {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)] focus:ring-offset-2 ${enabled ? 'bg-[var(--theme-primary)]' : 'bg-gray-200 dark:bg-gray-600'}`}
        >
            <motion.span
                {...{
                    layout: true,
                    transition: { type: "spring", stiffness: 700, damping: 30 },
                } as any}
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    );
};

const SettingsItem = ({ icon, title, subtitle, onClick, isNav, hasToggle, toggleState, onToggleChange }: { icon: React.ReactNode, title: string, subtitle?: string, onClick?: () => void, isNav?: boolean, hasToggle?: boolean, toggleState?: boolean, onToggleChange?: (enabled: boolean) => void }) => (
    <motion.div {...{ whileTap: { scale: 0.98, backgroundColor: 'rgba(0,0,0,0.02)' } } as any} className="dark:hover:bg-opacity-50 rounded-lg">
        <button onClick={onClick} className="w-full flex items-center p-4 text-left" disabled={!onClick && !hasToggle}>
            <div className="text-[var(--theme-text-secondary)] mr-4">{icon}</div>
            <div className="flex-grow">
                <p className="font-medium text-[var(--theme-text)]">{title}</p>
                {subtitle && <p className="text-xs text-[var(--theme-text-secondary)]">{subtitle}</p>}
            </div>
            {isNav && <ChevronRightIcon />}
            {hasToggle && <ToggleSwitch enabled={toggleState || false} onChange={onToggleChange || (() => {})} />}
        </button>
    </motion.div>
);

const SectionHeader = ({ title }: { title: string }) => (
    <h2 className="px-4 pt-6 pb-2 text-sm font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">{title}</h2>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, onLogout, onNavigateToEditProfile, onNavigateToMusicLibrary, onNavigateToAdminPanel }) => {
    const [notifications, setNotifications] = React.useState({
        likes: true,
        comments: true,
        followers: true,
    });


    return (
        <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col">
            <header className="flex-shrink-0 flex items-center p-4 border-b border-[var(--theme-secondary)]/30 bg-[var(--theme-header-bg)] sticky top-0 z-10">
                <button onClick={onBack} className="text-[var(--theme-header-text)] hover:opacity-80"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-[var(--theme-header-text)] mx-auto">Settings</h1>
                <div className="w-6"></div> {/* Placeholder for centering */}
            </header>
            
            <main className="flex-grow overflow-y-auto">
                {/* Account Section */}
                <SectionHeader title="Account" />
                <div className="mx-4 bg-[var(--theme-card-bg)] divide-y divide-black/5 dark:divide-white/5 shadow-sm rounded-xl">
                    <SettingsItem icon={<UserCircleIcon />} title="Edit Profile" onClick={onNavigateToEditProfile} isNav />
                    <SettingsItem icon={<LockIcon />} title="Change Password" onClick={() => alert("Navigate to Change Password page.")} isNav />
                    <SettingsItem icon={<CreditCardIcon />} title="Manage Subscriptions" onClick={() => alert("Navigate to Subscriptions page.")} isNav />
                </div>
                
                {/* Notifications Section */}
                <SectionHeader title="Notifications" />
                <div className="mx-4 bg-[var(--theme-card-bg)] divide-y divide-black/5 dark:divide-white/5 shadow-sm rounded-xl">
                    <SettingsItem icon={<BellIcon />} title="New Likes" hasToggle toggleState={notifications.likes} onToggleChange={v => setNotifications(p => ({...p, likes: v}))} />
                    <SettingsItem icon={<BellIcon />} title="New Comments" hasToggle toggleState={notifications.comments} onToggleChange={v => setNotifications(p => ({...p, comments: v}))} />
                    <SettingsItem icon={<BellIcon />} title="New Followers" hasToggle toggleState={notifications.followers} onToggleChange={v => setNotifications(p => ({...p, followers: v}))} />
                </div>

                {/* Privacy & Safety Section */}
                <SectionHeader title="Privacy & Safety" />
                <div className="mx-4 bg-[var(--theme-card-bg)] divide-y divide-black/5 dark:divide-white/5 shadow-sm rounded-xl">
                    <SettingsItem icon={<ShieldCheckIcon />} title="Private Account" subtitle="Only approved followers see your posts" hasToggle toggleState={false} onToggleChange={() => {}} />
                    <SettingsItem icon={<ShieldCheckIcon />} title="Blocked Accounts" onClick={() => alert("Navigate to Blocked Accounts page.")} isNav />
                </div>

                {/* Help & Information Section */}
                <SectionHeader title="Help & Information" />
                 <div className="mx-4 bg-[var(--theme-card-bg)] divide-y divide-black/5 dark:divide-white/5 shadow-sm rounded-xl">
                    <SettingsItem icon={<QuestionMarkCircleIcon />} title="Help Center" onClick={() => {}} isNav />
                    <SettingsItem icon={<InfoIcon />} title="App Info" subtitle="Version 1.0.0" />
                </div>

                 {/* Advanced Section */}
                <SectionHeader title="Advanced" />
                <div className="mx-4 bg-[var(--theme-card-bg)] shadow-sm rounded-xl">
                    <SettingsItem
                        icon={<AdminIcon />}
                        title="[ control ]"
                        subtitle="Access administrative panel"
                        onClick={onNavigateToAdminPanel}
                    />
                </div>
            </main>

            <footer className="p-4 flex-shrink-0">
                <Button onClick={onLogout} variant="secondary">
                     <LogoutIcon className="mr-2"/>
                    Sign Out
                </Button>
            </footer>
        </div>
    );
};

export default SettingsPage;