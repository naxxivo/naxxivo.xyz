
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/locales/en/pages/services/supabase';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/ui/PageTransition';
import { useAuth } from '@/App';
import { AnimeLoader } from '@/components/ui/Loader';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && auth.user) {
      navigate(`/profile/${auth.user.id}`, { replace: true });
    }
  }, [auth.loading, auth.user, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setGoogleLoading(true);
    setFacebookLoading(false);
    const { error } = await (supabase.auth as any).signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      setGoogleLoading(false);
    }
    // On success, Supabase handles the redirect, so no need to setLoading(false) here.
  };
  
  const handleFacebookLogin = async () => {
    setLoading(true);
    setFacebookLoading(true);
    setGoogleLoading(false);
    const { error } = await (supabase.auth as any).signInWithOAuth({
      provider: 'facebook',
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      setFacebookLoading(false);
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGoogleLoading(false);
    setFacebookLoading(false);
    setError(null);
    setMessage(null);

    if (isLogin) {
      const { error } = await (supabase.auth as any).signInWithPassword({ email, password });
      if (error) setError(error.message);
      // On success, the onAuthStateChange listener in App.tsx will handle navigation.
    } else {
      // Sign Up Flow
      if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        setError("Username must be 3-20 characters, lowercase, and can only contain letters, numbers, and underscores.");
        setLoading(false);
        return;
      }

      const { error } = await (supabase.auth as any).signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            username: username.toLowerCase(),
            photo_url: `https://api.dicebear.com/8.x/pixel-art/svg?seed=${username.toLowerCase() || 'default'}`
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Account created! Please check your email to verify your account.");
        // Don't navigate away, let the user see the success message.
        // We can switch to the login view so they can log in after verifying.
        setTimeout(() => setIsLogin(true), 3000);
      }
    }
    setLoading(false);
  };
  
  if (auth.loading || auth.user) {
    return <div className="flex justify-center items-center h-screen"><AnimeLoader /></div>;
  }

  return (
    <PageTransition>
      <div className="max-w-md mx-auto mt-10 bg-white/60 dark:bg-dark-card/70 backdrop-blur-lg p-8 rounded-2xl shadow-2xl shadow-primary-blue/20">
        <div className="flex justify-center mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
            className={`font-display text-lg px-6 py-2 rounded-l-lg transition-all ${isLogin ? 'bg-accent text-white shadow-lg' : 'bg-gray-200 dark:bg-dark-bg text-secondary-purple dark:text-dark-text'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
            className={`font-display text-lg px-6 py-2 rounded-r-lg transition-all ${!isLogin ? 'bg-accent text-white shadow-lg' : 'bg-gray-200 dark:bg-dark-bg text-secondary-purple dark:text-dark-text'}`}
          >
            Sign Up
          </button>
        </div>
        <h2 className="text-3xl font-bold text-center mb-6 font-display from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300">
          {isLogin ? "Welcome Back!" : "Join NAXXIVO!"}
        </h2>
        
        <div className="space-y-4">
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white dark:bg-dark-bg text-secondary-purple dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-card/50 flex items-center justify-center gap-3 py-2 px-4 rounded-lg shadow-md transition-colors font-semibold border border-gray-300 dark:border-gray-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.27-11.28-7.792l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,34.627,44,29.692,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                {googleLoading ? "Redirecting..." : (isLogin ? "Sign in with Google" : "Sign up with Google")}
            </button>
            
            <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={loading}
                className="w-full bg-[#1877F2] text-white hover:bg-[#166fe5] flex items-center justify-center gap-3 py-2 px-4 rounded-lg shadow-md transition-colors font-semibold border border-[#1877F2] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12z"/>
                </svg>
                {facebookLoading ? "Redirecting..." : (isLogin ? "Sign in with Facebook" : "Sign up with Facebook")}
            </button>


            <div className="flex items-center">
                <hr className="flex-grow border-gray-300 dark:border-gray-600"/>
                <span className="mx-4 text-gray-500 dark:text-gray-400 font-semibold text-sm">OR</span>
                <hr className="flex-grow border-gray-300 dark:border-gray-600"/>
            </div>
        </div>

        {message && <p className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 p-3 rounded-lg text-sm text-center my-4">{message}</p>}
        {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg text-sm text-center my-4">{error}</p>}
        
        <form onSubmit={handleAuth} className="space-y-6 mt-4">
          {!isLogin && (
            <>
              <Input id="name" label="Display Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
              <Input id="username" label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required pattern="^[a-z0-9_]{3,20}$" title="Username must be 3-20 characters, lowercase, and can only contain letters, numbers, and underscores." disabled={loading}/>
            </>
          )}
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading}/>
          <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} disabled={loading}/>
          
          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full">
                {loading && !googleLoading && !facebookLoading ? "Loading..." : (isLogin ? "Login with Email" : "Create Account with Email")}
            </Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default AuthPage;
