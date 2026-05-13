import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.string(),
  schoolId: z.string(),
  role: z.enum(['teacher', 'student', 'admin']),
  fullName: z.string(),
  avatarUrl: z.string().nullable(),
  email: z.string().email(),
  className: z.string().nullable(),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  profile: ProfileSchema,
});

export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type ParsedProfile = z.infer<typeof ProfileSchema>;
export type ParsedLoginResponse = z.infer<typeof LoginResponseSchema>;
export type ParsedRefreshResponse = z.infer<typeof RefreshResponseSchema>;

// ── Domain schemas ────────────────────────────────────────

export const AssignmentSchema = z.object({
  id: z.string(),
  sectionId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  dueAt: z.string().nullable(),
  createdAt: z.string(),
});

export const SubmissionSchema = z.object({
  id: z.string(),
  assignmentId: z.string(),
  studentId: z.string(),
  status: z.enum(['draft', 'submitted', 'in_review', 'needs_revision', 'accepted']),
  audioUrl: z.string().nullable(),
  textContent: z.string().nullable(),
  submittedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const ConsultationSlotSchema = z.object({
  id: z.string(),
  teacherId: z.string(),
  teacherName: z.string(),
  startsAt: z.string(),
  durationMin: z.number(),
  maxParticipants: z.number(),
  bookedCount: z.number(),
  createdAt: z.string(),
});

export const BookingSchema = z.object({
  id: z.string(),
  slotId: z.string(),
  studentId: z.string(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  createdAt: z.string(),
});

export const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum([
    'review_ready',
    'deadline',
    'needs_revision',
    'consultation_reminder',
    'assignment_accepted',
  ]),
  title: z.string(),
  body: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
  route: z.string().nullable().optional(),
});
