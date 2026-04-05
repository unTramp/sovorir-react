import { describe, it, expect } from 'vitest';
import { ProfileSchema, LoginResponseSchema, RefreshResponseSchema } from '../../lib/apiSchemas';

const validProfile = {
  id: 'u1',
  schoolId: 's1',
  role: 'student' as const,
  fullName: 'Андрей Дорофеев',
  avatarUrl: null,
  email: 'andrey@example.com',
  className: 'A1',
};

describe('ProfileSchema', () => {
  it('parses a valid profile', () => {
    const result = ProfileSchema.parse(validProfile);
    expect(result.id).toBe('u1');
    expect(result.role).toBe('student');
  });

  it('accepts null avatarUrl and className', () => {
    const result = ProfileSchema.parse({ ...validProfile, avatarUrl: null, className: null });
    expect(result.avatarUrl).toBeNull();
    expect(result.className).toBeNull();
  });

  it('rejects invalid role', () => {
    expect(() => ProfileSchema.parse({ ...validProfile, role: 'admin' })).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() => ProfileSchema.parse({ ...validProfile, email: 'not-an-email' })).toThrow();
  });

  it('rejects missing required fields', () => {
    const { id: _id, ...withoutId } = validProfile;
    expect(() => ProfileSchema.parse(withoutId)).toThrow();
  });
});

describe('LoginResponseSchema', () => {
  it('parses a valid login response', () => {
    const result = LoginResponseSchema.parse({
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
      profile: validProfile,
    });
    expect(result.accessToken).toBe('access-123');
    expect(result.profile.fullName).toBe('Андрей Дорофеев');
  });

  it('rejects missing tokens', () => {
    expect(() => LoginResponseSchema.parse({ profile: validProfile })).toThrow();
  });
});

describe('RefreshResponseSchema', () => {
  it('parses valid refresh response', () => {
    const result = RefreshResponseSchema.parse({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    expect(result.accessToken).toBe('new-access');
  });

  it('rejects extra unexpected fields gracefully (strips them)', () => {
    const result = RefreshResponseSchema.parse({
      accessToken: 'tok',
      refreshToken: 'ref',
      extraField: 'ignored',
    });
    expect(result).not.toHaveProperty('extraField');
  });
});
