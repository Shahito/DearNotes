// public/js/write.js

// Auth / i18n
(async () => {
  const [user] = await Promise.all([
    requireAuth(),
    new Promise(resolve => document.addEventListener('i18n:ready', resolve, { once: true }))
  ]);
  if (!user.onboardingWrite) startOnboarding();
})();

// Config
const config = {
  canvasId: 'draw-box',
  brushIds: ['brush-size-1', 'brush-size-2', 'brush-size-3', 'brush-size-4'],
  zoomIndicatorId: 'zoom-indicator',
  brushSizes: [2, 5, 25, 50],
  undoButtonId: 'undo-btn',
  redoButtonId: 'redo-btn',
  memory_limit: 50,
  clearButtonId: 'cancel-btn',
  saveButtonId: 'save-btn',
  clearColor: '#f3e779'
};

// Canvas setup
const canvas = document.getElementById(config.canvasId);
const ctx = canvas.getContext('2d');

// Offscreen, always drawn at 1:1
const offscreen = document.createElement('canvas');
let offCtx;

// State
let drawing = false;
let currentColor = '#000000';
let currentBrushSize = config.brushSizes[0];
let history = [];
let redoStack = [];
let lastPos = null;
let moved = false;
let protectionActive = true;
let suppressNextDot = false;

// Zoom / pan
const zoomIndicator = document.getElementById(config.zoomIndicatorId);
let zoom = 1;
let panX = 0;
let panY = 0;
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

// Touch tracking
let activeTouches = {};
let pinching = false;
let lastPinchDist = null;
let lastPinchMid = null;


// Init
function initCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;
  offCtx = offscreen.getContext('2d');

  if (history.length > 0) {
    const img = new Image();
    img.onload = () => {
      offCtx.drawImage(img, 0, 0);
      renderVisible();
    };
    img.src = history[history.length - 1];
  } else {
    offCtx.fillStyle = config.clearColor;
    offCtx.fillRect(0, 0, offscreen.width, offscreen.height);
    renderVisible();
  }
  updateUndoRedoButtons();
}
initCanvas();

// Render
function renderVisible() {
  clampPan();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    offscreen,
    panX, panY,
    offscreen.width  * zoom,
    offscreen.height * zoom
  );
}

// Coordinates
function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left - panX) / zoom,
    y: (e.clientY - rect.top - panY) / zoom
  };
}

// Zoom
function clampPan() {
  panX = Math.min(0, Math.max(panX, canvas.width - offscreen.width * zoom));
  panY = Math.min(0, Math.max(panY, canvas.height - offscreen.height * zoom));
}

function applyZoom(newZoom, screenCX, screenCY) {
  newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
  panX = screenCX - (screenCX - panX) * (newZoom / zoom);
  panY = screenCY - (screenCY - panY) * (newZoom / zoom);
  zoom = newZoom;
  clampPan();
  renderVisible();
  updateZoomUI();
}

function resetZoom() {
  const startZoom = zoom;
  const startPanX = panX;
  const startPanY = panY;
  const duration  = 300; // ms
  const start     = performance.now();

  function animate(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3); // ease out cubic

    zoom = startZoom + (1 - startZoom) * ease;
    panX = startPanX + (0 - startPanX) * ease;
    panY = startPanY + (0 - startPanY) * ease;

    renderVisible();
    updateZoomUI();

    if (t < 1) requestAnimationFrame(animate);
    else { zoom = 1; panX = 0; panY = 0; renderVisible(); updateZoomUI(); }
  }

  requestAnimationFrame(animate);
}

function updateZoomUI() {
  if (!zoomIndicator) return;
  const isZoomed = zoom > 1.001;
  zoomIndicator.textContent = isZoomed ? `x${zoom.toFixed(1)}` : 'x1';
  zoomIndicator.classList.toggle('active', isZoomed);
  canvas.closest('.canvas-wrapper').classList.toggle('zoomed', isZoomed);
}

// History
function saveState() {
  history.push(offscreen.toDataURL());
  if (history.length > config.memory_limit) history.shift();
  redoStack = [];
  updateUndoRedoButtons();
}

function restoreState(url) {
  const img = new Image();
  img.onload = () => {
    offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
    offCtx.drawImage(img, 0, 0);
    renderVisible();
  };
  img.src = url;
  updateUndoRedoButtons();
}

function undo() {
  updateUndoRedoButtons();
  if (history.length === 0) return;
  const last = history.pop();
  redoStack.push(offscreen.toDataURL());
  restoreState(last);
}

function redo() {
  updateUndoRedoButtons();
  if (redoStack.length === 0) return;
  const redoState = redoStack.pop();
  history.push(offscreen.toDataURL());
  restoreState(redoState);
}

function updateUndoRedoButtons() {
  document.getElementById(config.undoButtonId).classList.toggle('inactive-btn', history.length === 0);
  document.getElementById(config.redoButtonId).classList.toggle('inactive-btn', redoStack.length === 0);
}

function clearCanvas() {
  if (confirm(t("note.confirm_clear"))) {
    saveState();
    offCtx.fillStyle = config.clearColor;
    offCtx.fillRect(0, 0, offscreen.width, offscreen.height);
    renderVisible();
  }
}

// Drawing
function startDrawing(e) {
  drawing = true;
  lastPos = getCanvasPos(e);
  moved = false;
  offCtx.beginPath();
  offCtx.moveTo(lastPos.x, lastPos.y);
  saveState();
}

function draw(e) {
  if (!drawing) return;
  moved = true;
  const pos = getCanvasPos(e);
  const dx = pos.x - lastPos.x;
  const dy = pos.y - lastPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(1, Math.floor(dist / 0.2));

  for (let i = 0; i < steps; i++) {
    offCtx.lineTo(lastPos.x + (dx * i) / steps, lastPos.y + (dy * i) / steps);
  }
  offCtx.lineTo(pos.x, pos.y);
  offCtx.strokeStyle = currentColor;
  offCtx.lineWidth = currentBrushSize;
  offCtx.lineCap = 'round';
  offCtx.lineJoin = 'round';
  offCtx.stroke();
  lastPos = pos;
  renderVisible();
}

function stopDrawing() {
  if (!moved && lastPos && !suppressNextDot) {
    offCtx.beginPath();
    offCtx.arc(lastPos.x, lastPos.y, currentBrushSize / 2, 0, Math.PI * 2);
    offCtx.fillStyle = currentColor;
    offCtx.fill();
    renderVisible();
  }
  drawing = false;
  lastPos = null;
  suppressNextDot = false;
}

// Send
async function sendCanvas() {
  if (!confirm(t("note.confirm_send"))) return;
  protectionActive = false;
  try {
    const dataURL = offscreen.toDataURL('image/png');
    const res = await api('/note/add', { method: 'POST', body: { image: dataURL } });
    if (res.success) window.location = '/board.html';
    else alert(res.error || t("note.send_error"));
  } catch (e) {
    alert(t("error." + e.message) || t("error.UNKNOWN"));
  }
}

window.addEventListener("beforeunload", (e) => {
  if (protectionActive) { e.preventDefault(); e.returnValue = ""; }
});

// Pointer events
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);
  activeTouches[e.pointerId] = { x: e.clientX, y: e.clientY };

  const fingers = Object.keys(activeTouches).length;

  if (fingers === 2) {
    suppressNextDot = true;
    if (drawing) stopDrawing();
    drawing = false;
    pinching = true;
    const pts = Object.values(activeTouches);
    lastPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    lastPinchMid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    return;
  }

  if (fingers === 1 && !pinching) startDrawing(e);
}, { passive: false });

canvas.addEventListener('pointermove', (e) => {
  e.preventDefault();
  activeTouches[e.pointerId] = { x: e.clientX, y: e.clientY };
  const fingers = Object.keys(activeTouches).length;

  if (fingers === 2 && pinching) {
    const pts = Object.values(activeTouches);
    const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    const rect = canvas.getBoundingClientRect();

    if (lastPinchMid) {
      panX += mid.x - lastPinchMid.x;
      panY += mid.y - lastPinchMid.y;
      clampPan();
    }

    if (lastPinchDist) {
      applyZoom(zoom * (dist / lastPinchDist), mid.x - rect.left, mid.y - rect.top);
    }

    lastPinchDist = dist;
    lastPinchMid = mid;
    return;
  }

  if (fingers === 1 && !pinching) draw(e);
}, { passive: false });

canvas.addEventListener('pointerup', (e) => {
  e.preventDefault();
  delete activeTouches[e.pointerId];
  const fingers = Object.keys(activeTouches).length;

  if (fingers === 0) {
    if (!pinching) stopDrawing();
    pinching = false; lastPinchDist = null; lastPinchMid = null;
  }

  if (fingers === 1 && pinching) {
    pinching = false; lastPinchDist = null; lastPinchMid = null;
    drawing = false;
  }
}, { passive: false });

canvas.addEventListener('pointercancel', (e) => {
  delete activeTouches[e.pointerId];
  if (Object.keys(activeTouches).length === 0) {
    stopDrawing();
    pinching = false; lastPinchDist = null; lastPinchMid = null;
  }
});

canvas.addEventListener('pointerleave', (e) => {
  if (!activeTouches[e.pointerId]) return;
  delete activeTouches[e.pointerId];
  if (Object.keys(activeTouches).length === 0 && !pinching) stopDrawing();
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  applyZoom(zoom * (e.deltaY < 0 ? 1.1 : 0.9), e.clientX - rect.left, e.clientY - rect.top);
}, { passive: false });

canvas.addEventListener('contextmenu', e => e.preventDefault());

// Color palette
const colorIndicator = document.getElementById("selected-brush");

colorIndicator.addEventListener("click", () => {
  const brushes = document.querySelectorAll("#color-palette span.color-brush");
  const isOpen = brushes[0]?.getAttribute("visible") === "true";
  document.querySelector("#color-palette").setAttribute("visible", String(!isOpen));
  brushes.forEach(b => b.setAttribute("visible", String(!isOpen)));
  canvas.setAttribute("palette-open", String(!isOpen));
});

const allBrushSelectors = document.querySelectorAll("#color-palette span.color-brush, #eraser-brush");
allBrushSelectors.forEach(brush => {
  brush.addEventListener("click", () => {
    allBrushSelectors.forEach(el => el.removeAttribute("selected"));
    brush.setAttribute("selected", "");
    const color = brush.getAttribute("color");
    colorIndicator.style.backgroundColor = color;
    colorIndicator.setAttribute("rnb", "false");
    allBrushSelectors.forEach(b => b.setAttribute("visible", "false"));
    canvas.setAttribute("palette-open", "false");
    document.querySelector("#color-palette").setAttribute("visible", "false");
    currentColor = color === "eraser" ? config.clearColor : color;
  });
});

// Brush sizes
config.brushIds.forEach((id, index) => {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', () => {
    config.brushIds.forEach(bid => document.getElementById(bid).removeAttribute("selected"));
    currentBrushSize = config.brushSizes[index];
    btn.setAttribute("selected", "");
  });
});

// Toolbar
document.getElementById(config.undoButtonId)?.addEventListener('click', undo);
document.getElementById(config.redoButtonId)?.addEventListener('click', redo);
document.getElementById(config.clearButtonId)?.addEventListener('click', clearCanvas);
document.getElementById(config.saveButtonId)?.addEventListener('click', sendCanvas);
zoomIndicator?.addEventListener('click', resetZoom);

// Resize
window.addEventListener('resize', initCanvas);