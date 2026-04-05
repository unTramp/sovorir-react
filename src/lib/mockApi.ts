import type { LoginResponse, Profile, RefreshResponse } from '../types/api';

export interface MockTransportResponse {
  ok: boolean;
  status: number;
  statusText?: string;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

interface MockUser extends Profile {
  password: string;
}

const MOCK_SESSION_KEY = 'sovorir-mock-session';
const MOCK_LATENCY_MS = 250;

const MOCK_USERS: MockUser[] = [
  {
    id: 'mock-student-1',
    schoolId: 'sovorir-dev',
    role: 'student',
    fullName: 'Андрей Дорофеев',
    avatarUrl: '/assets/student-avatar.png',
    email: 'student@sovorir.dev',
    className: 'A1',
    password: 'demo12345',
  },
  {
    id: 'mock-teacher-1',
    schoolId: 'sovorir-dev',
    role: 'teacher',
    fullName: 'Лусине Тамамян',
    avatarUrl: '/assets/teacher-avatar.png',
    email: 'teacher@sovorir.dev',
    className: null,
    password: 'teacher123',
  },
  {
    id: 'mock-admin-1',
    schoolId: 'sovorir-dev',
    role: 'admin',
    fullName: 'Анна Минасян',
    avatarUrl: '/assets/teacher-avatar.png',
    email: 'admin@sovorir.dev',
    className: null,
    password: 'admin123',
  },
];

export const mockAuthCredentials = {
  student: {
    email: MOCK_USERS[0].email,
    password: MOCK_USERS[0].password,
  },
  teacher: {
    email: MOCK_USERS[1].email,
    password: MOCK_USERS[1].password,
  },
  admin: {
    email: MOCK_USERS[2].email,
    password: MOCK_USERS[2].password,
  },
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createResponse(status: number, payload: unknown): MockTransportResponse {
  const text = typeof payload === 'string'
    ? payload
    : typeof payload === 'object' && payload !== null && 'message' in payload
      ? String(payload.message)
      : JSON.stringify(payload);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: text,
    json: async () => {
      if (typeof payload === 'string') {
        throw new Error('Response body is not JSON');
      }
      return payload;
    },
    text: async () => text,
  };
}

function persistSession(userId: string, refreshToken: string): void {
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ userId, refreshToken }));
}

function clearSession(): void {
  localStorage.removeItem(MOCK_SESSION_KEY);
}

function getSession(): { userId: string; refreshToken: string } | null {
  try {
    const raw = localStorage.getItem(MOCK_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { userId: string; refreshToken: string };
  } catch {
    return null;
  }
}

function getUserById(userId: string): MockUser | undefined {
  return MOCK_USERS.find((user) => user.id === userId);
}

function getUserByEmail(email: string): MockUser | undefined {
  return MOCK_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function createTokens(userId: string): RefreshResponse {
  const nonce = Date.now();
  return {
    accessToken: `mock-access:${userId}:${nonce}`,
    refreshToken: `mock-refresh:${userId}:${nonce}`,
  };
}

function extractUserFromToken(token: string | null): MockUser | undefined {
  if (!token?.startsWith('mock-access:')) return undefined;
  const [, , userId] = token.split(':');
  return getUserById(userId);
}

export async function mockApiRequest(
  method: string,
  path: string,
  body?: unknown,
  accessToken?: string | null,
): Promise<MockTransportResponse> {
  await wait(MOCK_LATENCY_MS);

  if (method === 'POST' && path === '/auth/login') {
    const payload = body as { email?: string; password?: string } | undefined;
    const user = payload?.email ? getUserByEmail(payload.email) : undefined;
    if (!user || user.password !== payload?.password) {
      return createResponse(401, { message: 'Неверный email или пароль' });
    }

    const tokens = createTokens(user.id);
    persistSession(user.id, tokens.refreshToken);
    const response: LoginResponse = {
      ...tokens,
      profile: {
        id: user.id,
        schoolId: user.schoolId,
        role: user.role,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        email: user.email,
        className: user.className,
      },
    };
    return createResponse(200, response);
  }

  if (method === 'POST' && path === '/auth/refresh') {
    const payload = body as { refreshToken?: string } | undefined;
    const session = getSession();
    if (!payload?.refreshToken || !session || session.refreshToken !== payload.refreshToken) {
      clearSession();
      return createResponse(401, { message: 'Refresh token is invalid' });
    }

    const user = getUserById(session.userId);
    if (!user) {
      clearSession();
      return createResponse(404, { message: 'Mock user not found' });
    }

    const tokens = createTokens(user.id);
    persistSession(user.id, tokens.refreshToken);
    return createResponse(200, tokens);
  }

  if (method === 'GET' && path === '/auth/me') {
    const user = extractUserFromToken(accessToken ?? null);
    if (!user) {
      return createResponse(401, { message: 'Unauthorized' });
    }

    return createResponse(200, {
      id: user.id,
      schoolId: user.schoolId,
      role: user.role,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      email: user.email,
      className: user.className,
    } satisfies Profile);
  }

  return createResponse(501, {
    message: `Mock endpoint is not implemented: ${method} ${path}`,
  });
}
