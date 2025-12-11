import React, { useState } from 'react';
import { Radio, Scan, Shield, Users, Sun, Moon, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onJoin: (username: string, roomId: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onJoin, isDark, toggleTheme }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('LocalNet');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && roomId.trim()) {
      onJoin(username.trim(), roomId.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full overflow-y-auto p-4 bg-background transition-colors duration-300 relative">
      
      {/* Theme Toggle Top Right */}
      <button 
        type="button"
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-surface shadow-lg text-text-muted hover:text-primary transition-all hover:scale-110 active:scale-95 border border-border cursor-pointer"
        title="Toggle Theme"
        aria-label="Toggle color theme"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md space-y-6 my-auto animate-slide-up relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-2 mt-8 md:mt-0">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 shadow-lg shadow-primary/5">
            <Radio size={32} className="animate-pulse-slow" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-text-main">MeshLink</h1>
          <p className="text-text-muted font-medium">Peer-to-Peer Local Network</p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-3 gap-3 my-8">
          {[
            { icon: Shield, label: 'Encrypted', color: 'text-emerald-500' },
            { icon: Users, label: 'Serverless', color: 'text-blue-500' },
            { icon: Scan, label: 'Discover', color: 'text-purple-500' }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center p-3 rounded-2xl bg-surface border border-border shadow-sm justify-center h-24 transition-transform hover:-translate-y-1">
              <item.icon className={`mb-2 ${item.color}`} size={24} />
              <span className="text-[10px] md:text-xs font-semibold text-text-muted">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-3xl border border-border shadow-xl shadow-black/5">
          <div className="space-y-4">
            <div className="space-y-2 group">
              <label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">
                Display Name
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Who are you?"
                className="w-full px-4 py-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main placeholder-text-muted/50 font-medium"
              />
            </div>

            <div className="space-y-2 group">
              <label htmlFor="roomId" className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">
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
                  className="w-full px-4 py-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main placeholder-text-muted/50 font-medium"
                />
                <div className="absolute right-4 top-3.5 text-text-muted/50 group-focus-within:text-primary transition-colors">
                  <Scan size={20} />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="group w-full py-4 px-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Join Network
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        
        <p className="text-center text-xs text-text-muted/60 pt-4">
          By joining, you connect directly to other devices on this frequency.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;