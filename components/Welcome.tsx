import React from 'react';
import Button from './common/Button';
import { supabase } from '../integrations/supabase/client';
import { GoogleIcon, FacebookIcon, AbstractShape } from './common/Icons';

interface WelcomeProps {
    setView: (view: 'welcome' | 'login' | 'signup') => void;
}

const Welcome: React.FC<WelcomeProps> = ({ setView }) => {

    const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
        });
        if (error) console.error(`Error logging in with ${provider}:`, error.message);
    };

    return (
        <div className="relative w-full max-w-md mx-auto text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 overflow-hidden">
            <AbstractShape />
            <div className="relative z-10">
                <h1 className="text-4xl font-bold text-white">Welcome to NAXXIVO</h1>
                <p className="text-gray-300 mt-4 max-w-xs mx-auto">
                    Join the community, connect with friends, and share your moments.
                </p>
                <div className="mt-12 space-y-4">
                    <Button onClick={() => handleOAuthLogin('google')} variant="secondary" className="flex items-center gap-3">
                        <GoogleIcon /> Continue with Google
                    </Button>
                    <Button onClick={() => handleOAuthLogin('facebook')} variant="secondary" className="flex items-center gap-3 bg-[#1877F2] !text-white !border-[#1877F2] hover:bg-[#1877F2]/90">
                        <FacebookIcon /> Continue with Facebook
                    </Button>
                     <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#2a2942]/50 text-gray-400 rounded-full">OR</span>
                        </div>
                    </div>
                    <Button onClick={() => setView('signup')}>Continue with Email</Button>
                </div>
                <div className="mt-6">
                     <p className="text-sm text-gray-400">
                        Already have an account?{' '}
                        <button onClick={() => setView('login')} className="font-medium text-yellow-400 hover:text-yellow-300 focus:outline-none">
                            Log In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Welcome;
