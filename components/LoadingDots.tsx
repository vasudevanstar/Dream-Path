import React from 'react';
import { DreamPathLogo } from './Icons';

const LoadingDots: React.FC = () => {
  return (
    <div className="flex items-start gap-3 justify-start animate-fade-in-up">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/30 dark:bg-slate-900/50 flex items-center justify-center text-white">
            <DreamPathLogo />
        </div>
        <div
            className="max-w-lg rounded-2xl p-4 shadow-lg flex items-center space-x-3 bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500 animate-gradient text-white"
            style={{
                borderRadius: '20px 20px 20px 4px',
                backgroundSize: '400% 400%',
            }}
        >
            <div className="animate-pulse flex-shrink-0">
              <DreamPathLogo />
            </div>
            <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 bg-white/70 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-white/70 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-white/70 rounded-full animate-bounce"></span>
            </div>
        </div>
    </div>
  );
};

export default LoadingDots;