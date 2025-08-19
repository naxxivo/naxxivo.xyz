
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            navigate('/profile');
        } catch (err: any) {
            setError(err.message || 'Failed to log in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-accent p-8 rounded-lg border border-gray-200 dark:border-slate-800">
                    <h1 className="text-3xl font-bold font-display text-center mb-6">Sign In</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-500 dark:text-red-300 px-4 py-3 rounded-md" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-800 dark:text-text-primary" htmlFor="email">Email Address</label>
                            <input 
                                id="email"
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-800 dark:text-text-primary" htmlFor="password">Password</label>
                            <input 
                                id="password"
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                        </div>
                        <div>
                            <button type="submit" disabled={loading} className="w-full bg-primary text-background dark:text-white font-semibold py-3 px-6 rounded-md hover:bg-yellow-600 transition disabled:bg-primary/50 disabled:cursor-not-allowed">
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-sm text-gray-600 dark:text-text-muted mt-6">
                        Don't have an account? <Link to="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;