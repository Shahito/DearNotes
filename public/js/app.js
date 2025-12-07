// public/js/app.js

// wrapper fetch avec cookies + JSON auto
async function api(url, options = {}) {
  options.credentials = 'include';

  if (options.body && typeof options.body !== 'string') {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch('/api' + url, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

// vérifie qu'on est loggé, sinon redirige vers login
async function requireAuth() {
  try {
    const me = await api('/auth/me');
    if (!me.user) throw new Error('No user');
    return me.user;
  } catch {
    window.location = '/login.html';
  }
}

// logout simple (on kill le cookie côté client)
async function logout(){
  await api('/auth/logout', {method:"POST"});
  window.location = "/login.html";
}
