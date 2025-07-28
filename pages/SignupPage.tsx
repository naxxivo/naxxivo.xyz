import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { LogoIcon } from '../components/icons/LogoIcon';
import { Spinner } from '../components/Spinner';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signup({
        name,
        email,
        password,
        passwordConfirm,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-surface rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="mt-4 text-3xl font-extrabold text-text-primary">Create your Account</h2>
          <p className="mt-2 text-text-secondary">Join Naxxivo to connect with others</p>
        </div>
        
        {error && <div className="bg-danger/20 text-danger p-3 rounded-md text-sm">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-text-secondary">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Password</label>
            <input
              id="password-signup"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Confirm Password</label>
            <input
              id="password-confirm"
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Repeat password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-opacity-50"
          >
            {loading ? <Spinner size="sm" /> : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};