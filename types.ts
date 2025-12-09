export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  SYSTEM = 'system'
}

export interface User {
  id: string;
  name: string;
  isSelf: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string; // Text content or Base64 data for files
  fileName?: string;
  fileType?: string;
  timestamp: number;
  type: MessageType;
}

export interface PeerState {
  [peerId: string]: {
    name: string;
    joinedAt: number;
  };
}

export interface ChatState {
  roomId: string;
  username: string;
  isJoined: boolean;
}