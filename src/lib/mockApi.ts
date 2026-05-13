import type { LoginResponse, Profile, RefreshResponse } from '../types/api';
import type { Assignment, Submission, SubmissionStatus } from '../types/assignment';
import type { QueueItem, Review } from '../types/review';
import type { ConsultationSlot, Booking } from '../types/consultation';
import type { AppNotification } from '../types/notification';

const MOCK_REVIEWS: Review[] = [];

// ── Consultation mock data ────────────────────────────────
const MOCK_SLOTS: ConsultationSlot[] = [
  {
    id: 'slot-1',
    teacherId: 'mock-teacher-1',
    teacherName: 'Лусине Тамамян',
    startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    durationMin: 60,
    maxParticipants: 1,
    bookedCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'slot-2',
    teacherId: 'mock-teacher-1',
    teacherName: 'Лусине Тамамян',
    startsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    durationMin: 60,
    maxParticipants: 5,
    bookedCount: 2,
    createdAt: new Date().toISOString(),
  },
];

const MOCK_BOOKINGS: Booking[] = [];

// ── Notification mock data ────────────────────────────────
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'needs_revision',
    title: 'Задание на доработку',
    body: '«Запишите приветствие» — преподаватель оставил комментарий',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    route: '/assignments',
  },
  {
    id: 'notif-2',
    type: 'deadline',
    title: 'Дедлайн через 24 часа',
    body: '«Переведите фразы» — успейте отправить задание',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    route: '/assignments',
  },
  {
    id: 'notif-3',
    type: 'consultation_reminder',
    title: 'Консультация завтра',
    body: 'Индивидуальная консультация с Лусине в 18:00',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    route: '/consultations',
  },
];

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

// ── Mock data ────────────────────────────────────────────
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asgn-1',
    sectionId: 'section-1',
    title: 'Запишите приветствие',
    description: 'Произнесите «Բarев» и «Bарев Ձes» — запишите голос или напишите транскрипцию.',
    dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'asgn-2',
    sectionId: 'section-1',
    title: 'Переведите фразы',
    description: 'Напишите перевод 5 фраз из урока «Приветствия».',
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'asgn-3',
    sectionId: 'section-2',
    title: 'Составьте диалог',
    description: 'Напишите короткий диалог знакомства на армянском (4–6 реплик).',
    dueAt: null,
    createdAt: new Date().toISOString(),
  },
];

// Mutable in-memory store for submissions during the session
const MOCK_SUBMISSIONS: Submission[] = [];

// ── Status mutation helper (for teacher review mock) ─────
export function mockUpdateSubmissionStatus(submissionId: string, status: SubmissionStatus): boolean {
  const idx = MOCK_SUBMISSIONS.findIndex((s) => s.id === submissionId);
  if (idx < 0) return false;
  MOCK_SUBMISSIONS[idx] = { ...MOCK_SUBMISSIONS[idx], status };
  return true;
}

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

  // ── Assignments ──────────────────────────────────────────
  if (method === 'GET' && (path === '/assignments' || path.startsWith('/assignments?'))) {
    const [, qs] = path.split('?');
    const params = new URLSearchParams(qs ?? '');
    const sectionId = params.get('sectionId');
    const filtered = sectionId
      ? MOCK_ASSIGNMENTS.filter((a) => a.sectionId === sectionId)
      : MOCK_ASSIGNMENTS;
    return createResponse(200, filtered);
  }

  if (method === 'POST' && /^\/assignments\/[\w-]+\/submit$/.test(path)) {
    const assignmentId = path.split('/')[2];
    const payload = body as { textContent?: string; audioUrl?: string } | undefined;
    const user = extractUserFromToken(accessToken ?? null);
    if (!user) return createResponse(401, { message: 'Unauthorized' });

    const existing = MOCK_SUBMISSIONS.findIndex(
      (s) => s.assignmentId === assignmentId && s.studentId === user.id,
    );
    const submission: Submission = {
      id: existing >= 0 ? MOCK_SUBMISSIONS[existing].id : `sub-${Date.now()}`,
      assignmentId,
      studentId: user.id,
      status: 'submitted',
      audioUrl: payload?.audioUrl ?? null,
      textContent: payload?.textContent ?? null,
      submittedAt: new Date().toISOString(),
      createdAt: existing >= 0 ? MOCK_SUBMISSIONS[existing].createdAt : new Date().toISOString(),
    };
    if (existing >= 0) MOCK_SUBMISSIONS[existing] = submission;
    else MOCK_SUBMISSIONS.push(submission);
    return createResponse(200, submission);
  }

  if (method === 'GET' && path === '/my-submissions') {
    const user = extractUserFromToken(accessToken ?? null);
    if (!user) return createResponse(401, { message: 'Unauthorized' });
    return createResponse(200, MOCK_SUBMISSIONS.filter((s) => s.studentId === user.id));
  }

  if (method === 'GET' && /^\/assignments\/[\w-]+\/submissions$/.test(path)) {
    const assignmentId = path.split('/')[2];
    return createResponse(200, MOCK_SUBMISSIONS.filter((s) => s.assignmentId === assignmentId));
  }

  // ── Review queue ─────────────────────────────────────────
  if (method === 'GET' && path === '/review-queue') {
    const queueItems: QueueItem[] = MOCK_SUBMISSIONS
      .filter((s) => s.status === 'submitted' || s.status === 'in_review')
      .map((s) => {
        const assignment = MOCK_ASSIGNMENTS.find((a) => a.id === s.assignmentId);
        const student = MOCK_USERS.find((u) => u.id === s.studentId);
        return {
          submission: s,
          assignmentTitle: assignment?.title ?? 'Задание',
          studentName: student?.fullName ?? 'Студент',
        };
      });
    return createResponse(200, queueItems);
  }

  if (method === 'POST' && /^\/submissions\/[\w-]+\/review$/.test(path)) {
    const submissionId = path.split('/')[2];
    const payload = body as {
      grammarScore: number; vocabularyScore: number;
      pronunciationScore: number; fluencyScore: number;
      comment?: string; status?: SubmissionStatus;
    } | undefined;
    const user = extractUserFromToken(accessToken ?? null);
    if (!user) return createResponse(401, { message: 'Unauthorized' });

    const idx = MOCK_SUBMISSIONS.findIndex((s) => s.id === submissionId);
    if (idx < 0) return createResponse(404, { message: 'Submission not found' });
    if (payload?.status) {
      MOCK_SUBMISSIONS[idx] = { ...MOCK_SUBMISSIONS[idx], status: payload.status };
    }
    const review: Review = {
      id: `rev-${Date.now()}`,
      submissionId,
      teacherId: user.id,
      grammarScore: payload?.grammarScore ?? 0,
      vocabularyScore: payload?.vocabularyScore ?? 0,
      pronunciationScore: payload?.pronunciationScore ?? 0,
      fluencyScore: payload?.fluencyScore ?? 0,
      comment: payload?.comment ?? null,
      audioCommentUrl: null,
      createdAt: new Date().toISOString(),
    };
    MOCK_REVIEWS.push(review);
    return createResponse(200, review);
  }

  if (method === 'POST' && /^\/submissions\/[\w-]+\/status$/.test(path)) {
    const submissionId = path.split('/')[2];
    const payload = body as { status?: SubmissionStatus } | undefined;
    const idx = MOCK_SUBMISSIONS.findIndex((s) => s.id === submissionId);
    if (idx < 0) return createResponse(404, { message: 'Submission not found' });
    if (payload?.status) {
      MOCK_SUBMISSIONS[idx] = { ...MOCK_SUBMISSIONS[idx], status: payload.status };
    }
    return createResponse(200, MOCK_SUBMISSIONS[idx]);
  }

  // ── Consultations ─────────────────────────────────────────
  if (method === 'GET' && path === '/consultation-slots') {
    return createResponse(200, MOCK_SLOTS);
  }

  if (method === 'GET' && path === '/my-bookings') {
    const user = extractUserFromToken(accessToken ?? null);
    if (!user) return createResponse(401, { message: 'Unauthorized' });
    return createResponse(200, MOCK_BOOKINGS.filter((b) => b.studentId === user.id && b.status !== 'cancelled'));
  }

  if (method === 'POST' && /^\/consultation-slots\/[\w-]+\/book$/.test(path)) {
    const slotId = path.split('/')[2];
    const user = extractUserFromToken(accessToken ?? null);
    if (!user) return createResponse(401, { message: 'Unauthorized' });

    const slot = MOCK_SLOTS.find((s) => s.id === slotId);
    if (!slot) return createResponse(404, { message: 'Slot not found' });
    if (slot.bookedCount >= slot.maxParticipants) {
      return createResponse(409, { message: 'Slot is full' });
    }
    const existing = MOCK_BOOKINGS.find((b) => b.slotId === slotId && b.studentId === user.id && b.status !== 'cancelled');
    if (existing) return createResponse(409, { message: 'Already booked' });

    slot.bookedCount += 1;
    const booking: Booking = {
      id: `bkg-${Date.now()}`,
      slotId,
      studentId: user.id,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    MOCK_BOOKINGS.push(booking);
    return createResponse(200, booking);
  }

  if (method === 'POST' && /^\/consultation-slots\/[\w-]+\/cancel$/.test(path)) {
    const slotId = path.split('/')[2];
    const user = extractUserFromToken(accessToken ?? null);
    if (!user) return createResponse(401, { message: 'Unauthorized' });

    const idx = MOCK_BOOKINGS.findIndex((b) => b.slotId === slotId && b.studentId === user.id);
    if (idx < 0) return createResponse(404, { message: 'Booking not found' });
    MOCK_BOOKINGS[idx] = { ...MOCK_BOOKINGS[idx], status: 'cancelled' };

    const slot = MOCK_SLOTS.find((s) => s.id === slotId);
    if (slot) slot.bookedCount = Math.max(0, slot.bookedCount - 1);
    return createResponse(200, MOCK_BOOKINGS[idx]);
  }

  // ── Notifications ─────────────────────────────────────────
  if (method === 'GET' && path === '/notifications') {
    const user = extractUserFromToken(accessToken ?? null);
    if (!user) return createResponse(401, { message: 'Unauthorized' });
    // Teacher gets review_ready notifications based on queue
    if (user.role === 'teacher' || user.role === 'admin') {
      const reviewNotifs: AppNotification[] = MOCK_SUBMISSIONS
        .filter((s) => s.status === 'submitted')
        .map((s) => ({
          id: `notif-review-${s.id}`,
          type: 'review_ready' as const,
          title: 'Новая работа на проверку',
          body: `Студент отправил задание — требует проверки`,
          isRead: false,
          createdAt: s.submittedAt ?? s.createdAt,
          route: '/review-queue',
        }));
      return createResponse(200, reviewNotifs);
    }
    return createResponse(200, MOCK_NOTIFICATIONS);
  }

  if (method === 'POST' && /^\/notifications\/[\w-]+\/read$/.test(path)) {
    const notifId = path.split('/')[2];
    const idx = MOCK_NOTIFICATIONS.findIndex((n) => n.id === notifId);
    if (idx >= 0) MOCK_NOTIFICATIONS[idx] = { ...MOCK_NOTIFICATIONS[idx], isRead: true };
    return createResponse(200, {});
  }

  if (method === 'POST' && path === '/notifications/read-all') {
    MOCK_NOTIFICATIONS.forEach((_, i) => { MOCK_NOTIFICATIONS[i] = { ...MOCK_NOTIFICATIONS[i], isRead: true }; });
    return createResponse(200, {});
  }

  if (method === 'POST' && path === '/consultation-slots') {
    const user = extractUserFromToken(accessToken ?? null);
    if (!user) return createResponse(401, { message: 'Unauthorized' });
    const payload = body as { startsAt?: string; durationMin?: number; maxParticipants?: number } | undefined;
    if (!payload?.startsAt) return createResponse(400, { message: 'startsAt required' });

    const slot: ConsultationSlot = {
      id: `slot-${Date.now()}`,
      teacherId: user.id,
      teacherName: user.fullName,
      startsAt: payload.startsAt,
      durationMin: payload.durationMin ?? 60,
      maxParticipants: payload.maxParticipants ?? 1,
      bookedCount: 0,
      createdAt: new Date().toISOString(),
    };
    MOCK_SLOTS.push(slot);
    return createResponse(200, slot);
  }

  return createResponse(501, {
    message: `Mock endpoint is not implemented: ${method} ${path}`,
  });
}
