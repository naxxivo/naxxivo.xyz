export interface Rank {
    name: string;
    baseXp: number;
    levels: number;
    levelXp: number;
    color: string;
    nextRankXp: number | null;
}

export interface RankInfo {
    rank: Rank;
    level: number;
    xpInLevel: number;
    xpForNextLevel: number;
    progress: number;
    isMaxRank: boolean;
}

const ranks: Rank[] = [
    { name: 'Bronze',       baseXp: 0,       levels: 5, levelXp: 100,  color: '#cd7f32', nextRankXp: 500 },
    { name: 'Silver',       baseXp: 500,      levels: 5, levelXp: 200,  color: '#c0c0c0', nextRankXp: 1500 },
    { name: 'Gold',         baseXp: 1500,     levels: 5, levelXp: 300,  color: '#ffd700', nextRankXp: 3000 },
    { name: 'Platinum',     baseXp: 3000,     levels: 5, levelXp: 400,  color: '#e5e4e2', nextRankXp: 5000 },
    { name: 'Diamond',      baseXp: 5000,     levels: 5, levelXp: 500,  color: '#b9f2ff', nextRankXp: 7500 },
    { name: 'Heroic',       baseXp: 7500,     levels: 5, levelXp: 750,  color: '#ff69b4', nextRankXp: 11250 },
    { name: 'Master',       baseXp: 11250,    levels: 5, levelXp: 1000, color: '#9400d3', nextRankXp: 16250 },
    { name: 'Grandmaster',  baseXp: 16250,    levels: 5, levelXp: 2000, color: '#ff4500', nextRankXp: 26250 },
    { name: 'Red Master',   baseXp: 26250,    levels: 5, levelXp: 3000, color: '#dc143c', nextRankXp: 41250 },
    { name: 'Devils Master',baseXp: 41250,    levels: 1, levelXp: 1,    color: '#4b0082', nextRankXp: null },
];

export const getRankInfo = (xp: number): RankInfo => {
    let userRank: Rank = ranks[0];
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (xp >= ranks[i].baseXp) {
            userRank = ranks[i];
            break;
        }
    }

    const isMaxRank = userRank.name === 'Devils Master';

    if (isMaxRank) {
        return {
            rank: userRank,
            level: 1,
            xpInLevel: xp - userRank.baseXp,
            xpForNextLevel: 1,
            progress: 100,
            isMaxRank: true,
        };
    }

    const xpIntoRank = xp - userRank.baseXp;
    const level = Math.floor(xpIntoRank / userRank.levelXp) + 1;
    const xpInLevel = xpIntoRank % userRank.levelXp;
    const progress = (xpInLevel / userRank.levelXp) * 100;
    
    return {
        rank: userRank,
        level: Math.min(level, userRank.levels), // Cap level at max for the rank
        xpInLevel,
        xpForNextLevel: userRank.levelXp,
        progress: Math.min(progress, 100),
        isMaxRank: false
    };
};

