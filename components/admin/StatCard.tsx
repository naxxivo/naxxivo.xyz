import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => {
    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-lg flex items-center space-x-4 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="p-3 bg-accent/20 rounded-full">
                <Icon className="h-8 w-8 text-accent" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
