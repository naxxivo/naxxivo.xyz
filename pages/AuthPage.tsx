
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PageTransition from '../components/ui/PageTransition';
import { useAuth } from '../App';
import { AnimeLoader } from '../components/ui/Loader';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.06-6.06C9.642,6.053,5.16,8.261,3.064,12.238l6.06,6.06C9.366,16.591,8.06,15.68,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.16,0,9.86-1.977,13.205-5.231l-5.657-5.657c-1.841,1.233-4.142,2.022-6.548,2.022 c-4.743,0-8.812-2.825-10.36-6.732l-6.228,6.228C9.86,40.023,16.45,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.447-2.257,4.517-4.174,5.965 l5.657,5.657C38.216,36.25,44,30.867,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && auth.user) {
      navigate(`/profile/${auth.user.id}`, { replace: true });
    }
  }, [auth.loading, auth.user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      // On success, the onAuthStateChange listener in App.tsx will handle navigation.
    } else {
      // Sign Up Flow
      const { error } = await supabase.auth.signUp({
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
        setMessage('Account created! Please check your email to verify your account.');
        // Don't navigate away, let the user see the success message.
        // We can switch to the login view so they can log in after verifying.
        setTimeout(() => setIsLogin(true), 3000);
      }
    }
    setLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });
    if (error) {
        setError(error.message);
        setLoading(false);
    }
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
          {isLogin ? 'Welcome Back!' : 'Join NAXXIVO!'}
        </h2>
        
        {message && <p className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 p-3 rounded-lg text-sm text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg text-sm text-center mb-4">{error}</p>}
        
        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <>
              <Input id="name" label="Display Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input id="username" label="Username (unique, lowercase, no spaces)" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required pattern="^[a-z0-9_]{3,20}$" title="Username must be 3-20 characters, lowercase, and can only contain letters, numbers, and underscores."/>
            </>
          )}
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          
          <div className="pt-4">
            <Button type="submit" text={loading ? 'Loading...' : (isLogin ? 'Login' : 'Create Account')} disabled={loading} className="w-full" />
          </div>
        </form>

        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-400 dark:border-gray-500"></div>
            <span className="flex-shrink mx-4 text-sm text-secondary-purple/80 dark:text-dark-text/80">OR</span>
            <div className="flex-grow border-t border-gray-400 dark:border-gray-500"></div>
        </div>

        <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-secondary-purple bg-white dark:bg-dark-bg dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue dark:focus:ring-offset-dark-card transition-all disabled:opacity-50"
        >
            <GoogleIcon />
            Sign in with Google
        </button>
      </div>
    </PageTransition>
  );
};

export default AuthPage;
