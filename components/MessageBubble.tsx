import React from 'react';
import { Message, MessageType } from '../types';
import { formatTime } from '../utils';
import { FileIcon, Play, Download, User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isSelf: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSelf }) => {
  if (message.type === MessageType.SYSTEM) {
    return (
      <div className="flex justify-center my-4">
        <span className="bg-slate-800 text-slate-400 text-xs py-1 px-3 rounded-full border border-slate-700/50">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col mb-4 ${isSelf ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-end max-w-[85%] md:max-w-[70%] ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar Placeholder */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold mb-1
          ${isSelf ? 'bg-primary text-white ml-2' : 'bg-slate-600 text-slate-200 mr-2'}`}>
          {message.senderName.substring(0, 2).toUpperCase()}
        </div>

        <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
          <div className="text-xs text-slate-500 mb-1 px-1">
            {message.senderName}
          </div>
          
          <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isSelf 
              ? 'bg-primary text-white rounded-tr-sm' 
              : 'bg-surface border border-slate-700 text-slate-200 rounded-tl-sm'
          }`}>
            
            {/* Text Message */}
            {message.type === MessageType.TEXT && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}

            {/* Image Message */}
            {message.type === MessageType.IMAGE && (
              <div className="space-y-2">
                <img 
                  src={message.content} 
                  alt="Shared" 
                  className="max-w-full rounded-lg max-h-64 object-cover border border-black/10" 
                />
              </div>
            )}

            {/* Audio Message */}
            {message.type === MessageType.AUDIO && (
              <div className="flex items-center gap-3 min-w-[200px]">
                <div className="p-2 bg-black/20 rounded-full">
                  <Play size={20} fill="currentColor" className="ml-1" />
                </div>
                <div className="flex flex-col flex-1">
                   <audio controls src={message.content} className="w-full h-8 opacity-60" /> 
                   <span className="text-xs opacity-70 mt-1">Voice Note</span>
                </div>
              </div>
            )}

            {/* File Message */}
            {message.type === MessageType.FILE && (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-black/20 rounded-lg">
                  <FileIcon size={24} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium truncate max-w-[150px]">{message.fileName}</span>
                  <a 
                    href={message.content} 
                    download={message.fileName}
                    className="text-xs underline opacity-80 hover:opacity-100 flex items-center mt-1"
                  >
                    <Download size={12} className="mr-1" /> Download
                  </a>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className={`text-[10px] mt-1 text-right ${isSelf ? 'text-blue-200' : 'text-slate-500'}`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;