import React from 'react';
import Button from '../common/Button';
import { BackArrowIcon } from '../common/AppIcons';

interface SettingsPageProps {
    onBack: () => void;
    onNavigateToEditProfile: () => void;
    onNavigateToMusicLibrary: () => void;
    onLogout: () => void;
}

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, onNavigateToEditProfile, onNavigateToMusicLibrary, onLogout }) => {
    return (
        <div className="min-h-screen flex flex-col justify-between">
            <div>
                 <header className="flex items-center p-4">
                    <button onClick={onBack} className="text-gray-600 hover:text-gray-900"><BackArrowIcon /></button>
                    <h1 className="text-xl font-bold text-gray-800 mx-auto">Settings</h1>
                 </header>
                
                <div className="mt-6">
                    <ul className="divide-y divide-gray-200">
                        <li>
                            <button onClick={onNavigateToEditProfile} className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                                <span className="font-medium text-gray-700">Edit Profile</span>
                                <ChevronRightIcon />
                            </button>
                        </li>
                         <li>
                            <button onClick={onNavigateToMusicLibrary} className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                                <span className="font-medium text-gray-700">Music Library</span>
                                <ChevronRightIcon />
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="p-4">
                <Button onClick={onLogout} variant="secondary">
                    Sign Out
                </Button>
            </div>
        </div>
    );
};

export default SettingsPage;