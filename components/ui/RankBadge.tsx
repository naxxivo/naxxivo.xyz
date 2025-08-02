import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { getRankInfo } from '../../utils/ranking';
import './RankBadge.css';

interface RankBadgeProps {
  xp: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  glowIntensity?: number;
}

const sizeClasses = {
  sm: { 
    wrapper: 'w-16 h-20', 
    shield: 'scale-[0.5]', 
    text: 'text-xs',
    iconSize: 'text-lg'
  },
  md: { 
    wrapper: 'w-24 h-30', 
    shield: 'scale-[0.8]', 
    text: 'text-sm',
    iconSize: 'text-2xl'
  },
  lg: { 
    wrapper: 'w-36 h-44', 
    shield: 'scale-[1.2]', 
    text: 'text-xl',
    iconSize: 'text-4xl'
  },
  xl: { 
    wrapper: 'w-48 h-56', 
    shield: 'scale-[1.6]', 
    text: 'text-2xl',
    iconSize: 'text-5xl'
  },
};

const rankIcons: Record<string, string> = {
  'Bronze': '🛡️',
  'Silver': '⚔️',
  'Gold': '🏅',
  'Platinum': '💎',
  'Diamond': '🔷',
  'Heroic': '⚡',
  'Master': '👑',
  'Grandmaster': '🏆',
  'Red Master': '🔥',
  'Devils Master': '😈'
};

const RankBadge: React.FC<RankBadgeProps> = ({ 
  xp, 
  size = 'md', 
  animated = true,
  glowIntensity = 1
}) => {
  const rankInfo = getRankInfo(xp);
  const { rank, level } = rankInfo;
  const { wrapper, shield, text, iconSize } = sizeClasses[size];
  const controls = useAnimation();
  const badgeRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  // Rank-specific effects
  const isDevilMaster = rank.name === "Devils Master";
  const isGrandmaster = rank.name === "Grandmaster";
  const isHeroic = rank.name === "Heroic";

  useEffect(() => {
    if (!animated) return;

    // Pulsing glow effect
    const pulseGlow = async () => {
      while (true) {
        await controls.start({
          boxShadow: [
            `0 0 ${10 * glowIntensity}px ${rank.color}`,
            `0 0 ${20 * glowIntensity}px ${rank.color}`,
            `0 0 ${10 * glowIntensity}px ${rank.color}`
          ],
          transition: { duration: 2, repeat: Infinity }
        });
      }
    };

    // Special effects for Devil Master
    if (isDevilMaster && animated) {
      const devilGlow = () => {
        const colors = ['#ff0000', '#8b0000', '#4b0082'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const intensity = Math.random() * 30 * glowIntensity + 20;
        
        if (badgeRef.current) {
          badgeRef.current.style.boxShadow = `0 0 ${intensity}px ${randomColor}`;
        }
        
        if (auraRef.current) {
          auraRef.current.style.background = `radial-gradient(circle, ${randomColor} 0%, transparent 70%)`;
        }
      };
      
      const interval = setInterval(devilGlow, 500);
      return () => clearInterval(interval);
    }

    pulseGlow();

    return () => {
      controls.stop();
    };
  }, [animated, controls, glowIntensity, isDevilMaster, rank.color]);

  const getShieldGradient = () => {
    if (isDevilMaster) {
      return (
        <linearGradient id={`grad-${rank.name}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="50%" stopColor="#8b0000" />
          <stop offset="100%" stopColor="#4b0082" />
        </linearGradient>
      );
    }

    if (isGrandmaster) {
      return (
        <linearGradient id={`grad-${rank.name}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff00ff" />
          <stop offset="100%" stopColor="#ff4500" />
        </linearGradient>
      );
    }

    return (
      <linearGradient id={`grad-${rank.name}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={rank.color} />
        <stop offset="100%" stopColor={`${rank.color}80`} />
      </linearGradient>
    );
  };

  const getShieldPattern = () => {
    if (rank.name === "Diamond") {
      return (
        <pattern id="diamond-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
          <path d="M0 0 L10 10 L20 0 L10 -10 Z" fill="#ffffff20" />
          <path d="M0 20 L10 10 L20 20 L10 30 Z" fill="#ffffff20" />
        </pattern>
      );
    }
    return null;
  };

  const getShieldEffects = () => {
    if (isHeroic) {
      return (
        <>
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
          <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
        </>
      );
    }
    return <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />;
  };

  return (
    <motion.div
      ref={badgeRef}
      className={`relative flex flex-col items-center justify-center ${wrapper} rank-badge-container`}
      whileHover={animated ? { scale: 1.05, rotateZ: 2 } : {}}
      title={`${rank.name} - Level ${level}\nTotal XP: ${xp}`}
      animate={controls}
      initial={{ scale: 0.9 }}
    >
      {/* Aura Effects */}
      {animated && (
        <>
          <div 
            ref={auraRef}
            className="absolute inset-0 aura-effect"
            style={{
              background: `radial-gradient(circle, ${rank.color} 0%, transparent 70%)`,
              opacity: 0.3,
              mixBlendMode: 'screen'
            }}
          />
          <div className="absolute inset-0 aura-particles" />
        </>
      )}

      {/* Shield Container */}
      <div className={`absolute inset-0 ${shield} shield-container`}>
        <svg 
          viewBox="0 0 100 120" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {getShieldGradient()}
            {getShieldPattern()}
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              {getShieldEffects()}
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {isDevilMaster && (
              <filter id="devil-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feColorMatrix
                  type="matrix"
                  values="1 0 0 0 0
                          0 0 0 0 0
                          0 0 0 0 0
                          0 0 0 1 0"
                  result="red-blur"
                />
                <feMerge>
                  <feMergeNode in="red-blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>

          {/* Shield Base */}
          <motion.path
            d="M50 0 L10 10 L10 60 C10 90, 50 120, 50 120 C50 120, 90 90, 90 60 L90 10 Z"
            fill={`url(#grad-${rank.name.replace(/\s+/g, '-')})`}
            stroke="#fff"
            strokeWidth={isDevilMaster ? 3 : 2}
            strokeOpacity="0.8"
            style={{ 
              filter: isDevilMaster ? 'url(#devil-glow)' : 'url(#glow)',
              transformOrigin: 'center'
            }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />

          {/* Shield Details */}
          {rank.name === "Diamond" && (
            <path
              d="M50 0 L10 10 L10 60 C10 90, 50 120, 50 120 C50 120, 90 90, 90 60 L90 10 Z"
              fill="url(#diamond-pattern)"
              stroke="none"
            />
          )}

          {isHeroic && (
            <path
              d="M30 30 L50 50 L70 30 L50 10 Z"
              fill="#ffffff80"
              stroke="#fff"
              strokeWidth="1"
            />
          )}

          {isGrandmaster && (
            <path
              d="M40 20 L60 20 L60 40 L40 40 Z"
              fill="#ffffff40"
              stroke="#fff"
              strokeWidth="1"
            />
          )}
        </svg>
      </div>

      {/* Badge Content */}
      <div className="relative z-10 text-center text-white flex flex-col items-center justify-center h-full w-full">
        <AnimatePresence>
          <motion.div
            key={`${rank.name}-${level}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className={`flex flex-col items-center ${text}`}
          >
            {rank.name !== "Devils Master" && (
              <>
                <motion.span 
                  className={`font-bold ${text} level-text`}
                  animate={{
                    textShadow: [
                      `0 0 5px ${rank.color}`,
                      `0 0 10px ${rank.color}`,
                      `0 0 5px ${rank.color}`
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {level}
                </motion.span>
                <motion.div 
                  className={`${iconSize} mt-1 icon`}
                  animate={
                    animated ? {
                      y: [0, -5, 0],
                      rotate: [0, 5, 0]
                    } : {}
                  }
                  transition={
                    animated ? {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : {}
                  }
                >
                  {rankIcons[rank.name]}
                </motion.div>
              </>
            )}

            {rank.name === "Devils Master" && (
              <motion.div 
                className={`${iconSize} devil-icon`}
                animate={
                  animated ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                    filter: [
                      'drop-shadow(0 0 5px #ff0000)',
                      'drop-shadow(0 0 15px #ff0000)',
                      'drop-shadow(0 0 5px #ff0000)'
                    ]
                  } : {}
                }
                transition={
                  animated ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  } : {}
                }
              >
                {rankIcons[rank.name]}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Particles */}
      {animated && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full particle"
              style={{
                backgroundColor: rank.color,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0
              }}
              animate={{
                y: [0, 120],
                opacity: [0, 0.8, 0],
                x: [0, (Math.random() - 0.5) * 20]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RankBadge;