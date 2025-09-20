import React from 'react';
import { SendIcon, MicrophoneIcon } from './Icons';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  showStreamButtons: boolean;
  onStreamSelect: (stream: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSubmit,
  isLoading,
  showStreamButtons,
  onStreamSelect,
  isListening,
  onToggleListening,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        onSubmit(e as any);
      }
    }
  };

  const streamButtons = ['Science', 'Commerce', 'Arts'];

  return (
    <div className="bg-transparent pb-4">
      {showStreamButtons && (
        <div className="px-4 pb-3 flex flex-wrap justify-center items-center gap-3">
          {streamButtons.map((stream) => (
            <button
              key={stream}
              onClick={() => onStreamSelect(stream)}
              disabled={isLoading}
              className="px-6 py-3 bg-white/20 text-white rounded-full text-sm font-semibold hover:bg-white/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
            >
              {stream}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={onSubmit} className="flex items-center gap-3 px-4">
        <div className="flex-1 relative">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell me about your subjects..."
                className="w-full p-4 pr-24 border-none rounded-xl focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none transition-shadow bg-white/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-lg"
                rows={1}
                disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={onToggleListening}
                  disabled={isLoading}
                  className={`p-2 rounded-full text-white transition-colors ${
                    isListening
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-teal-500 hover:bg-teal-600'
                  } disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed`}
                  aria-label={isListening ? 'Stop listening' : 'Start listening'}
                >
                  <MicrophoneIcon />
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 rounded-full bg-teal-500 text-white hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;