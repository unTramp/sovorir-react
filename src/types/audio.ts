export type Sender = 'teacher' | 'student';
export type MessageType = 'audio' | 'video';

export interface AudioMessage {
  id: string;
  sender: Sender;
  senderName: string;
  text: string;
  duration: number;
  src: string;
  time: string;
  type?: MessageType;
  videoSrc?: string;
  thumbnail?: string;
  page?: number;
}
