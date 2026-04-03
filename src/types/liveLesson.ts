export interface LiveLessonTeacher {
  name: string;
  role: string;
  experience: string;
}

export interface LiveLesson {
  id: string;
  type: 'group' | 'individual';
  title: string;
  description: string;
  topics?: string[];
  date: string;        // ISO date string
  time: string;        // e.g. "18:00"
  duration: number;    // minutes
  price: number;       // e.g. 4.99
  spotsTotal: number;
  spotsTaken: number;
  link: string;        // Telegram/WhatsApp URL
  teacher: LiveLessonTeacher;
}

export interface ConversationClubSession {
  id: string;
  title: string;
  description: string;
  theme: string;
  phrases: { armenian: string; russian: string }[];
  participantCountries: string[];
  date: string;
  time: string;
  duration: number;
  price: number;
  spotsTotal: number;
  spotsTaken: number;
  link: string;
  teacher: LiveLessonTeacher;
}
