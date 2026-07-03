// public/js/board.js

const ResumeManager = (() => {
  const registry = new Map();
  let lastTrigger = 0;

  function runEntry(entry) {
    entry.running = true;
    let settled = false;
    const release = () => {
      if (settled) return;
      settled = true;
      entry.lastRun = Date.now();
      entry.running = false;
    };
    Promise.resolve(entry.fn())
      .catch(e => console.error('[resume]', e))
      .finally(release);
    setTimeout(release, 15000);
  }

  function trigger() {
    const now = Date.now();
    if (now - lastTrigger < 100) return;
    lastTrigger = now;
    for (const entry of registry.values()) {
      if (entry.running) continue;
      if (now - entry.lastRun < entry.minInterval) continue;
      runEntry(entry);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') trigger();
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) trigger();
  });
  window.addEventListener('focus', () => trigger());

  return {
    register(key, fn, { minInterval = 3000 } = {}) {
      registry.set(key, { fn, minInterval, lastRun: 0, running: false });
    }
  };
})();

function reinitOnResume(key, fn, options) {
  ResumeManager.register(key, fn, options);
}

function normalizeList(res) {
  return Array.isArray(res) ? res : (res && res.notes) || [];
}
function normalizeMemory(res) {
  if (!res) return null;
  return res.memory !== undefined ? res.memory : (res.id ? res : null);
}

let boardView = null;
const notesById = new Map();
let memoryId = null;

function timeLeftFromDate(dateStr){
  const now = new Date();
  const expire = new Date(dateStr);
  const diff = expire - now;

  if (diff <= 0) return false;

  const h = Math.floor(diff/3600000);
  const m = Math.floor((diff%3600000)/60000);
  return `${h}h ${m}m`;
}

(async () => {
  const user = await requireAuth();

  const stats = await api('/stats');
  if(stats.partner) {
    await displayNotes();
    reinitOnResume('board', resumeBoard, { minInterval: 4000 });
    return;
  }

  document.getElementById('home').style.display = 'none';
  document.getElementById('coupleZone').classList.remove('hidden');

  if(user.coupleId) {
    await displayCoupleCode();
    return;
  }
  initCoupleZone();

})();

async function displayCoupleCode() {
  const coupleCode = await api('/couple/code');
  document.getElementById('coupleCode').textContent = coupleCode.code;
  document.getElementById('joinCoupleForm').classList.add('hidden');
  document.getElementById('createCoupleSection').classList.add('hidden');
  document.getElementById('copyCoupleCode').addEventListener('click', async () => {
    const code = document.getElementById('coupleCode').innerText;
    try{
      await navigator.clipboard.writeText(code);
      alert(t("couple.copied"));
    } catch(e) {
      alert(t("couple.copy_error"));
    }
  });
}

function initCoupleZone() {
  document.getElementById('coupleInfo').classList.add('hidden');
  document.getElementById('createCoupleBtn').onclick = async () => {
    try {
      const r = await api('/couple/create', { method: 'POST' });
      window.location.reload();
    } catch (e) {
      alert(t("error." + e.message) || t("error.UNKNOWN"));
    }
  };

  document.getElementById('joinCoupleBtn').onclick = async () => {
    try {
      const code = document.getElementById('inviteCode').value.trim();
      const r = await api('/couple/join', {
        method: 'POST',
        body: { code }
      });
      if (r.success) window.location.reload();
    } catch (e) {
      alert(t("error." + e.message) || t("error.UNKNOWN"));
    }
  };
}

async function displayNotes() {
  await loadNotes();
}

function setupNotesTrigger() {
  const notesTrigger = document.getElementById("notes-trigger");
  if (notesTrigger.dataset.bound) return;
  notesTrigger.dataset.bound = "1";
  notesTrigger.addEventListener("click", () => {
    notesTrigger.classList.remove('active');
    document.querySelectorAll('#home div.notes:not(.memory-notes)').forEach(note => {
      note.classList.remove('focused');
      setTimeout(() => note.classList.add('render-clear'), 1000);
    });
  });
}

function attachNoteClickHandlers(wrapper) {
  wrapper.classList.add('render-clear');
  const notesTrigger = document.getElementById("notes-trigger");
  wrapper.addEventListener('click', () => {
    if (wrapper.classList.contains('render-clear')) {
      wrapper.classList.remove('render-clear');
      wrapper.classList.add('focused');
      notesTrigger.classList.add('active');
    }
  });
}

function buildNoteElement(n) {
  const wrapper = document.createElement("div");
  wrapper.className = "notes";
  wrapper.dataset.noteId = n.id;

  const img = document.createElement("img");
  img.src = n.image;
  img.alt = "Note";
  img.className = "note-img";

  const span = document.createElement("span");
  span.textContent = t("notes.time_left") + " " + timeLeftFromDate(n.expiresAt);

  const shadow = document.createElement("div");
  shadow.className = "shadow";

  const spot = document.createElement("div");
  spot.className = "spotlight";

  wrapper.appendChild(img);
  wrapper.appendChild(span);
  wrapper.appendChild(shadow);
  wrapper.appendChild(spot);
  return wrapper;
}

function rand(min,max){ return Math.random()*(max-min)+min; }

function overlap(a, list){
  return list.some(b => !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  ));
}

async function placeNotesRandom() {
  const board = document.getElementById("home");
  const notes = [...document.querySelectorAll("div.notes")];

  await Promise.all(notes.map(n => new Promise(res=>{
    const img = n.querySelector("img");
    if(img.complete) res();
    else img.onload = res;
  })));

  const boardRect = board.getBoundingClientRect();
  const placed = [];

  for(const el of notes) {
    let x, y, tries = 0;
    const maxTries = 1;

    if (window.screen.width <= 720 && notes.length > 3) {
      document.documentElement.style.cssText = "--note-size: 10rem";
    }

    const rect = el.getBoundingClientRect();
    let w = rect.width;
    let h = rect.height;

    const rot = rand(-10,10);
    el.style.rotate = `${rot}deg`;

    const rad = Math.abs(rot * Math.PI / 180);
    const inscribedDiff = Math.sin(rad) + Math.cos(rad);
    const realDim = w * inscribedDiff;

    do {
      x = rand(realDim - w, boardRect.width - realDim);
      y = rand(realDim - h, boardRect.height - realDim);
      tries++;
    } while( overlap({x,y,w,h}, placed) && tries < maxTries );

    el.style.left = x + "px";
    el.style.top = y + "px";

    placed.push({x,y,w,h});
  }
  setTimeout(() => {
    notes.forEach(el => {
      el.classList.add('loaded');
    });
  }, 800);
}

// Places only newly-diffed-in notes; never repositions already-placed ones.
async function placeNewNotes(newEls) {
  const board = document.getElementById("home");

  await Promise.all(newEls.map(n => new Promise(res=>{
    const img = n.querySelector("img");
    if(img.complete) res();
    else img.onload = res;
  })));

  const boardRect = board.getBoundingClientRect();
  const placed = [...notesById.values()]
    .filter(el => !newEls.includes(el))
    .map(el => {
      const r = el.getBoundingClientRect();
      return { x: r.left - boardRect.left, y: r.top - boardRect.top, w: r.width, h: r.height };
    });

  for (const el of newEls) {
    const rect = el.getBoundingClientRect();
    const w = rect.width, h = rect.height;

    const rot = rand(-10,10);
    el.style.rotate = `${rot}deg`;
    const rad = Math.abs(rot * Math.PI / 180);
    const inscribedDiff = Math.sin(rad) + Math.cos(rad);
    const realDim = w * inscribedDiff;

    let x, y, tries = 0;
    do {
      x = rand(realDim - w, boardRect.width - realDim);
      y = rand(realDim - h, boardRect.height - realDim);
      tries++;
    } while (overlap({x,y,w,h}, placed) && tries < 1);

    el.style.left = x + "px";
    el.style.top = y + "px";
    placed.push({x,y,w,h});
  }

  setTimeout(() => newEls.forEach(el => el.classList.add('loaded')), 300);
}

function removeNoteEl(el) {
  el.style.transition = 'opacity .4s ease';
  el.style.opacity = '0';
  setTimeout(() => el.remove(), 420);
}

function clearNotesContainer() {
  notesById.forEach(el => el.remove());
  notesById.clear();
}

function clearMemoryContainer() {
  document.getElementById('memory').innerHTML = '';
  memoryId = null;
}

function renderNotesView(active) {
  clearMemoryContainer();
  const notesDiv = document.getElementById('home');
  active.forEach(n => {
    const wrapper = buildNoteElement(n);
    attachNoteClickHandlers(wrapper);
    notesDiv.appendChild(wrapper);
    notesById.set(n.id, wrapper);
  });
  setupNotesTrigger();
  boardView = 'notes';
  placeNotesRandom();
}

function memoryTemplate(m) {
  const formatApiDate = s => new Date(Date.parse(s)).toLocaleDateString(
    i18nCurrentLang() === 'fr' ? 'fr-FR' : 'en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' }
  );
  return `
    <img class='memory-gif' src='/images/bubu_dudu_gif/hug_endless.gif' alt='Gif couple Dudu et Bubu'/>
    <button id='memories-reveal' onClick="displayMemory()">
    ${t("memory.reveal_btn")}</button>
    <span class='memories-title'>${t("memory.title")}</span>
    <div class='notes memory-notes loaded'>
    <img src='${m.image}' alt='Note'/>
    <span>${t("memory.created_hint")} ${formatApiDate(m.createdAt)}</span>
    <div class='shadow'></div><div class='spotlight'></div></div>`;
}

function renderMemoryView(memory) {
  clearNotesContainer();
  const memoryDiv = document.getElementById('memory');

  if (memory) {
    memoryDiv.innerHTML = memoryTemplate(memory);
    memoryId = memory.id;
    boardView = 'memory';
  } else {
    memoryDiv.innerHTML = `
    <img class='memory-gif' src="/images/bubu_dudu_gif/bored_endless.gif" alt="Gif Dudu s'ennui"/>
    <button id='memories-reveal' class='no-memories'>
    ${t("memory.none_btn")}</button>`;
    memoryId = null;
    boardView = 'bored';
  }
}

async function loadNotes() {
  try {
    const res = await api('/note/list');
    const active = normalizeList(res).filter(n => timeLeftFromDate(n.expiresAt));

    if (active.length > 0) {
      renderNotesView(active);
    } else {
      const m = await api('/memory/random');
      renderMemoryView(normalizeMemory(m));
    }
  } catch (e) {
    console.error(e);
  }
}

function displayMemory() {
  document.getElementById('memory').setAttribute('drawn','');
}

// Called on resume (visibilitychange -> visible, or pageshow with persisted).
// Fetches the list; flips view (notes <-> memory) on transition, diffs in place otherwise.
async function resumeBoard() {
  const res = await api('/note/list');
  const active = normalizeList(res).filter(n => timeLeftFromDate(n.expiresAt));

  if (active.length > 0) {
    if (boardView !== 'notes') {
      renderNotesView(active);
    } else {
      diffUpdateNotes(active);
    }
  } else {
    if (boardView === 'notes' || boardView === null) {
      const m = await api('/memory/random');
      renderMemoryView(normalizeMemory(m));
    } else if (boardView === 'memory' || boardView === 'bored') {
      const m = await api('/memory/random');
      diffUpdateMemory(normalizeMemory(m));
    }
  }
}

// Id-keyed diff against notesById: removes gone notes, adds new ones,
// leaves unchanged notes untouched. Skips entirely if a note is currently focused.
function diffUpdateNotes(active) {
  const anyFocused = [...notesById.values()].some(el => el.classList.contains('focused'));
  if (anyFocused) return;

  const incomingIds = new Set(active.map(n => n.id));

  for (const [id, el] of [...notesById.entries()]) {
    if (!incomingIds.has(id)) {
      removeNoteEl(el);
      notesById.delete(id);
    }
  }

  const newEls = [];
  active.forEach(n => {
    if (notesById.has(n.id)) return;
    const wrapper = buildNoteElement(n);
    attachNoteClickHandlers(wrapper);
    document.getElementById('home').appendChild(wrapper);
    notesById.set(n.id, wrapper);
    newEls.push(wrapper);
  });

  if (newEls.length) placeNewNotes(newEls);
}

// Diffs memory by id: no-op if unchanged, otherwise swaps content and
// replays the reveal animation if it was already drawn.
function diffUpdateMemory(memory) {
  if (!memory) {
    if (boardView !== 'bored') renderMemoryView(null);
    return;
  }
  if (memory.id === memoryId) return;

  const memoryDiv = document.getElementById('memory');
  const wasDrawn = memoryDiv.hasAttribute('drawn');

  memoryDiv.innerHTML = memoryTemplate(memory);
  memoryId = memory.id;
  boardView = 'memory';

  if (wasDrawn) {
    memoryDiv.removeAttribute('drawn');
    void memoryDiv.offsetWidth;
    memoryDiv.setAttribute('drawn', '');
  }
}