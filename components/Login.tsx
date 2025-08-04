import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from './common/Input';
import Button from './common/Button';
import { supabase } from '../integrations/supabase/client';
import { GoogleIcon, FacebookIcon, AbstractShape } from './common/Icons';

interface LoginProps {
    setView: (view: 'welcome' | 'login' | 'signup') => void;
}

const EyeIcon = ({ open }: { open: boolean }) => (
     open ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274 4.057 5.064 7 9.542 7 .847 0 1.673-.102 2.468-.292m-1.928 4.052a10.025 10.025 0 01-11.234-6.458m-6.458 11.234a10.025 10.025 0 016.458-11.234M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    )
);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const Login: React.FC<LoginProps> = ({ setView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            setError(error.message);
        }
        setIsLoading(false);
    };
    
    const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
        const { error } = await supabase.auth.signInWithOAuth({ provider });
        if (error) setError(error.message);
    };

    return (
        <div className="relative w-full max-w-md mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 overflow-hidden">
            <AbstractShape />
             <div className="relative z-10">
                <div className="relative mb-6">
                    <button onClick={() => setView('welcome')} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors" aria-label="Go back">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-center text-xl font-bold text-white">Login</h2>
                </div>
                
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div className="space-y-4" variants={itemVariants}>
                        <Button onClick={() => handleOAuthLogin('google')} variant="secondary" className="flex items-center gap-3">
                            <GoogleIcon /> Continue with Google
                        </Button>
                        <Button onClick={() => handleOAuthLogin('facebook')} variant="secondary" className="flex items-center gap-3 bg-[#1877F2] !text-white !border-[#1877F2] hover:bg-[#1877F2]/90">
                            <FacebookIcon /> Continue with Facebook
                        </Button>
                    </motion.div>
                    
                    <motion.div className="relative py-4" variants={itemVariants}>
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-[#2a2942]/50 text-gray-400 rounded-full">OR</span></div>
                    </motion.div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <motion.div variants={itemVariants}>
                            <Input
                                id="email"
                                label="Email Address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="!bg-black/20 focus:!ring-yellow-400 border !border-white/20"
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Input
                                id="password"
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="!bg-black/20 focus:!ring-yellow-400 border !border-white/20"
                                rightElement={
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-200 focus:outline-none" aria-label={showPassword ? "Hide password" : "Show password"}>
                                        <EyeIcon open={!showPassword}/>
                                    </button>
                                }
                            />
                        </motion.div>
                        
                        {error && <p className="text-red-400 text-sm text-center" role="alert">{error}</p>}
                        
                        <motion.div className="text-right" variants={itemVariants}>
                            <a href="#" className="text-sm font-medium text-yellow-400 hover:text-yellow-300">
                                Forgot Password?
                            </a>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Logging In...' : 'Login'}
                            </Button>
                        </motion.div>
                    </form>

                    <motion.div className="mt-6 text-center" variants={itemVariants}>
                        <p className="text-sm text-gray-300">
                            Don't have an account?{' '}
                            <button onClick={() => setView('signup')} disabled={isLoading} className="font-medium text-yellow-400 hover:text-yellow-300 focus:outline-none disabled:opacity-50">
                                Register
                            </button>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
