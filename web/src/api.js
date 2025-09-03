const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => localStorage.setItem('token', t);
export const clearToken = () => localStorage.removeItem('token');

async function req(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers||{}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(()=>({error:'erro'}));
    throw new Error(err.error || 'erro');
  }
  return res.json();
}

export const api = {
  register: (body) => req('/auth/register', { method:'POST', body: JSON.stringify(body) }),
  login:    (body) => req('/auth/login', { method:'POST', body: JSON.stringify(body) }),
  me:       () => req('/me'),
  categories: () => req('/categories'),
  plans: () => req('/plans'),
  createBusiness: (body) => req('/businesses', { method:'POST', body: JSON.stringify(body) }),
  myBusiness: (id) => req(`/businesses/${id}`),
  listBusinesses: (featured = 0, limit=12) => req(`/businesses?featured=${featured}&limit=${limit}`),
  search: (params) => {
    const q = new URLSearchParams(params).toString();
    return req(`/search?${q}`);
  },
  createProduct: (body) => req('/products', { method:'POST', body: JSON.stringify(body) }),
  createPromo: (body) => req('/promotions', { method:'POST', body: JSON.stringify(body) })
};
