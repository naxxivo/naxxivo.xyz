import React, { useState } from 'react';
import Input from './common/Input';
import Button from './common/Button';
import { supabase } from '../integrations/supabase/client';

interface SignupProps {
    setView: (view: 'welcome' | 'login' | 'signup') => void;
}

const SignupIllustration = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 mx-auto animate-float drop-shadow-lg">
      <path fill="#FFC700" d="M57.4,-57.4C71.3,-45.3,77.3,-26.8,76.5,-9.5C75.7,7.9,68,23.1,57.1,38.1C46.2,53.1,32.1,67.9,15.7,73.8C-0.7,79.7,-19.4,76.7,-35.8,68.6C-52.2,60.5,-66.3,47.3,-72.6,30.9C-78.9,14.5,-77.4,-5.2,-69.5,-20.5C-61.7,-35.9,-47.5,-46.9,-33.2,-55.8C-18.8,-64.7,-4.3,-71.5,10.6,-71.4C25.5,-71.3,43.5,-69.5,57.4,-57.4Z" transform="translate(100 100)" />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="60" fill="#100F1F" fontFamily="Arial" fontWeight="bold">!</text>
    </svg>
);


const EyeIcon = ({open}: {open: boolean}) => (
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
)

const Signup: React.FC<SignupProps> = ({ setView }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);
        
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                }
            }
        });

        if (error) {
            setError(error.message);
        } else if (data.user) {
            setMessage("Registration successful! Please check your email to confirm your account.");
            setName('');
            setEmail('');
            setPassword('');
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
                <h2 className="text-center text-xl font-bold text-white">Register</h2>
            </div>

            <div className="text-center">
                <SignupIllustration />
                <h1 className="mt-4 text-3xl font-bold text-white">
                    Name Yourself!
                </h1>
                 <p className="mt-2 text-center text-sm text-gray-400 max-w-xs mx-auto">
                    This will be the name that appears on the NAXXIVO platform.
                </p>
            </div>

            <div className="mt-8">
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    {message ? (
                        <p className="text-green-400 text-center bg-green-500/10 py-3 rounded-lg" role="status">{message}</p>
                    ) : (
                        <>
                            <Input
                                id="name"
                                label="Your Name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                            />
                            <Input
                                id="email-signup"
                                label="Email address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                            <Input
                                id="password-signup"
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
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
                        </>
                    )}


                    <div className="pt-2">
                        <Button type="submit" disabled={isLoading || !!message}>
                            {isLoading ? 'Creating Account...' : 'Complete Registration'}
                        </Button>
                    </div>
                </form>

                 <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Already a member?{' '}
                        <button onClick={() => setView('login')} disabled={isLoading} className="font-medium text-yellow-400 hover:text-yellow-300 focus:outline-none disabled:opacity-50">
                            Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;