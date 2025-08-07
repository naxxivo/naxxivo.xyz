import React from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Logo from '../common/Logo';

interface AuthPageProps {
  onSetMode: (mode: 'login' | 'signup') => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const CompassIcon = () => (
    <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        {...{
            initial: "hidden",
            animate: "visible",
            variants: {
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.5 } }
            }
        } as any}
    >
        <motion.circle
            cx="100" cy="100" r="90"
            stroke="var(--theme-primary)"
            strokeWidth="4"
            fill="transparent"
            {...{ variants: { hidden: { pathLength: 0 }, visible: { pathLength: 1, transition: { duration: 1 } } } } as any}
        />
        <motion.g
            {...{
                initial: { scale: 0 },
                animate: { scale: 1 },
                transition: { type: 'spring', stiffness: 260, damping: 20, delay: 1 }
            } as any}
        >
            <path d="M100 20 L110 90 L100 110 L90 90 Z" fill="var(--theme-primary)" />
            <path d="M100 180 L110 110 L100 90 L90 110 Z" fill="var(--theme-text-secondary)" />
            <circle cx="100" cy="100" r="8" fill="var(--theme-primary)" />
        </motion.g>
    </motion.svg>
);


const AuthPage: React.FC<AuthPageProps> = ({ onSetMode }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
        <motion.div
            {...{
                variants: containerVariants,
                initial: "hidden",
                animate: "visible"
            } as any}
            className="w-full max-w-sm flex flex-col items-center justify-center p-8 rounded-3xl bg-[var(--theme-card-bg)]/60 backdrop-blur-lg shadow-2xl border border-white/20"
        >
            <motion.div {...{ variants: itemVariants } as any} className="mb-6">
                <Logo />
            </motion.div>

            <motion.div {...{ variants: itemVariants } as any} className="my-8">
                <CompassIcon />
            </motion.div>
            
            <motion.div {...{ variants: itemVariants } as any} className="text-center mb-8">
                <h1 className="text-4xl font-bold text-[var(--theme-text)]">Hello!</h1>
                <p className="text-[var(--theme-text-secondary)] mt-2 max-w-xs">
                    Best place to write life stories and share your journey experiences
                </p>
            </motion.div>

            <motion.div {...{ variants: itemVariants } as any} className="w-full space-y-3">
                <Button variant="primary" onClick={() => onSetMode('login')}>LOGIN</Button>
                <Button variant="secondary" onClick={() => onSetMode('signup')}>SIGNUP</Button>
            </motion.div>
        </motion.div>
    </div>
  );
};

export default AuthPage;