const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1';

let _accessToken = null;
let _refreshFn   = null;   // set by App on mount: async () => boolean
let _on401       = null;   // called when refresh fails

export function setToken(token)         { _accessToken = token; }
export function clearToken()            { _accessToken = null; }
export function setRefreshFn(fn)        { _refreshFn = fn; }
export function onUnauthorized(handler) { _on401 = handler; }

let _refreshing = null;

async function request(method, path, body, _isRetry = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !_isRetry && _refreshFn) {
    if (!_refreshing) _refreshing = _refreshFn().finally(() => { _refreshing = null; });
    const ok = await _refreshing;
    if (ok) return request(method, path, body, true);
    if (_on401) _on401();
    throw Object.assign(new Error('Session expired'), { status: 401 });
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(err.message ?? 'Request failed'), { status: res.status, data: err });
  }

  return res.status === 204 ? null : res.json();
}

const get  = (path)        => request('GET',    path);
const post = (path, body)  => request('POST',   path, body);
const patch = (path, body) => request('PATCH',  path, body);
const del  = (path)        => request('DELETE', path);

// ── Auth ──────────────────────────────────────────────────────
export const auth = {
  register: (payload)              => post('/auth/register', payload),
  login:    (email, password)      => post('/auth/login', { email, password }),
  refresh:  (refreshToken)         => post('/auth/refresh', { refreshToken }),
  logout:   (refreshToken)         => post('/auth/logout', { refreshToken }),
};

// ── Users ─────────────────────────────────────────────────────
export const users = {
  me:        () => get('/users/me'),
  updateMe:  (payload) => patch('/users/me', payload),
};

// ── Home ──────────────────────────────────────────────────────
export const home = {
  dashboard: () => get('/home'),
};

// ── Meals ─────────────────────────────────────────────────────
export const meals = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
    ).toString();
    return get(`/meals${qs ? `?${qs}` : ''}`);
  },
  detail: (id) => get(`/meals/${id}`),
};

// ── Subscriptions ─────────────────────────────────────────────
export const subscriptions = {
  list:   () => get('/subscriptions'),
  create: (payload) => post('/subscriptions', payload),
  update: (id, payload) => patch(`/subscriptions/${id}`, payload),
  cancel: (id) => del(`/subscriptions/${id}`),
};

// ── Alerts ────────────────────────────────────────────────────
export const alerts = {
  active:  () => get('/alerts/active'),
  respond: (id, action, selectedMealId) => post(`/alerts/${id}/respond`, { action, ...(selectedMealId && { selectedMealId }) }),
};

// ── Orders ────────────────────────────────────────────────────
export const orders = {
  history: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined),
    ).toString();
    return get(`/orders${qs ? `?${qs}` : ''}`);
  },
  detail: (id) => get(`/orders/${id}`),
};

// setToken / clearToken are named exports at the top of this file
