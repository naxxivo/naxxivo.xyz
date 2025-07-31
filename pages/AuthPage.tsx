

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

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      setLoading(false);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, username: username.toLowerCase(), name: name }] as any);
        if (profileError) {
          setError(`Account created, but failed to create profile. The username might be taken. Error: ${profileError.message}`);
        } else {
          alert('Account created! Please check your email to verify.');
          navigate('/', { replace: true });
        }
      }
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
            onClick={() => setIsLogin(true)}
            className={`font-display text-lg px-6 py-2 rounded-l-lg transition-all ${isLogin ? 'bg-accent text-white shadow-lg' : 'bg-gray-200 dark:bg-dark-bg text-secondary-purple dark:text-dark-text'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`font-display text-lg px-6 py-2 rounded-r-lg transition-all ${!isLogin ? 'bg-accent text-white shadow-lg' : 'bg-gray-200 dark:bg-dark-bg text-secondary-purple dark:text-dark-text'}`}
          >
            Sign Up
          </button>
        </div>
        <h2 className="text-3xl font-bold text-center mb-6 font-display from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300">
          {isLogin ? 'Welcome Back!' : 'Join NAXXIVO!'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <>
              <Input id="name" label="Display Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input id="username" label="Username (unique, lowercase, no spaces)" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required pattern="^[a-z0-9_]{3,20}$" title="Username must be 3-20 characters, lowercase, and can only contain letters, numbers, and underscores."/>
            </>
          )}
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="pt-4">
            <Button type="submit" text={loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')} disabled={loading} className="w-full" />
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default AuthPage;
