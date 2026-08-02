// src/store/auth.js
import { setToken, clearToken } from '../api/client';

const KEYS = { ACCESS: 'thali_at', REFRESH: 'thali_rt', USER: 'thali_user' };

export function getStoredToken()   { return localStorage.getItem(KEYS.ACCESS); }
export function getStoredRefresh() { return localStorage.getItem(KEYS.REFRESH); }

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(KEYS.USER) || 'null'); }
  catch { return null; }
}

export function storeSession(user, accessToken, refreshToken) {
  localStorage.setItem(KEYS.ACCESS,  accessToken);
  localStorage.setItem(KEYS.REFRESH, refreshToken);
  localStorage.setItem(KEYS.USER,    JSON.stringify(user));
  setToken(accessToken);
}

export function clearSession() {
  localStorage.removeItem(KEYS.ACCESS);
  localStorage.removeItem(KEYS.REFRESH);
  localStorage.removeItem(KEYS.USER);
  clearToken();
}

export function restoreToken() {
  const token = getStoredToken();
  if (token) setToken(token);
  return !!token;
}
