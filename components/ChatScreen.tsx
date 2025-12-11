import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Paperclip, X, Wifi, LogOut, Users, Sun, Moon } from 'lucide-react';
import { Message, MessageType, PeerState } from '../types';
import { generateId, fileToBase64 } from '../utils';
import MessageBubble from './MessageBubble';
import { joinRoom } from 'trystero';

interface ChatScreenProps {
  username: string;
  roomId: string;
  onLogout: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ username, roomId, onLogout, isDark, toggleTheme }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [peers, setPeers] = useState<PeerState>({});
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected'>('connecting');
  const [showMobilePeers, setShowMobilePeers] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Trystero refs
  const roomRef = useRef<any>(null);
  const sendActionRef = useRef<any>(null);
  const knownPeersRef = useRef<Set<string>>(new Set());

  // Initialize P2P Room
  useEffect(() => {
    const config = { appId: 'meshlink-demo-app' };
    const room = joinRoom(config, roomId);
    roomRef.current = room;

    const [sendMsg, getMsg] = room.makeAction('message');
    const [sendPresence, getPresence] = room.makeAction('presence');
    sendActionRef.current = sendMsg;

    getMsg((data: any, peerId: string) => {
      const incomingMsg = { ...data, senderId: peerId };
      setMessages(prev => [...prev, incomingMsg]);
    });

    room.onPeerJoin((peerId: string) => {
      sendPresence({ name: username, joinedAt: Date.now() }, peerId);
      setMessages(prev => [...prev, {
        id: generateId(),
        senderId: 'system',
        senderName: 'System',
        content: `A new device has been discovered.`,
        timestamp: Date.now(),
        type: MessageType.SYSTEM
      }]);
    });

    room.onPeerLeave((peerId: string) => {
      knownPeersRef.current.delete(peerId);
      setPeers(prev => {
        const next = { ...prev };
        const name = next[peerId]?.name || 'Unknown Device';
        delete next[peerId];
        setMessages(m => [...m, {
            id: generateId(),
            senderId: 'system',
            senderName: 'System',
            content: `${name} disconnected.`,
            timestamp: Date.now(),
            type: MessageType.SYSTEM
        }]);
        return next;
      });
    });

    getPresence((data: { name: string, joinedAt: number }, peerId: string) => {
      const isNewPeer = !knownPeersRef.current.has(peerId);
      if (isNewPeer) {
        knownPeersRef.current.add(peerId);
        sendPresence({ name: username, joinedAt: Date.now() }, peerId);
      }
      setPeers(prev => ({
        ...prev,
        [peerId]: { name: data.name, joinedAt: data.joinedAt }
      }));
    });

    setTimeout(() => {
        setConnectionStatus('connected');
        sendPresence({ name: username, joinedAt: Date.now() });
    }, 1000);

    return () => {
      room.leave();
    };
  }, [roomId, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (type: MessageType, content: string, fileName?: string) => {
    const newMessage: Message = {
      id: generateId(),
      senderId: 'self',
      senderName: username,
      content,
      fileName,
      timestamp: Date.now(),
      type
    };
    setMessages(prev => [...prev, newMessage]);
    if (sendActionRef.current) sendActionRef.current(newMessage);
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    sendMessage(MessageType.TEXT, inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Please send files under 2MB.");
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      const type = file.type.startsWith('image/') ? MessageType.IMAGE : MessageType.FILE;
      await sendMessage(type, base64, file.name);
    } catch (err) {
      console.error("Error reading file:", err);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const base64 = await fileToBase64(audioBlob);
        sendMessage(MessageType.AUDIO, base64);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const totalDevices = Object.keys(peers).length + 1;

  const renderPeerList = () => (
    <ul className="space-y-3">
      {Object.keys(peers).length === 0 ? (
          <li className="text-sm text-text-muted italic flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary/50 animate-ping"/> Scanning...
          </li>
      ) : (
          Object.entries(peers).map(([id, peer]) => {
              const p = peer as { name: string; joinedAt: number };
              return (
              <li key={id} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-highlight/50 border border-border transition-colors hover:bg-surface-highlight">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {p.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate text-text-main">{p.name}</p>
                      <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connected
                      </p>
                  </div>
              </li>
          )})
      )}
    </ul>
  );

  return (
    <div className="flex flex-col h-full bg-background text-text-main transition-colors duration-300">
      {/* Glassmorphic Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-border z-20 sticky top-0">
        <div className="flex items-center gap-4">
            <div className={`relative w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-yellow-500'}`}>
               <span className={`absolute inset-0 rounded-full opacity-75 animate-ping ${connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
            </div>
            <div>
                <h2 className="font-bold text-lg text-text-main leading-none">#{roomId}</h2>
                <div className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
                    <Users size={12} />
                    <span>{totalDevices} {totalDevices === 1 ? 'Device' : 'Devices'} Online</span>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobilePeers(!showMobilePeers)}
              className="lg:hidden p-2.5 hover:bg-surface-highlight rounded-full transition-colors text-text-muted hover:text-primary"
            >
              <Users size={20} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2.5 hover:bg-surface-highlight rounded-full transition-colors text-text-muted hover:text-primary"
            >
               {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="hidden md:flex flex-col items-end mr-2 px-2 border-l border-border ml-2">
                <span className="text-sm font-semibold text-text-main">{username}</span>
            </div>
            
            <button 
                onClick={onLogout}
                className="p-2.5 hover:bg-red-500/10 rounded-full transition-colors text-text-muted hover:text-red-500"
                title="Leave Room"
            >
                <LogOut size={20} />
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth">
          <div className="text-center py-12 opacity-60">
             <div className="inline-block p-4 rounded-full bg-surface-highlight mb-4 shadow-sm">
                <Wifi className="text-primary animate-pulse" size={32} />
             </div>
             <p className="text-sm font-medium text-text-muted">You are connected to <b>{roomId}</b></p>
             <p className="text-xs text-text-muted/80 mt-1">End-to-end encrypted • P2P Mesh</p>
          </div>

          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isSelf={msg.senderId === 'self'} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 bg-surface border-l border-border p-5 overflow-y-auto">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
               <Users size={14} /> Connected Devices
            </h3>
            {renderPeerList()}
        </div>

        {/* Mobile Sidebar */}
        {showMobilePeers && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl p-6 lg:hidden flex flex-col animate-in slide-in-from-right duration-200">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-text-main flex items-center gap-3">
                  <Users size={24} className="text-primary"/> 
                  Devices
                </h3>
                <button 
                  onClick={() => setShowMobilePeers(false)}
                  className="p-2 bg-surface-highlight rounded-full text-text-muted hover:text-text-main"
                >
                  <X size={24} />
                </button>
             </div>
             <div className="flex-1 overflow-y-auto">
                {renderPeerList()}
             </div>
             <div className="mt-6 pt-6 border-t border-border text-center">
                <span className="text-base font-semibold text-text-main block">{username}</span>
                <span className="text-xs text-text-muted uppercase tracking-wider">This Device</span>
             </div>
          </div>
        )}
      </div>

      {/* Floating Input Area */}
      <div className="p-4 bg-background/0 relative z-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-surface shadow-2xl shadow-black/5 p-2 rounded-2xl border border-border/50 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">
          
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-text-muted hover:text-primary hover:bg-surface-highlight rounded-xl transition-all"
          >
            <Paperclip size={20} />
          </button>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-text-main placeholder-text-muted resize-none max-h-32 py-3 min-h-[44px] text-sm md:text-base leading-relaxed"
            rows={1}
            style={{ height: 'auto', minHeight: '44px' }}
          />

          {inputText.trim() ? (
             <button 
                onClick={handleSendText}
                className="p-3 bg-primary text-white rounded-xl hover:bg-blue-600 shadow-lg shadow-primary/20 transition-all transform hover:scale-105 active:scale-95"
             >
               <Send size={20} />
             </button>
          ) : (
             <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-xl transition-all transform active:scale-95 ${
                    isRecording 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                    : 'text-text-muted hover:text-red-500 hover:bg-surface-highlight'
                }`}
             >
               {isRecording ? <X size={20} /> : <Mic size={20} />}
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;