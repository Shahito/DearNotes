// public/js/i18n.js

const SUPPORTED = ['fr', 'en'];
const DEFAULT_LANG = 'fr';

function detectLang() {
  const saved = localStorage.getItem('lang');
  if (saved && SUPPORTED.includes(saved)) return saved;

  const browser = (navigator.language || 'fr').slice(0, 2).toLowerCase();
  if (SUPPORTED.includes(browser)) return browser;

  return DEFAULT_LANG;
}

let translations = {};
let currentLang = DEFAULT_LANG;

async function loadLang(lang) {
  const res = await fetch(`/locales/${lang}.json`);
  translations = await res.json();
  currentLang = lang;
  document.documentElement.lang = lang;
}

function t(key, vars = {}) {
  let str = translations[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

function setLang(lang) {
  localStorage.setItem('lang', lang);
  location.reload();
}

function applyToDOM() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const attr = el.dataset.i18nAttr;
    if (attr) {
      el.setAttribute(attr, t(key));
    } else {
      el.textContent = t(key);
    }
  });
  const titleKey = document.documentElement.dataset.i18nTitle;
  if (titleKey) document.title = t(titleKey);
}

async function initI18n() {
  const lang = detectLang();
  await loadLang(lang);
  applyToDOM();
  document.dispatchEvent(new Event('i18n:ready'));
}

window.t = t;
window.setLang = setLang;
window.i18nCurrentLang = () => currentLang;
window.initI18n = initI18n;