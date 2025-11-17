import React, { useState } from 'react';
import Card from './Card';
import SparklesIcon from './icons/SparklesIcon';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setIsLoading(true);
      // Simulate a small delay for better UX, mimics network request
      setTimeout(() => {
        onLogin(email);
        // No need to set loading to false as the component will unmount
      }, 500);
    } else {
        setError('Please enter a valid email address.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 font-sans p-4">
      <Card className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <SparklesIcon className="w-12 h-12 text-primary-400 mb-2" />
          <h1 className="text-3xl font-bold text-white">SpendSmart AI</h1>
          <p className="text-gray-400">Your personal finance companion</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Loading...' : 'Login / Sign Up'}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
