import type { SystemUser } from '@/types/domain';

const ACCESS_TOKEN_KEY = 'attendance-access-token';
const SESSION_USER_KEY = 'attendance-session-user';
const AUTH_MESSAGE_KEY = 'attendance-auth-message';

export const tokenStorage = {
  getAccessToken() {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getSessionUser() {
    if (typeof window === 'undefined') return null;

    const rawUser = window.localStorage.getItem(SESSION_USER_KEY);
    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser) as SystemUser;
    } catch {
      window.localStorage.removeItem(SESSION_USER_KEY);
      return null;
    }
  },

  setSession(user: SystemUser, token: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    window.localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  },

  getAuthMessage() {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(AUTH_MESSAGE_KEY);
  },

  setAuthMessage(message: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(AUTH_MESSAGE_KEY, message);
  },

  clearAuthMessage() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(AUTH_MESSAGE_KEY);
  },

  clearAccessToken() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(SESSION_USER_KEY);
  },
};
