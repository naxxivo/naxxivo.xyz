
import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg text-center transform transition-transform hover:scale-105 hover:bg-slate-700 cursor-pointer">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
};

export default StatCard;
