import React from 'react';
import { Message, MessageType } from '../types';
import { formatTime } from '../utils';
import { FileIcon, Play, Download } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isSelf: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSelf }) => {
  if (message.type === MessageType.SYSTEM) {
    return (
      <div className="flex justify-center my-4 opacity-80">
        <span className="bg-surface-highlight text-text-muted text-[10px] font-medium py-1 px-4 rounded-full border border-border shadow-sm">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col mb-4 group ${isSelf ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-end max-w-[85%] md:max-w-[70%] gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm
          ${isSelf ? 'bg-primary text-white' : 'bg-surface-highlight text-text-muted border border-border'}`}>
          {message.senderName.substring(0, 2).toUpperCase()}
        </div>

        <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
          {!isSelf && (
             <div className="text-[10px] font-semibold text-text-muted mb-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
               {message.senderName}
             </div>
          )}
          
          <div className={`relative px-4 py-3 shadow-sm ${
            isSelf 
              ? 'bg-primary text-white rounded-2xl rounded-tr-none' 
              : 'bg-surface border border-border text-text-main rounded-2xl rounded-tl-none'
          }`}>
            
            {/* Text Message */}
            {message.type === MessageType.TEXT && (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
            )}

            {/* Image Message */}
            {message.type === MessageType.IMAGE && (
              <div className="mt-1">
                <img 
                  src={message.content} 
                  alt="Shared" 
                  className="max-w-full rounded-lg max-h-72 object-cover border border-black/10 shadow-sm" 
                />
              </div>
            )}

            {/* Audio Message */}
            {message.type === MessageType.AUDIO && (
              <div className="flex items-center gap-3 min-w-[200px] py-1">
                <div className={`p-2 rounded-full ${isSelf ? 'bg-white/20' : 'bg-surface-highlight'}`}>
                  <Play size={16} fill="currentColor" className={isSelf ? 'text-white' : 'text-primary'} />
                </div>
                <div className="flex flex-col flex-1">
                   <audio controls src={message.content} className="w-full h-8 opacity-80 scale-95 origin-left" /> 
                </div>
              </div>
            )}

            {/* File Message */}
            {message.type === MessageType.FILE && (
              <div className="flex items-center gap-3 py-1">
                <div className={`p-3 rounded-xl ${isSelf ? 'bg-white/20' : 'bg-surface-highlight'}`}>
                  <FileIcon size={24} className={isSelf ? 'text-white' : 'text-primary'} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-sm truncate max-w-[160px]">{message.fileName}</span>
                  <a 
                    href={message.content} 
                    download={message.fileName}
                    className={`text-xs underline flex items-center mt-1 ${isSelf ? 'text-white/80 hover:text-white' : 'text-primary hover:text-blue-600'}`}
                  >
                    <Download size={12} className="mr-1" /> Download
                  </a>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className={`text-[9px] mt-1.5 text-right font-medium ${isSelf ? 'text-white/70' : 'text-text-muted'}`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;