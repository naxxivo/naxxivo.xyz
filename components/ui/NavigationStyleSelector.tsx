import React from 'react';
import { useTheme, MenuStyle } from '@/components/theme/ThemeProvider';
import { Bars3Icon, ShareIcon, CogIcon, WindowIcon, Squares2X2Icon, EllipsisVerticalIcon, TvIcon } from '@heroicons/react/24/outline';

const menuOptions: { id: MenuStyle; name: string; description: string; icon: React.ElementType }[] = [
    { id: 'floating-action', name: 'Floating Action', description: 'A round button with quick actions.', icon: ShareIcon },
    { id: 'sidebar', name: 'Sliding Sidebar', description: 'A classic collapsible side menu.', icon: Bars3Icon },
    { id: 'bottom-tab', name: 'Bottom Tab Bar', description: 'Mobile-style bottom navigation.', icon: WindowIcon },
    { id: 'circular', name: 'Circular Menu', description: 'A radial menu expanding from a FAB.', icon: CogIcon },
    { id: 'mega-menu', name: 'Mega Menu', description: 'A large, categorized desktop menu.', icon: Squares2X2Icon },
    { id: 'three-dot', name: 'Three-Dot Dropdown', description: 'A minimal dropdown from the header.', icon: EllipsisVerticalIcon },
    { id: 'tv-optimized', name: 'TV Optimized Grid', description: 'A large, remote-friendly grid menu.', icon: TvIcon },
];

const NavigationStyleSelector: React.FC = () => {
    const { menuStyle, setMenuStyle } = useTheme();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Navigation Style</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuOptions.map((option) => (
                    <div
                        key={option.id}
                        onClick={() => setMenuStyle(option.id)}
                        className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${menuStyle === option.id ? 'border-accent bg-accent/10' : 'border-gray-200/50 dark:border-dark-bg/80 bg-gray-200/50 dark:bg-dark-bg/50 hover:border-accent/50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <option.icon className="h-6 w-6 text-accent" />
                            <h3 className="font-semibold">{option.name}</h3>
                        </div>
                        <p className="text-sm text-secondary-purple/80 dark:text-dark-text/70 mt-2">
                            {option.description}
                        </p>
                    </div>
                ))}
            </div>
            <p className="text-sm mt-2 text-secondary-purple/80 dark:text-dark-text/70">
                Choose the main navigation style for the app. The change will apply after a page refresh. Some options are still in development.
            </p>
        </div>
    );
}

export default NavigationStyleSelector;
