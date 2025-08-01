


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PageTransition from '../components/ui/PageTransition';
import { useAuth } from '../App';
import { AnimeLoader } from '../components/ui/Loader';

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
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Loading..." : (isLogin ? "Login" : "Create Account")}
            </Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default AuthPage;