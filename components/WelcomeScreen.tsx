import React, { useState } from 'react';
import { Radio, Scan, Shield, Users } from 'lucide-react';

interface WelcomeScreenProps {
  onJoin: (username: string, roomId: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('LocalNet'); // Default to a shared "Local" room

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && roomId.trim()) {
      onJoin(username.trim(), roomId.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full overflow-y-auto p-4 bg-gradient-to-b from-background to-surface">
      <div className="w-full max-w-md space-y-6 my-auto">
        <div className="text-center space-y-2 mt-8 md:mt-0">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/20 text-primary mb-2 md:mb-4 animate-pulse-slow">
            <Radio size={28} className="md:w-8 md:h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">MeshLink</h1>
          <p className="text-sm md:text-base text-slate-400">Serverless P2P Device Discovery & Chat</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[10px] md:text-xs text-slate-500 my-6">
          <div className="flex flex-col items-center p-2 rounded-lg bg-surface/50 justify-center h-full">
            <Shield className="mb-1 text-emerald-400" size={18} />
            <span className="leading-tight">End-to-End Encrypted</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-surface/50 justify-center h-full">
            <Users className="mb-1 text-blue-400" size={18} />
            <span className="leading-tight">No Central Server</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-surface/50 justify-center h-full">
            <Scan className="mb-1 text-purple-400" size={18} />
            <span className="leading-tight">Auto Discovery</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-surface p-6 rounded-2xl border border-slate-700/50 shadow-xl mb-8">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-slate-300">
              Display Name
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Alice"
              className="w-full px-4 py-3 bg-background border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white placeholder-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="roomId" className="text-sm font-medium text-slate-300">
              Frequency (Room ID)
            </label>
            <div className="relative">
              <input
                id="roomId"
                type="text"
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. LocalNet"
                className="w-full px-4 py-3 bg-background border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white placeholder-slate-500"
              />
              <div className="absolute right-3 top-3 text-slate-500">
                <Scan size={20} />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Devices must be on the same Frequency to find each other.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Join Network
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeScreen;