
import React from 'react';
import { Activity, ActivityType } from '../types';
import Icon from './Icon';

const mockActivities: Activity[] = [
  { id: 1, type: ActivityType.POST, description: 'Posted a new photo of a sunset over the mountains.', timestamp: '2 hours ago' },
  { id: 2, type: ActivityType.LIKE, description: 'Liked a post by @naturelover.', timestamp: '5 hours ago' },
  { id: 3, type: ActivityType.COMMENT, description: 'Commented on a photo: "Incredible shot!"', timestamp: '1 day ago' },
  { id: 4, type: ActivityType.FOLLOW, description: 'Started following @travelblogger.', timestamp: '2 days ago' },
  { id: 5, type: ActivityType.POST, description: 'Shared an article about space exploration.', timestamp: '3 days ago' },
];

const activityIconMap: { [key in ActivityType]: string } = {
  [ActivityType.POST]: 'post',
  [ActivityType.LIKE]: 'like',
  [ActivityType.COMMENT]: 'comment',
  [ActivityType.FOLLOW]: 'follow',
};


const RecentActivity: React.FC = () => {
  return (
    <div className="px-8 py-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {mockActivities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                        <div className="relative pb-8">
                            {activityIdx !== mockActivities.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-700" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex items-start space-x-3">
                                <div>
                                    <div className="relative px-1">
                                        <div className="h-8 w-8 bg-slate-800 rounded-full ring-8 ring-slate-900 flex items-center justify-center">
                                            <Icon name={activityIconMap[activity.type]} className="h-5 w-5 text-sky-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1 py-1.5">
                                    <div className="text-sm text-slate-400">
                                        <p className="text-slate-300">{activity.description}</p>
                                        <p className="whitespace-nowrap mt-1">{activity.timestamp}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default RecentActivity;
