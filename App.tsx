import React, { useState, useEffect, useRef } from 'react';
import type { Message } from './types';
import ChatBubble from './components/ChatBubble';
import ChatInput from './components/ChatInput';
import LoadingDots from './components/LoadingDots';
import { DreamPathLogo, RefreshIcon, LogoutIcon, SpeakerOnIcon, SpeakerOffIcon } from './components/Icons';
import ai from './services/geminiService';
import { SYSTEM_INSTRUCTION } from './constants';
import { Chat, Content } from '@google/genai';
import ThemeToggle from './components/ThemeToggle';
import WelcomeScreen from './components/WelcomeScreen';
import SidePanel from './components/SidePanel';

const APP_STORAGE_KEY_HISTORY = 'dream-path-chat-history';
const APP_STORAGE_KEY_PROFILE = 'dream-path-user-profile';

// For browsers that still prefix the API
declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStreamButtons, setShowStreamButtons] = useState(true);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);

  const steps = [
    'Choose Stream',
    'Career Options',
    'College Recommendations',
    'Future Scope',
  ];
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);


  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const startNewChat = (name: string) => {
    window.speechSynthesis.cancel();
    localStorage.removeItem(APP_STORAGE_KEY_HISTORY);
    setCurrentStep(0);
    
    const personalizedInstruction = SYSTEM_INSTRUCTION.replace(/{userName}/g, name);
    
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: personalizedInstruction,
      },
    });

    setMessages([
      {
        id: 'init',
        role: 'model',
        text: `Hi ${name}! I'm Dream Path, your AI career guide. I'm here to help you explore college and course options after your 12th grade. To get started, could you please tell me which stream you were in? 🤔\n\nYou can choose from Science, Commerce, or Arts below.`,
      },
    ]);
    setInput('');
    setIsLoading(false);
    setShowStreamButtons(true);
  };

  useEffect(() => {
    const savedProfileRaw = localStorage.getItem(APP_STORAGE_KEY_PROFILE);
    if (savedProfileRaw) {
      try {
        const savedProfile = JSON.parse(savedProfileRaw);
        if (savedProfile.name && savedProfile.email) {
          setUserProfile(savedProfile);
          loadChatHistory(savedProfile.name);
        }
      } catch (e) {
        console.error("Failed to parse user profile from localStorage", e);
      }
    }
  }, []);
  
  const loadChatHistory = (name: string) => {
      const savedMessagesRaw = localStorage.getItem(APP_STORAGE_KEY_HISTORY);
      if (savedMessagesRaw) {
        try {
          const savedMessages: Message[] = JSON.parse(savedMessagesRaw);
          if (savedMessages && savedMessages.length > 0) {
            setMessages(savedMessages);

            const history: Content[] = savedMessages
              .filter(msg => msg.id !== 'init')
              .map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }],
              }));
            
            const personalizedInstruction = SYSTEM_INSTRUCTION.replace(/{userName}/g, name);

            chatRef.current = ai.chats.create({
              model: 'gemini-2.5-flash',
              config: { systemInstruction: personalizedInstruction },
              history: history,
            });
            setShowStreamButtons(savedMessages.length <= 1);
            updateStepFromHistory(savedMessages);
          } else {
            startNewChat(name);
          }
        } catch (e) {
          console.error("Failed to parse chat history from localStorage", e);
          startNewChat(name);
        }
      } else {
        startNewChat(name);
      }
    };
  
  const updateStepFromHistory = (history: Message[]) => {
      const lastBotMessage = [...history].reverse().find(m => m.role === 'model')?.text.toLowerCase() || '';
      if (lastBotMessage.includes("```recommendation")) {
        setCurrentStep(2);
      } else if (lastBotMessage.includes('career') || lastBotMessage.includes('interest')) {
        setCurrentStep(1);
      } else {
        setCurrentStep(0);
      }
  };

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(APP_STORAGE_KEY_HISTORY, JSON.stringify(messages));
      updateStepFromHistory(messages);
    }
  }, [messages]);

  // Effect for Text-to-Speech
  useEffect(() => {
    if (!isTtsEnabled) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'model') {
      const textToSpeak = lastMessage.text
        .replace(/```recommendation[\s\S]*?```/g, 'I have a recommendation. Please see the details on your screen.')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
        .replace(/[*_`#🤔🛠️🔌🙏]/g, '');

      if (textToSpeak.trim()) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [messages, isTtsEnabled]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (messageText: string) => {
    if (isLoading || !messageText.trim()) return;

    setIsLoading(true);
    setShowStreamButtons(false);
    window.speechSynthesis.cancel();

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');

    try {
      if (!chatRef.current) {
        throw new Error('Chat not initialized');
      }
      
      const stream = await chatRef.current.sendMessageStream({ message: messageText });

      let botMessageId = '';
      let botResponse = '';

      for await (const chunk of stream) {
        botResponse += chunk.text;
        if (!botMessageId) {
            botMessageId = Date.now().toString() + '-bot';
            setMessages((prev) => [
              ...prev,
              { id: botMessageId, role: 'model', text: botResponse },
            ]);
        } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, text: botResponse } : msg
              )
            );
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorText = 'Oops! Something went wrong on my end. Please try again in a few moments. 🛠️';

      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('failed to fetch') || errorMessage.includes('network')) {
          errorText = "I'm having trouble connecting to the network. Please check your internet connection and try again. 🔌";
        } else if (errorMessage.includes('400')) {
             errorText = "I couldn't understand that request. Could you please try rephrasing it? 🤔";
        } else if (errorMessage.includes('500')) {
            errorText = "There's a temporary issue with my servers. Please wait a moment and try again. 🙏";
        }
      }

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: errorText,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleStreamSelect = (stream: string) => {
    handleSendMessage(stream);
  };

  const handleStartChat = (name: string, email: string) => {
    const profile = { name, email };
    setUserProfile(profile);
    localStorage.setItem(APP_STORAGE_KEY_PROFILE, JSON.stringify(profile));
    startNewChat(name);
  };
  
  const handleLogout = () => {
    window.speechSynthesis.cancel();
    localStorage.removeItem(APP_STORAGE_KEY_PROFILE);
    localStorage.removeItem(APP_STORAGE_KEY_HISTORY);
    setUserProfile(null);
    setMessages([]);
    chatRef.current = null;
  };

  const handleToggleTts = () => {
    setIsTtsEnabled(prev => {
      if (!prev === false) { // if turning off
        window.speechSynthesis.cancel();
      }
      return !prev;
    });
  };

  const handleToggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support voice input.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
    };
    recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
    };

    const originalInput = input;
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInput(originalInput + (originalInput ? ' ' : '') + finalTranscript + interimTranscript);
    };
    
    recognition.start();
  };

  if (!userProfile) {
    return <WelcomeScreen onStart={handleStartChat} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col font-sans overflow-hidden">
        <div className="flex h-full">
            <SidePanel steps={steps} currentStep={currentStep} />
            <div className="flex-1 flex flex-col relative">
                <header className="absolute top-0 left-0 right-0 z-10 p-2 sm:p-4">
                    <div className="max-w-4xl mx-auto flex items-center justify-between glassmorphism rounded-xl p-2 sm:p-3 shadow-lg border border-white/10">
                        <div className="flex-1">
                            {/* Left spacer */}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <div className="h-10 w-10 bg-white/20 text-white rounded-full flex items-center justify-center">
                                <DreamPathLogo />
                            </div>
                            <h1 className="hidden sm:block text-xl font-bold text-white">Dream Path</h1>
                        </div>
                        <div className="flex-1 flex justify-end">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => startNewChat(userProfile.name)}
                                    disabled={isLoading}
                                    className="p-2 rounded-full text-white/80 hover:bg-white/20 transition-colors disabled:opacity-50"
                                    aria-label="Start new chat"
                                >
                                    <RefreshIcon />
                                </button>
                                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                                <button
                                    onClick={handleToggleTts}
                                    className="p-2 rounded-full text-white/80 hover:bg-white/20 transition-colors"
                                    aria-label={isTtsEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
                                >
                                    {isTtsEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full text-white/80 hover:bg-white/20 transition-colors"
                                    aria-label="Logout"
                                >
                                    <LogoutIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 pt-24 sm:pt-28">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {messages.map((message) => (
                            <ChatBubble key={message.id} message={message} />
                        ))}
                        {isLoading && <LoadingDots />}
                        <div ref={messagesEndRef} />
                    </div>
                </main>
                <footer className="max-w-4xl mx-auto w-full">
                    <ChatInput
                        input={input}
                        setInput={setInput}
                        onSubmit={handleFormSubmit}
                        isLoading={isLoading}
                        showStreamButtons={showStreamButtons}
                        onStreamSelect={handleStreamSelect}
                        isListening={isListening}
                        onToggleListening={handleToggleListening}
                    />
                </footer>
            </div>
        </div>
    </div>
  );
};

export default App;