import React, { useState } from 'react';
import Input from './common/Input';
import Button from './common/Button';
import { supabase } from '../integrations/supabase/client';

interface LoginProps {
    setView: (view: 'welcome' | 'login' | 'signup') => void;
}

const LoginIllustration = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 mx-auto animate-float drop-shadow-lg">
        <path fill="#FFC700" d="M47.7,-64.1C61.7,-53.4,73,-38.8,76.5,-22.9C80,-7,75.7,10.1,68.4,24.9C61.1,39.7,50.7,52.2,37.8,61.9C24.9,71.5,9.5,78.3,-6.2,79.5C-21.9,80.7,-38,76.4,-51.2,67.3C-64.4,58.2,-74.7,44.4,-78.9,28.9C-83.1,13.4,-81.2,-3.8,-75,-19.1C-68.8,-34.4,-58.2,-47.8,-45.3,-58.2C-32.3,-68.6,-16.2,-76,1.2,-77.3C18.5,-78.5,37.1,-72.7,47.7,-64.1Z" transform="translate(100 100)" />
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="60" fill="#100F1F" fontFamily="Arial" fontWeight="bold">?</text>
    </svg>
);

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

    return (
        <div className="w-full max-w-md mx-auto">
             <div className="relative mb-6">
                <button onClick={() => setView('welcome')} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors" aria-label="Go back">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-center text-xl font-bold text-white">Login</h2>
            </div>
            
            <div className="text-center">
                <LoginIllustration />
                <h1 className="text-3xl font-bold text-white mt-4">Welcome back!</h1>
                <p className="text-gray-400 mt-2">Glad to see you again!</p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                />

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
                    rightElement={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-300 focus:outline-none" aria-label={showPassword ? "Hide password" : "Show password"}>
                            <EyeIcon open={!showPassword}/>
                        </button>
                    }
                />
                
                {error && <p className="text-red-500 text-sm text-center" role="alert">{error}</p>}
                
                <div className="text-right">
                    <a href="#" className="text-sm font-medium text-yellow-400 hover:text-yellow-300">
                        Forgot Password?
                    </a>
                </div>

                <div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Logging In...' : 'Login'}
                    </Button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                    Don't have an account?{' '}
                    <button onClick={() => setView('signup')} disabled={isLoading} className="font-medium text-yellow-400 hover:text-yellow-300 focus:outline-none disabled:opacity-50">
                        Register
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;