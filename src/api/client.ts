import { tokenStorage } from './tokenStorage';

export type ApiClientOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/backend-api';
const isApiDebugEnabled = process.env.NEXT_PUBLIC_API_DEBUG === 'true';
const SESSION_EXPIRED_MESSAGE = '로그인 시간이 만료되었습니다. 다시 로그인해 주세요.';

const getBody = (body: unknown) => {
  if (!body) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
};

const formatDebugBody = (body: unknown) => {
  if (body instanceof FormData) {
    return Array.from(body.entries()).map(([key, value]) => ({
      key,
      value: value instanceof File ? `[File] ${value.name} (${value.size} bytes)` : value,
    }));
  }

  return body;
};

const logApiRequest = (method: string, url: string, body: unknown, hasToken: boolean) => {
  if (!isApiDebugEnabled) return;

  console.groupCollapsed(`[API Request] ${method} ${url}`);
  console.log('auth', hasToken ? 'Bearer token attached' : 'none');
  if (body !== undefined) console.log('body', formatDebugBody(body));
  console.groupEnd();
};

const logApiResponse = (method: string, url: string, status: number, payload: unknown) => {
  if (!isApiDebugEnabled) return;

  const log = status >= 400 ? console.warn : console.log;
  console.groupCollapsed(`[API Response] ${status} ${method} ${url}`);
  log('payload', payload);
  console.groupEnd();
};

const parsePayload = async (response: Response) => {
  const text = await response.text();
  if (!text) return '';

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const handleUnauthorized = () => {
  if (typeof window === 'undefined') return;

  tokenStorage.setAuthMessage(SESSION_EXPIRED_MESSAGE);
  tokenStorage.clearAccessToken();

  if (!window.location.pathname.startsWith('/login')) {
    window.location.replace('/login');
  }
};

export const apiClient = async <T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> => {
  const token = options.auth === false ? null : tokenStorage.getAccessToken();
  const body = getBody(options.body);
  const method = options.method ?? 'GET';
  const url = `${API_BASE_URL}${path}`;

  logApiRequest(method, url, options.body, Boolean(token));

  const response = await fetch(url, {
    method,
    headers: {
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body,
  });
  const payload = await parsePayload(response);

  logApiResponse(method, url, response.status, payload);

  if (!response.ok) {
    const message = typeof payload === 'string' && payload
      ? payload
      : response.status === 401
        ? SESSION_EXPIRED_MESSAGE
        : 'API 요청에 실패했습니다.';

    if (response.status === 401 && options.auth !== false) {
      handleUnauthorized();
    }

    throw new ApiError(
      message,
      response.status,
      payload,
    );
  }

  return payload as T;
};
