import { RefreshResponseSchema } from './apiSchemas';
import { mockApiRequest } from './mockApi';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const isLocalApiUrl =
  BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1');

export const isMockApiEnabled =
  import.meta.env.VITE_USE_MOCK_API === 'true' ||
  (import.meta.env.VITE_USE_MOCK_API !== 'false' && isLocalApiUrl);

const ACCESS_KEY = 'sovorir-access-token';
const REFRESH_KEY = 'sovorir-refresh-token';
const REQUEST_TIMEOUT_MS = 10_000;

interface TransportResponse {
  ok: boolean;
  status: number;
  statusText?: string;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

let _onLogout: (() => void) | null = null;
export function setLogoutCallback(fn: () => void): void {
  _onLogout = fn;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function attemptRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;
  try {
    const res = await transportRequest('POST', '/auth/refresh', refreshToken, {
      refreshToken,
    });

    if (!res.ok) {
      _onLogout?.();
      refreshQueue.forEach((cb) => cb(null));
      refreshQueue = [];
      return null;
    }

    const data = RefreshResponseSchema.parse(await res.json());
    saveTokens(data.accessToken, data.refreshToken);
    refreshQueue.forEach((cb) => cb(data.accessToken));
    refreshQueue = [];
    return data.accessToken;
  } catch {
    _onLogout?.();
    refreshQueue.forEach((cb) => cb(null));
    refreshQueue = [];
    return null;
  } finally {
    isRefreshing = false;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData?: boolean,
): Promise<T> {
  const doFetch = (token: string | null) =>
    transportRequest(method, path, token, body, isFormData);

  let res = await doFetch(getAccessToken());

  if (res.status === 401) {
    const newToken = await attemptRefresh();
    if (!newToken) {
      throw new Error('Unauthorized');
    }
    res = await doFetch(newToken);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

async function transportRequest(
  method: string,
  path: string,
  token: string | null,
  body?: unknown,
  isFormData?: boolean,
): Promise<TransportResponse> {
  if (isMockApiEnabled) {
    return mockApiRequest(method, path, body, token);
  }

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      signal: controller.signal,
      body: body
        ? isFormData
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
    });
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path);
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('POST', path, body);
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('PATCH', path, body);
  },
  delete<T>(path: string): Promise<T> {
    return request<T>('DELETE', path);
  },
  postFormData<T>(path: string, form: FormData): Promise<T> {
    return request<T>('POST', path, form, true);
  },
};
