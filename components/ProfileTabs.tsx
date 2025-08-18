
import React, { useState } from 'react';
import Icon from './Icon';

const ProfileTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('posts');

  const tabs = [
    { id: 'posts', label: 'Posts', icon: 'post' },
    { id: 'likes', label: 'Likes', icon: 'like' },
    { id: 'saved', label: 'Saved', icon: 'bookmark' },
  ];

  return (
    <div className="border-b border-slate-700 px-8">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
            } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            <Icon name={tab.icon} className={`${
              activeTab === tab.id ? 'text-sky-500' : 'text-slate-500 group-hover:text-slate-300'
            } -ml-0.5 mr-2 h-5 w-5`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;
