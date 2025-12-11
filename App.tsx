import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ChatScreen from './components/ChatScreen';
import { ChatState } from './types';

const App: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    roomId: '',
    username: '',
    isJoined: false
  });

  const [isDark, setIsDark] = useState(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemPrefersDark);
    }
  }, []);

  // Apply theme class to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleJoin = (username: string, roomId: string) => {
    setChatState({
      username,
      roomId,
      isJoined: true
    });
  };

  const handleLogout = () => {
    setChatState({
      roomId: '',
      username: '',
      isJoined: false
    });
  };

  return (
    <div className="h-[100dvh] w-screen bg-background overflow-hidden transition-colors duration-300">
      {!chatState.isJoined ? (
        <WelcomeScreen 
          onJoin={handleJoin} 
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      ) : (
        <ChatScreen 
          username={chatState.username} 
          roomId={chatState.roomId} 
          onLogout={handleLogout}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
};

export default App;