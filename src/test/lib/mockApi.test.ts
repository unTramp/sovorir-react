import { beforeEach, describe, expect, it } from 'vitest';
import { mockApiRequest } from '../../lib/mockApi';

describe('mockApi authentication', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('restores the authenticated user from the generated access token', async () => {
    const loginResponse = await mockApiRequest('POST', '/auth/login', {
      email: 'student@sovorir.dev',
      password: 'demo12345',
    });
    const login = await loginResponse.json() as {
      accessToken: string;
      profile: { id: string; role: string };
    };

    const profileResponse = await mockApiRequest(
      'GET',
      '/auth/me',
      undefined,
      login.accessToken,
    );
    const profile = await profileResponse.json() as { id: string; role: string };

    expect(profileResponse.ok).toBe(true);
    expect(profile.id).toBe(login.profile.id);
    expect(profile.role).toBe('student');
  });
});
