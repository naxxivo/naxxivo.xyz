import React, { useState } from 'react';
import Icon from './Icon';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            setMessage('Check your email for the confirmation link!');
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        }
    } catch (error: any) {
        setError(error.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
        setError(error.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700 p-8">
        <h2 className="text-center text-3xl font-bold text-white mb-2">{isSignUp ? 'Create Account' : 'Welcome Back!'}</h2>
        <p className="text-center text-slate-400 mb-8">{isSignUp ? 'Join us!' : 'Sign in to continue'}</p>
        
        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        {message && (
            <div className="bg-sky-500/20 border border-sky-500 text-sky-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <span className="block sm:inline">{message}</span>
            </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon name="email" className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 bg-slate-700 py-3 pl-10 pr-3 text-white shadow-sm ring-1 ring-inset ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6 transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-300">
                Password
              </label>
               {!isSignUp && (<div className="text-sm">
                <a href="#" className="font-semibold text-sky-400 hover:text-sky-300">
                  Forgot password?
                </a>
              </div>)}
            </div>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon name="lock" className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 bg-slate-700 py-3 pl-10 pr-3 text-white shadow-sm ring-1 ring-inset ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-sky-500 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-8">
            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <button onClick={() => handleOAuthSignIn('google')} className="flex w-full items-center justify-center gap-3 rounded-md bg-slate-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 transition">
                    <Icon name="google" className="h-5 w-5" />
                    <span className="text-sm font-semibold leading-6">Google</span>
                </button>

                <button onClick={() => handleOAuthSignIn('github')} className="flex w-full items-center justify-center gap-3 rounded-md bg-slate-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 transition">
                    <Icon name="github" className="h-5 w-5" />
                    <span className="text-sm font-semibold leading-6">GitHub</span>
                </button>
            </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
            {isSignUp ? 'Already a member?' : 'Not a member?'}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('');}} className="ml-2 font-semibold leading-6 text-sky-400 hover:text-sky-300">
             {isSignUp ? 'Sign In' : 'Sign Up Now'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;