
import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import Button from '../common/Button';
import Logo from '../common/Logo';
import { BackArrowIcon, GoogleIcon, FacebookIcon } from '../common/AppIcons';
import Input from '../common/Input';

interface AuthFormProps {
    mode: 'login' | 'signup';
    onSetMode: (mode: 'onboarding' | 'login' | 'signup') => void;
}

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

    const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
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
        <div className="min-h-screen bg-white flex flex-col p-6">
            <header className="flex items-center">
                <button onClick={() => onSetMode('onboarding')} className="text-gray-600 hover:text-gray-900">
                    <BackArrowIcon />
                </button>
            </header>

            <main className="flex-grow flex flex-col justify-center w-full max-w-sm mx-auto">
                <div className="text-center mb-10">
                    <Logo />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    {isSignUp ? "Create your Account" : "Welcome Back!"}
                </h1>

                {message ? (
                     <div className="text-green-700 bg-green-100 p-4 rounded-lg my-4 text-center">
                        <p className="font-semibold">Success!</p>
                        <p>{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isSignUp && (
                            <>
                                <Input id="name" label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} required disabled={loading} />
                                <Input id="username" label="Username" type="text" value={username} onChange={e => setUsername(e.target.value)} required disabled={loading} />
                            </>
                        )}
                        <Input id="email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} autoComplete="email" />
                        <Input id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} autoComplete={isSignUp ? "new-password" : "current-password"} />

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <div className="pt-2">
                             <Button type="submit" disabled={loading} variant="primary">
                                {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
                            </Button>
                        </div>
                    </form>
                )}

                {!message && (
                    <>
                        <div className="relative flex py-5 items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-sm">Or continue with</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <Button
                                onClick={() => handleOAuthSignIn('google')}
                                variant="secondary"
                                size="large"
                                className="w-full"
                                disabled={loading}
                            >
                                <GoogleIcon className="mr-2"/>
                                Google
                            </Button>
                            <Button
                                onClick={() => handleOAuthSignIn('facebook')}
                                variant="secondary"
                                size="large"
                                className="w-full bg-[#1877F2] hover:bg-[#166eeb] text-white border-[#1877F2] hover:border-[#166eeb]"
                                disabled={loading}
                            >
                                <FacebookIcon className="mr-2"/>
                                Facebook
                            </Button>
                        </div>
                    </>
                )}

                <p className="mt-8 text-center text-sm text-gray-500">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                    <button onClick={toggleMode} className="font-semibold text-violet-600 hover:underline">
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </main>
        </div>
    );
};

export default AuthForm;
