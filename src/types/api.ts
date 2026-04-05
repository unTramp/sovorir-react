export interface Profile {
  id: string;
  schoolId: string;
  role: 'teacher' | 'student' | 'admin';
  fullName: string;
  avatarUrl: string | null;
  email: string;
  className: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  profile: Profile;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface BookingSlot {
  lessonId: string;
  userId: string;
  bookedAt: number;
}

export interface SyncPayload {
  lessonProgress: Record<number, { completedRecords: number[] }>;
  flashcardProgress: Record<string, { interval: number; nextReview: number; easeFactor: number }>;
  quizResults: Record<number, { quizId: string; score: number; total: number; passed: boolean; completedAt: number }>;
  recordings: { id: string; sectionId: number; recordIndex: number; duration: number; createdAt: number }[];
}
