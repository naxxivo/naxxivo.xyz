import React from 'react';
import { motion } from 'framer-motion';
import { getRankInfo } from '../../utils/ranking';

interface XPBarProps {
    xp: number;
}

const XPBar: React.FC<XPBarProps> = ({ xp }) => {
    const { rank, progress, xpInLevel, level, xpForNextLevel, isMaxRank } = getRankInfo(xp);

    const nextLevelXp = rank.baseXp + level * rank.levelXp;
    
    return (
        <div className="w-full">
            <div className="text-xs flex justify-between items-center mb-1 text-secondary-purple dark:text-dark-text/80">
                <span className="font-bold">{rank.name} Lvl. {level}</span>
                {!isMaxRank && (
                    <span className="opacity-80">
                        {xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
                    </span>
                )}
                 {isMaxRank && (
                    <span className="font-bold text-accent">MAX RANK</span>
                 )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-bg/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                <motion.div
                    className="h-2.5 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${rank.color}aa, ${rank.color}ff)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
};

export default XPBar;
