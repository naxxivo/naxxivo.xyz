
import { useMemo } from 'react';
import { useAuth } from '@/App';
import { 
    HomeIcon, FilmIcon, CloudArrowUpIcon, UserGroupIcon, ChatBubbleLeftRightIcon, 
    UserCircleIcon, Cog6ToothIcon, TvIcon, ShoppingBagIcon, 
    ShieldCheckIcon, HeartIcon, BellIcon
} from '@heroicons/react/24/solid';

const useNavMenu = () => {
    const { user } = useAuth();

    const menuItems = useMemo(() => {
        if (!user) return [];
        
        const items = [
            { href: '/', icon: HomeIcon, label: 'Home' },
            { href: '/shorts', icon: FilmIcon, label: 'Shorts' },
            { href: '/upload', icon: CloudArrowUpIcon, label: 'Upload' },
            { href: `/profile/${user.id}`, icon: UserCircleIcon, label: 'Profile' },
            { href: '/notifications', icon: BellIcon, label: 'Notifications' },
            { href: '/messages', icon: ChatBubbleLeftRightIcon, label: 'Messages' },
            { href: '/anime', icon: TvIcon, label: 'Anime' },
            { href: '/market', icon: ShoppingBagIcon, label: 'Marketplace' },
            { href: '/health', icon: HeartIcon, label: 'Health Hub' },
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
