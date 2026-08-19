const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });
  if (response.status === 401) { localStorage.removeItem('token'); if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) window.location.href = '/login'; throw new Error('Unauthorized'); }
  let data; try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) { const error = new Error(data?.error || `Request failed with status ${response.status}`); error.status = response.status; throw error; }
  return data;
}

export const api = {
  auth: { register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }), login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }), me: () => request('/auth/me'), logout: () => request('/auth/logout', { method: 'POST' }) },
  products: { list: () => request('/products'), get: (id) => request(`/products/${id}`) },
  cart: { get: () => request('/cart').then((data) => data.items || []), add: (payload) => request('/cart', { method: 'POST', body: JSON.stringify(payload) }).then((data) => data.items || []), remove: (productId) => request(`/cart/${productId}`, { method: 'DELETE' }).then((data) => data.items || []) },
  orders: { list: () => request('/orders'), create: () => request('/orders', { method: 'POST' }), get: (id) => request(`/orders/${id}`) },
  payments: { createOrder: (orderId) => request('/payments/create-order', { method: 'POST', body: JSON.stringify({ orderId }) }), verify: (payload) => request('/payments/verify', { method: 'POST', body: JSON.stringify(payload) }) },
  contact: { submit: (payload) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }) },
  admin: {
    dashboard: () => request('/admin/dashboard'), products: () => request('/admin/products'), createProduct: (payload) => request('/admin/products', { method: 'POST', body: JSON.stringify(payload) }), updateProduct: (id, payload) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }), deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
    categories: () => request('/admin/categories'), createCategory: (payload) => request('/admin/categories', { method: 'POST', body: JSON.stringify(payload) }), updateCategory: (id, payload) => request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }), deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),
    users: () => request('/admin/users'), updateUser: (id, payload) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }), resetUserPassword: (id) => request(`/admin/users/${id}/reset-password`, { method: 'POST' }),
    sales: () => request('/admin/sales'), reports: (params = {}) => { const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')).toString(); return request(`/admin/reports${query ? `?${query}` : ''}`); },
    orders: () => request('/admin/orders'), getOrder: (id) => request(`/admin/orders/${id}`), cancelOrder: (id) => request(`/admin/orders/${id}/cancel`, { method: 'PUT' }),
  },
};
