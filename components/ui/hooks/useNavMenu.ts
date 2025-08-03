





import { useMemo } from 'react';
import { useAuth } from '@/App.tsx';
import { 
    HomeIcon, FilmIcon, CloudArrowUpIcon, UserGroupIcon, ChatBubbleLeftRightIcon, 
    UserCircleIcon, Cog6ToothIcon, TvIcon, 
    ShieldCheckIcon, HeartIcon, BellIcon, SparklesIcon, PaintBrushIcon
} from '@heroicons/react/24/solid';

const useNavMenu = () => {
    const { user } = useAuth();

    const menuItems = useMemo(() => {
        if (!user) return [];
        
        const items = [
            { href: '/', icon: HomeIcon, label: 'Home' },
            { href: '/ai-chat', icon: SparklesIcon, label: 'AI Chat' },
            { href: '/shorts', icon: FilmIcon, label: 'Shorts' },
            { href: '/upload', icon: CloudArrowUpIcon, label: 'Upload' },
            { href: `/profile/${user.id}`, icon: UserCircleIcon, label: 'Profile' },
            { href: '/notifications', icon: BellIcon, label: 'Notifications' },
            { href: '/messages', icon: ChatBubbleLeftRightIcon, label: 'Messages' },
            { href: '/anime', icon: TvIcon, label: 'Anime' },
            { href: '/health', icon: HeartIcon, label: 'Health Hub' },
            { href: '/build-site', icon: PaintBrushIcon, label: 'Site Builder'},
            { href: '/users', icon: UserGroupIcon, label: 'Users' },
            { href: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
        ];

        if (user.role === 'admin') {
            items.push({ href: '/admin', icon: ShieldCheckIcon, label: 'Admin Panel' });
        }
        
        return items;
    }, [user]);

    return menuItems;
};

export default useNavMenu;