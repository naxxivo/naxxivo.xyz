import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Icon from './Icon';

interface PermissionStatusListProps {
    userId?: string;
}

const allPermissions = [
  { id: 'camera', name: 'Camera', icon: 'camera' },
  { id: 'microphone', name: 'Microphone', icon: 'microphone' },
  { id: 'location', name: 'Location', icon: 'map-pin' },
  { id: 'notifications', name: 'Notifications', icon: 'notification' },
  { id: 'calendar', name: 'Calendar', icon: 'calendar' },
  { id: 'call_logs', name: 'Call Logs', icon: 'phone' },
  { id: 'contacts', name: 'Contacts', icon: 'user-group' },
  { id: 'files', name: 'Files & Media', icon: 'folder' },
  { id: 'music_audio', name: 'Music and Audio', icon: 'musical-note' },
  { id: 'nearby_devices', name: 'Nearby Devices', icon: 'wifi' },
  { id: 'sms', name: 'SMS', icon: 'chat-bubble-left-right' },
];

type PermissionStatus = 'pending' | 'granted' | 'denied';

const PermissionStatusList: React.FC<PermissionStatusListProps> = ({ userId }) => {
    const [statuses, setStatuses] = useState<Record<string, PermissionStatus>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPermissionStatuses = async () => {
            let targetUserId = userId;
            if (!targetUserId) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    targetUserId = session.user.id;
                } else {
                     setLoading(false);
                     return;
                }
            }

            setLoading(true);
            const { data, error } = await supabase
                .from('user_permissions')
                .select('permission, status')
                .eq('user_id', targetUserId);
            
            if (!error && data) {
                const userStatuses = data.reduce((acc, p) => {
                    acc[p.permission] = p.status as PermissionStatus;
                    return acc;
                }, {} as Record<string, PermissionStatus>);
                setStatuses(userStatuses);
            }
            setLoading(false);
        };
        fetchPermissionStatuses();
    }, [userId]);

    const getStatusIndicator = (status: PermissionStatus) => {
        switch (status) {
            case 'granted':
                return <div className="w-2 h-2 rounded-full bg-green-500" title="Granted"></div>;
            case 'denied':
                return <div className="w-2 h-2 rounded-full bg-red-500" title="Denied"></div>;
            default:
                return <div className="w-2 h-2 rounded-full bg-slate-500" title="Not Set"></div>;
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">Permission Status</h2>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                {loading ? (
                    <p className="text-slate-400">Loading statuses...</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {allPermissions.map(p => (
                            <div key={p.id} className="flex items-center space-x-3">
                                {getStatusIndicator(statuses[p.id] || 'pending')}
                                <Icon name={p.icon} className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-300 text-sm">{p.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PermissionStatusList;
