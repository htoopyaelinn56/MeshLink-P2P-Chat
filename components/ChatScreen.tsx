import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Image as ImageIcon, Mic, Paperclip, X, Loader2, Wifi, LogOut } from 'lucide-react';
import { Message, MessageType, User, PeerState } from '../types';
import { generateId, fileToBase64 } from '../utils';
import MessageBubble from './MessageBubble';
import { joinRoom } from 'trystero'; // Expecting the environment to resolve this

interface ChatScreenProps {
  username: string;
  roomId: string;
  onLogout: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ username, roomId, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [peers, setPeers] = useState<PeerState>({});
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected'>('connecting');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Trystero refs
  const roomRef = useRef<any>(null);
  const sendActionRef = useRef<any>(null);

  // Initialize P2P Room
  useEffect(() => {
    // Config specifically for Trystero
    const config = { appId: 'meshlink-demo-app' };
    
    // Join the room
    const room = joinRoom(config, roomId);
    roomRef.current = room;

    // Define actions
    const [sendMsg, getMsg] = room.makeAction('message');
    const [sendPresence, getPresence] = room.makeAction('presence');
    sendActionRef.current = sendMsg;

    // Handle incoming messages
    getMsg((data: any, peerId: string) => {
      const incomingMsg = { ...data, senderId: peerId }; // Ensure we use the peerID from the network
      setMessages(prev => [...prev, incomingMsg]);
    });

    // Handle peer joining
    room.onPeerJoin((peerId: string) => {
      console.log(`Peer joined: ${peerId}`);
      // Announce our presence to the new peer
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

    // Handle peer leaving
    room.onPeerLeave((peerId: string) => {
      console.log(`Peer left: ${peerId}`);
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

    // Handle presence (name exchange)
    getPresence((data: { name: string, joinedAt: number }, peerId: string) => {
      setPeers(prev => ({
        ...prev,
        [peerId]: { name: data.name, joinedAt: data.joinedAt }
      }));
    });

    // Broadcast our presence to existing peers immediately
    // Note: Trystero might take a moment to find peers, so we can't broadcast instantly to everyone if we haven't found them.
    // However, onPeerJoin handles new folks. For existing folks, Trystero usually syncs up.
    // We'll set status to connected after a brief timeout to simulate "ready" state or when first peer is found.
    setTimeout(() => setConnectionStatus('connected'), 1500);

    return () => {
      room.leave();
    };
  }, [roomId, username]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (type: MessageType, content: string, fileName?: string) => {
    const newMessage: Message = {
      id: generateId(),
      senderId: 'self', // Will be replaced by actual peerId on receiver side
      senderName: username,
      content,
      fileName,
      timestamp: Date.now(),
      type
    };

    // Update local UI
    setMessages(prev => [...prev, newMessage]);

    // Send to network
    if (sendActionRef.current) {
        // We broadcast to all peers
        sendActionRef.current(newMessage);
    }
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

    // 2MB limit for this demo to ensure base64 stability in React state
    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Please send files under 2MB for this demo.");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      const type = file.type.startsWith('image/') ? MessageType.IMAGE : MessageType.FILE;
      await sendMessage(type, base64, file.name);
    } catch (err) {
      console.error("Error reading file:", err);
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const base64 = await fileToBase64(audioBlob);
        sendMessage(MessageType.AUDIO, base64);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-slate-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-surface border-b border-slate-700 shadow-md z-10">
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <div>
                <h2 className="font-bold text-lg text-white leading-tight">#{roomId}</h2>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Wifi size={12} />
                    {Object.keys(peers).length} Peer{Object.keys(peers).length !== 1 && 's'} Found
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-sm font-medium text-white">{username}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">You</span>
            </div>
            <button 
                onClick={onLogout}
                className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-red-400"
                title="Leave Room"
            >
                <LogOut size={20} />
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 bg-gradient-to-b from-slate-900 to-background">
          <div className="text-center py-8 opacity-50">
             <div className="inline-block p-3 rounded-full bg-slate-800 mb-3">
                <Wifi className="text-blue-400" />
             </div>
             <p className="text-sm">Scanning for devices on frequency <b>{roomId}</b>...</p>
             <p className="text-xs mt-1">Messages are encrypted and P2P.</p>
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

        {/* Peer List (Desktop Sidebar - Absolute on mobile but hidden) */}
        <div className="hidden lg:block w-64 bg-surface border-l border-slate-700 p-4 overflow-y-auto">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Connected Devices</h3>
            <ul className="space-y-3">
                {Object.keys(peers).length === 0 ? (
                    <li className="text-sm text-slate-600 italic">Scanning...</li>
                ) : (
                    Object.entries(peers).map(([id, peer]) => {
                        const p = peer as { name: string; joinedAt: number };
                        return (
                        <li key={id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                                {p.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate text-slate-200">{p.name}</p>
                                <p className="text-[10px] text-slate-500">Connected</p>
                            </div>
                        </li>
                    )})
                )}
            </ul>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface border-t border-slate-700">
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700/50 focus-within:border-primary/50 transition-colors">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
          />

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all"
            title="Attach file or image"
          >
            <Paperclip size={20} />
          </button>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 resize-none max-h-32 py-3 min-h-[44px]"
            rows={1}
            style={{ height: 'auto', minHeight: '44px' }}
          />

          {inputText.trim() ? (
             <button 
                onClick={handleSendText}
                className="p-3 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
             >
               <Send size={20} />
             </button>
          ) : (
             <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-lg transition-all transform active:scale-95 ${
                    isRecording 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' 
                    : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'
                }`}
                title={isRecording ? "Stop Recording" : "Record Voice Note"}
             >
               {isRecording ? <X size={20} /> : <Mic size={20} />}
             </button>
          )}
        </div>
        {isRecording && (
             <div className="text-center text-xs text-red-400 mt-2 font-medium animate-pulse">
                Recording... Tap X to stop and send.
             </div>
        )}
      </div>
    </div>
  );
};

export default ChatScreen;