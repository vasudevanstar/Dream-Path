import React from 'react';
import { CheckmarkIcon } from './Icons';

interface SidePanelProps {
    steps: string[];
    currentStep: number;
}

const SidePanel: React.FC<SidePanelProps> = ({ steps, currentStep }) => {
    return (
        <aside className="hidden md:block w-72 p-6 glassmorphism border-r border-white/10">
            <h2 className="text-lg font-bold text-white mb-6">Your Guidance Journey</h2>
            <ul className="space-y-4">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;

                    return (
                        <li key={index} className="flex items-center gap-4">
                            <div className={`
                                h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm
                                ${isCompleted ? 'bg-teal-500 text-white' : ''}
                                ${isActive ? 'bg-white text-blue-600 ring-4 ring-white/50' : ''}
                                ${!isCompleted && !isActive ? 'bg-white/20 text-white/70' : ''}
                                transition-all duration-300
                            `}>
                                {isCompleted ? <CheckmarkIcon /> : index + 1}
                            </div>
                            <span className={`
                                font-semibold
                                ${isActive ? 'text-white' : 'text-white/70'}
                                transition-colors duration-300
                            `}>
                                {step}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};

export default SidePanel;