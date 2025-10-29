
import React from 'react';
import type { Message, SearchFilters } from '../types';
import { UserIcon, DreamPathLogo, CareerIcon, SubjectsIcon, TipsIcon, TableIcon, FilterIcon } from './Icons';
import RecommendationCard from './RecommendationCard';
import ComparisonTable from './ComparisonTable';
import FilterPanel from './FilterPanel';

interface ChatBubbleProps {
  message: Message;
  onApplyFilters: (filters: SearchFilters) => void;
}

const parseRecommendation = (rawContent: string): { [key: string]: string } => {
  const lines = rawContent.trim().split('\n');
  const data: { [key: string]: string } = {};
  lines.forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      if (key && value) {
        data[key] = value;
      }
    }
  });
  return data;
};

const parseTable = (tableString: string): { headers: string[]; rows: string[][] } | null => {
    const lines = tableString.trim().split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) return null;

    const [headerLine, separatorLine, ...rowLines] = lines;

    if (!headerLine.includes('|') || !separatorLine.includes('-')) {
        return null;
    }

    const parseRow = (line: string) => line.split('|').map(s => s.trim()).slice(1, -1);

    const headers = parseRow(headerLine);
    if (headers.length === 0) return null;

    const rows = rowLines
        .map(parseRow)
        .filter(row => row.length === headers.length);

    if (rows.length === 0) return null;

    return { headers, rows };
};

const parseSearchFilters = (rawContent: string): SearchFilters | null => {
  try {
    const jsonString = rawContent.trim();
    const data = JSON.parse(jsonString);
    return data as SearchFilters;
  } catch (error) {
    console.error("Failed to parse search filters JSON:", error);
    return null;
  }
};


const getBotIcon = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('```search_filters')) {
      return <FilterIcon />;
    }
    if (text.includes('|') && text.includes('---')) {
        return <TableIcon />;
    }
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

const renderTextWithLinks = (text: string, keyPrefix: string) => {
  const linkClassName = "text-blue-500 dark:text-blue-400 underline hover:text-blue-600 dark:hover:text-blue-300 transition-colors";
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;

  const elements: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }
    const [fullMatch, mdText, mdUrl, plainUrl] = match;
    const url = mdUrl || plainUrl;
    const linkText = mdText || url;
    elements.push(
      <a href={url} key={`${keyPrefix}-${lastIndex}`} target="_blank" rel="noopener noreferrer" className={linkClassName}>
        {linkText}
      </a>
    );
    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return <>{elements}</>;
};

const renderContent = (text: string, onApplyFilters: (filters: SearchFilters) => void) => {
  const blockSplitRegex = /(```(?:recommendation|search_filters)[\s\S]*?```|(?:\n|^)(?:\|.*\|(?:\r?\n\|.*\|)+))/;
  const parts = text.split(blockSplitRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('```recommendation')) {
          const recommendationContent = part.replace(/```recommendation|```/g, '').trim();
          const recommendationData = parseRecommendation(recommendationContent);
          return <RecommendationCard key={`rec-${index}`} data={recommendationData} />;
        }

        if (part.startsWith('```search_filters')) {
          const filtersContent = part.replace(/```search_filters|```/g, '').trim();
          const filtersData = parseSearchFilters(filtersContent);
          if (filtersData) {
            return <FilterPanel key={`filter-${index}`} initialFilters={filtersData} onApply={onApplyFilters} />;
          }
        }

        if (part.trim().startsWith('|')) {
          const tableData = parseTable(part);
          if (tableData) {
            return <ComparisonTable key={`table-${index}`} headers={tableData.headers} rows={tableData.rows} />;
          }
        }

        return <React.Fragment key={`text-${index}`}>{renderTextWithLinks(part, `text-${index}`)}</React.Fragment>;
      })}
    </>
  );
};


const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onApplyFilters }) => {
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
        <div className="whitespace-pre-wrap">{renderContent(message.text, onApplyFilters)}</div>
      </div>
    </div>
  );
};

export default ChatBubble;
