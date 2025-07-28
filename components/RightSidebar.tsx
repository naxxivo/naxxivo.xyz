import React from 'react';
import { SuggestedUsers } from './SuggestedUsers';

const TrendingTopics: React.FC = () => {
    const topics = ["#Technology", "#Design", "#Programming", "#SocialMedia", "#ReactJS"];

    return (
        <div className="bg-surface rounded-2xl shadow-xl p-4">
            <h2 className="text-lg font-bold text-text-primary mb-3">Trending Topics</h2>
            <div className="space-y-2">
                {topics.map(topic => (
                    <a key={topic} href="#" className="block text-text-secondary hover:text-primary transition-colors p-2 rounded-md hover:bg-border">
                        {topic}
                    </a>
                ))}
            </div>
        </div>
    );
};

export const RightSidebar: React.FC = () => {
    return (
        <aside className="sticky top-24 space-y-6">
            <SuggestedUsers />
            <TrendingTopics />
        </aside>
    );
};