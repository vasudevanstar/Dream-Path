import React from 'react';
import type { Message } from '../types';
import { UserIcon, DreamPathLogo, CareerIcon, SubjectsIcon, TipsIcon } from './Icons';
import RecommendationCard from './RecommendationCard';

interface ChatBubbleProps {
  message: Message;
}

const parseRecommendation = (rawContent: string): { [key: string]: string } => {
  const lines = rawContent.trim().split('\n');
  const data: { [key: string]: string } = {};
  lines.forEach((line) => {
    const parts = line.split(/:(.*)/s);
    if (parts.length === 2) {
      const key = parts[0].trim();
      const value = parts[1].trim();
      data[key] = value;
    }
  });
  return data;
};

const getBotIcon = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('college') || lowerText.includes('career') || lowerText.includes('course') || lowerText.includes('recommendation')) {
        return <CareerIcon />;
    }
    if (lowerText.includes('subject') || lowerText.includes('stream') || lowerText.includes('marks')) {
        return <SubjectsIcon />;
    }
    if (lowerText.includes('tip') || lowerText.includes('skill') || lowerText.includes('scholarship')) {
        return <TipsIcon />;
    }
    return <DreamPathLogo />;
};


const renderContent = (text: string) => {
  const linkClassName = "text-blue-500 dark:text-blue-400 underline hover:text-blue-600 dark:hover:text-blue-300 transition-colors";

  const combinedRegex = /```recommendation([\s\S]*?)```|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
  
  const elements: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
    }
    
    const [fullMatch, recommendationContent, mdText, mdUrl, plainUrl] = match;

    if (recommendationContent) {
      const recommendationData = parseRecommendation(recommendationContent);
      elements.push(
        <RecommendationCard key={`rec-${lastIndex}`} data={recommendationData} />
      );
    } else if (mdText && mdUrl) {
      elements.push(
        <a href={mdUrl} key={`mdlink-${lastIndex}`} target="_blank" rel="noopener noreferrer" className={linkClassName}>
          {mdText}
        </a>
      );
    } else if (plainUrl) {
      elements.push(
        <a href={plainUrl} key={`plainlink-${lastIndex}`} target="_blank" rel="noopener noreferrer" className={linkClassName}>
          {plainUrl}
        </a>
      );
    }
    
    lastIndex = match.index + fullMatch.length;
  }
  
  if (lastIndex < text.length) {
    elements.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
  }
  
  return <>{elements}</>;
};


const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end animate-fade-in-up">
        <div
          className="max-w-lg rounded-2xl p-4 bg-teal-500 text-white font-medium shadow-lg"
          style={{
             borderRadius: '20px 20px 4px 20px',
          }}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-500/50 flex items-center justify-center text-white">
          <UserIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 justify-start animate-fade-in-up">
       <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/30 dark:bg-slate-900/50 flex items-center justify-center text-white">
        {getBotIcon(message.text)}
      </div>
      <div
        className="max-w-lg rounded-2xl p-4 bg-white/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 shadow-lg ring-1 ring-black ring-opacity-5"
        style={{
          borderRadius: '20px 20px 20px 4px',
        }}
      >
        <div className="whitespace-pre-wrap">{renderContent(message.text)}</div>
      </div>
    </div>
  );
};

export default ChatBubble;