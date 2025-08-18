import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { supabase } from '../lib/supabase';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PermissionStatus = 'pending' | 'granted' | 'denied';

const allPermissions = [
  { id: 'camera', name: 'Camera', icon: 'camera' },
  { id: 'microphone', name: 'Microphone', icon: 'microphone' },
  { id: 'location', name: 'Location', icon: 'map-pin' },
  { id: 'notifications', name: 'Notifications', icon: 'notification' },
  { id: 'calendar', name: 'Calendar', icon: 'calendar' },
  { id: 'call_logs', name: 'Call Logs', icon: 'phone' },
  { id: 'contacts', name: 'Contacts', icon: 'user-group' },
  { id: 'files', name: 'Files', icon: 'folder' },
  { id: 'music_audio', name: 'Music and Audio', icon: 'musical-note' },
  { id: 'nearby_devices', name: 'Nearby Devices', icon: 'wifi' },
  { id: 'phone', name: 'Phone', icon: 'phone' },
  { id: 'photos_videos', name: 'Photos and Videos', icon: 'photo' },
  { id: 'sms', name: 'SMS', icon: 'chat-bubble-left-right' },
];

const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onClose }) => {
  const [statuses, setStatuses] = useState<Record<string, PermissionStatus>>(
    allPermissions.reduce((acc, p) => ({ ...acc, [p.id]: 'pending' }), {})
  );

  const setStatus = async (id: string, status: PermissionStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('user_permissions')
        .upsert({ user_id: session.user.id, permission: id, status: status, updated_at: new Date().toISOString() }, { onConflict: 'user_id, permission' });
    }
  };
  
  const handleGrantPermissions = async () => {
    // Web API permissions
    const requestCamera = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setStatus('camera', 'granted');
      } catch (err) {
        setStatus('camera', 'denied');
      }
    };
    
    const requestMicrophone = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setStatus('microphone', 'granted');
        } catch (err) {
            setStatus('microphone', 'denied');
        }
    };

    const requestLocation = async () => {
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        setStatus('location', 'granted');
      } catch (err) {
        setStatus('location', 'denied');
      }
    };
    
    const requestNotifications = async () => {
        try {
            const result = await Notification.requestPermission();
            setStatus('notifications', result === 'granted' ? 'granted' : 'denied');
        } catch (err) {
            setStatus('notifications', 'denied');
        }
    };

    await Promise.all([requestCamera(), requestMicrophone(), requestLocation(), requestNotifications()]);
  };

  if (!isOpen) {
    return null;
  }

  const getStatusPill = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return <span className="text-xs font-medium text-green-400 bg-green-900/50 px-2 py-1 rounded-full">Granted</span>;
      case 'denied':
        return <span className="text-xs font-medium text-red-400 bg-red-900/50 px-2 py-1 rounded-full">Denied</span>;
      default:
        return <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">Not Set</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-800/80 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-700 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <Icon name="close" className="w-6 h-6" />
        </button>

        <div className="p-8">
            <div className="flex items-center mb-6">
                <div className="bg-sky-500/10 p-3 rounded-full mr-4 border border-sky-500/30">
                    <Icon name="shield" className="w-8 h-8 text-sky-400" />
                </div>
                <div>
                    <h2 id="modal-title" className="text-2xl font-bold text-white">App Permissions</h2>
                    <p className="text-slate-400">To give you the best experience, we need a few permissions.</p>
                </div>
            </div>

          <div className="max-h-64 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {allPermissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                <div className="flex items-center">
                  <Icon name={permission.icon} className="w-5 h-5 text-slate-400 mr-4" />
                  <span className="text-slate-300">{permission.name}</span>
                </div>
                {getStatusPill(statuses[permission.id])}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row-reverse gap-4">
             <button
              onClick={handleGrantPermissions}
              className="flex w-full justify-center rounded-md bg-sky-500 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 transition"
            >
              Grant Permissions
            </button>
             <button
              onClick={onClose}
              className="flex w-full justify-center rounded-md bg-slate-700 px-4 py-3 text-sm font-semibold leading-6 text-slate-300 shadow-sm hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 transition"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
       <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: #334155;
                border-radius: 10px;
                border: 3px solid transparent;
            }
        `}</style>
    </div>
  );
};

export default PermissionsModal;
