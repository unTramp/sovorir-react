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
