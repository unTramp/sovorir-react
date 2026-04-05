export type SectionType = 'home' | 'video' | 'lesson' | 'audio' | 'dictionary' | 'notes' | 'practice' | 'live-lessons' | 'statistics' | 'settings' | 'admin';
export type SectionStatus = 'completed' | 'current' | 'in-progress' | 'pending' | 'locked';
export type LessonStatus = 'completed' | 'current' | 'locked';

export interface Section {
  id: string;
  title: string;
  type: SectionType;
  icon: string;
  status: SectionStatus;
}

export interface Lesson {
  id: number;
  title: string;
  icon: string;
  status: LessonStatus;
  sections: Section[];
}
