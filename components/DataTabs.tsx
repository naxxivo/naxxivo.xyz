import React, { useState, ReactNode } from 'react';
import Icon from './Icon';

interface DataTabsProps {
    userId?: string;
}

const TABS = [
  { id: 'contacts', label: 'Contacts', icon: 'user-group' },
  { id: 'locations', label: 'Locations', icon: 'map-pin' },
  { id: 'media', label: 'Media', icon: 'photo' },
  { id: 'sms', label: 'SMS', icon: 'chat-bubble-left-right' },
  { id: 'calls', label: 'Call Logs', icon: 'phone' },
];

const ContactsDisplay: React.FC = () => <p>No contacts have been synced yet.</p>;
const LocationsDisplay: React.FC = () => <p>No location data has been recorded.</p>;
const MediaDisplay: React.FC = () => <p>Your synced photos and videos will appear here.</p>;
const SmsDisplay: React.FC = () => <p>You have no synced SMS messages.</p>;
const CallLogDisplay: React.FC = () => <p>Your call history is empty.</p>;

const TAB_CONTENT: Record<string, ReactNode> = {
    contacts: <ContactsDisplay />,
    locations: <LocationsDisplay />,
    media: <MediaDisplay />,
    sms: <SmsDisplay />,
    calls: <CallLogDisplay />,
};


const DataTabs: React.FC<DataTabsProps> = ({ userId }) => {
    const [activeTab, setActiveTab] = useState(TABS[0].id);

    // This component is now ready to fetch data for the given userId
    // For now, it continues to show placeholder content.
    
    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">Synced Data</h2>
            <div className="border-b border-slate-700">
              <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-sky-500 text-sky-400'
                        : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
                    } group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors`}
                  >
                    <Icon name={tab.icon} className={`${
                      activeTab === tab.id ? 'text-sky-500' : 'text-slate-500 group-hover:text-slate-300'
                    } -ml-0.5 mr-2 h-5 w-5`} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="mt-6 bg-slate-900/50 p-6 rounded-lg border border-slate-700 min-h-[150px] flex items-center justify-center text-slate-400">
                {TAB_CONTENT[activeTab]}
            </div>
        </div>
    );
};

export default DataTabs;
