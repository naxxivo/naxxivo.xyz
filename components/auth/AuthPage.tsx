import React from 'react';
import Button from '../common/Button';
import Logo from '../common/Logo';

interface AuthPageProps {
  onSetMode: (mode: 'login' | 'signup') => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSetMode }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--theme-bg)]">
        <div
            className="w-full max-w-sm text-center bg-[var(--theme-card-bg)] p-8 rounded-2xl shadow-lg border border-[var(--theme-secondary)]"
        >
            <div className="mb-6">
                <Logo />
            </div>
            
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-[var(--theme-text)]">Level Up Your Social Life</h1>
                <p className="text-[var(--theme-text-secondary)] mt-2">
                    Connect with fellow gamers, share epic moments, and conquer the leaderboards.
                </p>
            </div>

            <div className="w-full space-y-3">
                <Button variant="primary" onClick={() => onSetMode('login')}>Login</Button>
                <Button variant="secondary" onClick={() => onSetMode('signup')}>Sign Up</Button>
            </div>
        </div>
    </div>
  );
};

export default AuthPage;