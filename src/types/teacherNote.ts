export interface TeacherNote {
  id: string;
  type: 'feedback' | 'weekly-review' | 'tip';
  date: string;
  lessonTitle?: string;
  text: string;
  highlight?: {
    armenian: string;
    transcription: string;
    translation: string;
  };
}
