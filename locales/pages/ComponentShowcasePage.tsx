


import React from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition.tsx';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '@/App.tsx';
import { 
    HomeIcon, FilmIcon, CloudArrowUpIcon, ChatBubbleLeftRightIcon, UserCircleIcon, 
    Cog6ToothIcon, TvIcon, HeartIcon, UserGroupIcon, 
    BellIcon, ShieldCheckIcon, DocumentTextIcon, KeyIcon
} from '@heroicons/react/24/solid';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  }
};

interface ShowcaseCardProps {
    to: string;
    icon: React.ElementType;
    title: string;
    description: string;
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({ to, icon: Icon, title, description }) => (
    <motion.div variants={itemVariants} className="h-full">
        <Link to={to} className="block h-full">
            <div className="bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 h-full transition-all duration-300 ease-out transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-blue/30 dark:hover:shadow-accent/20 will-change-transform">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-accent/20 rounded-full">
                        <Icon className="h-8 w-8 text-accent flex-shrink-0" />
                    </div>
                    <h3 className="font-bold text-xl text-secondary-purple dark:text-dark-text">{title}</h3>
                </div>
                <p className="text-sm text-secondary-purple/80 dark:text-dark-text/80">{description}</p>
            </div>
        </Link>
    </motion.div>
);

const ComponentShowcasePage: React.FC = () => {
    const { user } = useAuth();

    if (!user) return null;

    const pageList: ShowcaseCardProps[] = [
        { to: '/', icon: HomeIcon, title: 'Home Feed', description: 'The main feed with posts from all users.' },
        { to: '/shorts', icon: FilmIcon, title: 'Shorts', description: 'A full-screen, vertical video feed.' },
        { to: `/profile/${user.id}`, icon: UserCircleIcon, title: 'My Profile', description: 'View and edit your personal profile.' },
        { to: '/upload', icon: CloudArrowUpIcon, title: 'Upload', description: 'Share a new image or video post.' },
        { to: '/messages', icon: ChatBubbleLeftRightIcon, title: 'Messages', description: 'Directly message with other users.' },
        { to: '/notifications', icon: BellIcon, title: 'Notifications', description: 'See your latest likes, comments, and follows.' },
        { to: '/anime', icon: TvIcon, title: 'Anime Library', description: 'Browse and watch user-uploaded anime series.' },
        { to: '/health', icon: HeartIcon, title: 'Health Hub', description: 'Find remedies for common health issues.' },
        { to: '/users', icon: UserGroupIcon, title: 'Find Users', description: 'Discover and connect with other people.' },
        { to: '/settings', icon: Cog6ToothIcon, title: 'Settings', description: 'Customize your theme and app experience.' },
        { to: '/post/0', icon: DocumentTextIcon, title: 'Single Post', description: 'The detailed view for a single post and its comments.' },
        { to: '/auth', icon: KeyIcon, title: 'Auth Page', description: 'The login and sign-up screen for new users.' },
    ];
    
    if (user.role === 'admin') {
        pageList.push({ to: '/admin', icon: ShieldCheckIcon, title: 'Admin Panel', description: 'Manage users, content, and the platform.' });
    }

    return (
        <PageTransition>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="font-display text-4xl md:text-6xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent mb-2">
                        Page Showcase
                    </h1>
                    <p className="text-lg text-secondary-purple/80 dark:text-dark-text/80">
                        An overview of all available pages and features in NAXXIVO.
                    </p>
                </div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                    {pageList.map(page => (
                        <ShowcaseCard
                            key={page.title}
                            to={page.to}
                            icon={page.icon}
                            title={page.title}
                            description={page.description}
                        />
                    ))}
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default ComponentShowcasePage;