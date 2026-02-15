export type Sender = 'teacher' | 'student';

export interface AudioMessage {
  id: string;
  sender: Sender;
  senderName: string;
  text: string;
  duration: number;
  src: string;
  time: string;
}
