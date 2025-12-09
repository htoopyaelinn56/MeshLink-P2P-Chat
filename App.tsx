import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ChatScreen from './components/ChatScreen';
import { ChatState } from './types';

const App: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    roomId: '',
    username: '',
    isJoined: false
  });

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
    <div className="h-screen w-screen bg-background">
      {!chatState.isJoined ? (
        <WelcomeScreen onJoin={handleJoin} />
      ) : (
        <ChatScreen 
          username={chatState.username} 
          roomId={chatState.roomId} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};

export default App;