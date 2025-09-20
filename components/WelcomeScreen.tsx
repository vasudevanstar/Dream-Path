import React, { useState } from 'react';
import { DreamPathLogo } from './Icons';

interface WelcomeScreenProps {
  onStart: (name: string, email: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please enter both your name and email.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    onStart(name.trim(), email.trim());
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center font-sans p-4">
      <div className="max-w-md w-full text-center glassmorphism p-6 sm:p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-white/20 text-white rounded-full flex items-center justify-center">
            <DreamPathLogo />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">Welcome to Dream Path</h1>
        <p className="text-md text-white/80 mt-2 mb-6">Your personal guide to post-12th education in India. Let's get started!</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-teal-300 focus:outline-none bg-white/10 text-white placeholder:text-white/60"
              aria-label="Name"
            />
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-teal-300 focus:outline-none bg-white/10 text-white placeholder:text-white/60"
              aria-label="Email"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full p-3 rounded-lg bg-teal-500 text-white font-bold hover:bg-teal-600 transition-colors shadow-lg"
          >
            Start Guiding Me
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeScreen;