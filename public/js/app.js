// public/js/app.js

// wrapper fetch with cookies + JSON auto
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

// Check login, else redirect to login page
async function requireAuth() {
  try {
    const me = await api('/auth/me');
    if (!me.user) throw new Error('No user');
    return me.user;
  } catch {
    window.location = '/login.html';
  }
}

// TODO: improve logout system
// Simple logout (just kill cookie client side)
async function logout() {
  await api('/auth/logout', { method: "POST" });
  window.location = "/login.html";
}

// Update manager
(() => {
  const VERSION_URL = "/version.txt";
  const CHECK_INTERVAL_MS = 10_000; // 10s
  const AUTO_RELOAD = false; // true = reload without warning

  let currentVersion = null;
  let checking = false;
  let bannerVersion = null;

  function hardReload(newVersion) {
    const url = new URL(window.location.href);
    url.searchParams.set("_v", newVersion);
    window.location.replace(url.toString());
  }

  function showBanner(newVersion) {
    if (bannerVersion === newVersion) return;
    bannerVersion = newVersion;

    const old = document.getElementById("app-update-banner");
    if (old) old.remove();

    const bar = document.createElement("div");
    bar.id = "app-update-banner";

    // min style (w/o dependancies)
    bar.style.position = "fixed";
    bar.style.left = "0";
    bar.style.right = "0";
    bar.style.top = "0";
    bar.style.zIndex = "10000";
    bar.style.padding = "0.8rem 1.25rem";
    bar.style.display = "flex";
    bar.style.gap = "1rem";
    bar.style.alignItems = "center";
    bar.style.justifyContent = "space-between";
    bar.style.backgroundColor = "#ffb2824D";

    const msg = document.createElement("div");
    msg.style.flex = "1";
    msg.textContent = t("update.banner");

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "1rem";
    actions.style.alignItems = "center";
    actions.style.flexShrink = "0";

    const reload = document.createElement("button");
    reload.type = "button";
    reload.textContent = t("update.reload_btn");
    reload.style.padding = "0.6rem";
    reload.style.display = "flex";
    reload.style.justifyContent = "center";
    reload.style.alignItems = "center";
    reload.style.cursor = "pointer";
    reload.style.borderRadius = "0.8rem";
    reload.style.fontSize = "0.9rem";

    reload.addEventListener("click", () => hardReload(newVersion));
    actions.appendChild(reload);

    bar.appendChild(msg);
    bar.appendChild(actions);

    // injection DOM
    (document.body || document.documentElement).appendChild(bar);
  }

  async function fetchVersion() {
    const r = await fetch(VERSION_URL, { cache: "no-store" });
    if (!r.ok) throw new Error("version fetch failed: " + r.status);
    return (await r.text()).trim();
  }

  async function check(reason) {
    if (checking) return;
    checking = true;
    try {
      const serverVersion = await fetchVersion();
      if (!serverVersion) return;

      // first version seen by this tab
      if (currentVersion === null) {
        currentVersion = serverVersion;
        return;
      }

      // change => banner/reload
      if (serverVersion !== currentVersion) {
        if (AUTO_RELOAD) hardReload(serverVersion);
        else showBanner(serverVersion);
      }
    } catch { } finally {
      checking = false;
    }
  }

  // Mobile (bfcache / tab restore)
  const startTime = Date.now();

  window.addEventListener('pagehide', () => {
    navigator.sendBeacon('/api/metrics/end', JSON.stringify({
      event: 'pagehide',
      duration: Date.now() - startTime
    }));
  });

  window.addEventListener("pageshow", () => check("pageshow"));

  // Re-check
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") { check("visible") }
    else if (document.visibilityState === 'hidden') {
      navigator.sendBeacon('/api/metrics/end', JSON.stringify({
        event: 'hidden',
        duration: Date.now() - startTime
      }));
    }
  });

  // Focus
  window.addEventListener("focus", () => check("focus"));

  // Polling
  setInterval(() => check("interval"), CHECK_INTERVAL_MS);

  // First check
  check("init");
})();
