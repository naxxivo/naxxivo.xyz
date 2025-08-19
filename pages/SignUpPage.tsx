import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const SignUpPage: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage('');
        setLoading(true);
        try {
            await signUp(email, password, fullName);
            setMessage('Registration successful! Please check your email to confirm your account.');
        } catch (err: any) {
            setError(err.message || 'Failed to sign up.');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-accent p-8 rounded-lg border border-gray-200 dark:border-slate-800">
                    <h1 className="text-3xl font-bold font-display text-center mb-6">Create Account</h1>
                    {message ? (
                        <div className="bg-emerald-100 border border-emerald-400 text-emerald-700 dark:bg-emerald-900/50 dark:border-emerald-500 dark:text-emerald-300 px-4 py-3 rounded-md text-center">
                            <p className="font-bold">Success!</p>
                            <p className="text-sm">{message}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-500 dark:text-red-300 px-4 py-3 rounded-md" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-800 dark:text-text-primary" htmlFor="fullName">Full Name</label>
                                <input 
                                    id="fullName"
                                    type="text" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className={inputClasses} 
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800 dark:text-text-primary" htmlFor="email">Email Address</label>
                                <input 
                                    id="email"
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClasses} 
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
                                    className={inputClasses} 
                                    required
                                    placeholder="6+ characters"
                                />
                            </div>
                            <div>
                                <button type="submit" disabled={loading} className="w-full bg-primary text-background dark:text-white font-semibold py-3 px-6 rounded-md hover:bg-yellow-600 transition disabled:bg-primary/50 disabled:cursor-not-allowed">
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </div>
                        </form>
                    )}
                    <p className="text-center text-sm text-gray-600 dark:text-text-muted mt-6">
                        Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;