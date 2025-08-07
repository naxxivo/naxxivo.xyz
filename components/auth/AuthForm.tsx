import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import Button from '../common/Button';
import { BackArrowIcon, GoogleIcon, FacebookIcon, AppleIcon } from '../common/AppIcons';
import Input from '../common/Input';
import { motion } from 'framer-motion';

interface AuthFormProps {
    mode: 'login' | 'signup';
    onSetMode: (mode: 'onboarding' | 'login' | 'signup') => void;
}

const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};


const AuthForm: React.FC<AuthFormProps> = ({ mode, onSetMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const isSignUp = mode === 'signup';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        if (isSignUp) {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name, username, photo_url: `https://api.dicebear.com/8.x/adventurer/svg?seed=${username}` },
                },
            });
            if (signUpError) {
                setError(signUpError.message);
            } else if (data.user) {
                setMessage("Registration successful! Please check your email to confirm your account.");
            }
        } else {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError) {
                setError(signInError.message);
            }
        }
        setLoading(false);
    };

    const handleOAuthSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const toggleMode = () => {
        onSetMode(isSignUp ? 'login' : 'signup');
        setError(null);
        setMessage(null);
    };

    return (
        <div className="min-h-screen w-full text-[var(--theme-text)] flex flex-col justify-center items-center p-4">
             <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-[var(--theme-card-bg)]/80 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl border border-white/20 flex flex-col"
            >
                <motion.header variants={itemVariants} className="flex items-center p-6">
                    <button onClick={() => onSetMode('onboarding')} className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]">
                        <BackArrowIcon />
                    </button>
                </motion.header>

                <main className="flex-grow flex flex-col justify-center px-8 pb-8">
                    <motion.div variants={itemVariants} className="text-left mb-8">
                        <h1 className="text-4xl font-bold text-[var(--theme-text)]">
                            {isSignUp ? "Hi!" : "Welcome!"}
                        </h1>
                        <p className="text-[var(--theme-text-secondary)] mt-1">
                            {isSignUp ? "Create a new account" : "Sign in to continue"}
                        </p>
                    </motion.div>

                    {message ? (
                        <motion.div variants={itemVariants} className="text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 p-4 rounded-lg my-4 text-center">
                            <p className="font-semibold">Success!</p>
                            <p>{message}</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {isSignUp && (
                                <>
                                    <motion.div variants={itemVariants}><Input id="name" label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} required disabled={loading} /></motion.div>
                                    <motion.div variants={itemVariants}><Input id="username" label="Username" type="text" value={username} onChange={e => setUsername(e.target.value)} required disabled={loading} /></motion.div>
                                </>
                            )}
                            <motion.div variants={itemVariants}><Input id="email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} autoComplete="email" /></motion.div>
                            <motion.div variants={itemVariants}><Input id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} autoComplete={isSignUp ? "new-password" : "current-password"} /></motion.div>
                            
                            {!isSignUp && <motion.a variants={itemVariants} href="#" className="block text-right text-sm text-[var(--theme-primary)] hover:underline">Forgot Password?</motion.a>}

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <motion.div variants={itemVariants} className="pt-2">
                                <Button type="submit" disabled={loading} variant="primary">
                                    {loading ? "Processing..." : (isSignUp ? "SIGN UP" : "LOGIN")}
                                </Button>
                            </motion.div>
                        </form>
                    )}

                    {!message && (
                        <>
                            <motion.div variants={itemVariants} className="relative flex py-6 items-center">
                                <div className="flex-grow border-t border-[var(--theme-input-border)]"></div>
                                <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
                                <div className="flex-grow border-t border-[var(--theme-input-border)]"></div>
                            </motion.div>
                            
                            <motion.div variants={itemVariants} className="text-center text-sm text-[var(--theme-text-secondary)] mb-4">{isSignUp ? 'Signup with' : 'Login with'}</motion.div>
                            <motion.div variants={itemVariants} className="flex items-center justify-center space-x-4">
                                <motion.button whileTap={{ scale: 0.95 }} whileHover={{y:-2}} onClick={() => handleOAuthSignIn('google')} disabled={loading} className="w-14 h-14 flex items-center justify-center rounded-2xl border border-[var(--theme-input-border)] hover:bg-[var(--theme-secondary)]"><GoogleIcon /></motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} whileHover={{y:-2}} onClick={() => handleOAuthSignIn('facebook')} disabled={loading} className="w-14 h-14 flex items-center justify-center rounded-2xl border border-[var(--theme-input-border)] hover:bg-[var(--theme-secondary)]"><FacebookIcon /></motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} whileHover={{y:-2}} onClick={() => handleOAuthSignIn('apple')} disabled={loading} className="w-14 h-14 flex items-center justify-center rounded-2xl border border-[var(--theme-input-border)] hover:bg-[var(--theme-secondary)]"><AppleIcon /></motion.button>
                            </motion.div>
                        </>
                    )}
                </main>

                <motion.footer variants={itemVariants} className="text-center text-sm text-[var(--theme-text-secondary)] p-6 border-t border-white/10">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                    <button onClick={toggleMode} className="font-semibold text-[var(--theme-primary)] hover:underline">
                        {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                </motion.footer>
            </motion.div>
        </div>
    );
};

export default AuthForm;