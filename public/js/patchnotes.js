const PATCHNOTES_VERSION = "2.1.1";
const STORAGE_KEY = "patchnotesLastSeen";

document.addEventListener("DOMContentLoaded", async () => {

  const lastSeen = localStorage.getItem(STORAGE_KEY);

  if (lastSeen === PATCHNOTES_VERSION) return;

  try {
    const res = await fetch("/api/patchnotes");
    const { patchnotes } = await res.json();

    if (!patchnotes || patchnotes.version !== PATCHNOTES_VERSION) return;

    buildPatchnotes(patchnotes);
    showPatchnotes();

  } catch (err) {
    console.error("Patchnotes error:", err);
  }
});

let pnIndex = 0;
let pnCount = 0;

function buildPatchnotes(data) {
  document.getElementById("patchnotes-title").textContent = data.title || "";

  const track = document.getElementById("pn-track");
  const dots = document.getElementById("pn-dots");
  const prevBtn = document.getElementById("pn-prev");
  const nextBtn = document.getElementById("pn-next");

  const features = Array.isArray(data.features) ? data.features : [];
  pnCount = features.length;
  pnIndex = 0;

  // Slides
  track.innerHTML = "";
  dots.innerHTML = "";

  features.forEach((f, i) => {
    const slide = document.createElement("div");
    slide.className = "pn-slide";

    if (f.image) {
      const img = document.createElement("img");
      img.src = f.image;
      img.alt = "";
      slide.appendChild(img);
    }

    const text = document.createElement("p");
    text.textContent = f.text || "";
    slide.appendChild(text);

    track.appendChild(slide);

    // dots
    const dot = document.createElement("button");
    dot.className = "pn-dot" + (i === 0 ? " is-active" : "");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.onclick = () => goToSlide(i);
    dots.appendChild(dot);
  });

  // Controls
  prevBtn.onclick = () => goToSlide(pnIndex - 1);
  nextBtn.onclick = () => goToSlide(pnIndex + 1);

  // Close button (inchangé mais stocke la bonne version)
  document.getElementById("patchnotesClose").onclick = () => {
    localStorage.setItem(STORAGE_KEY, data.version);
    hidePatchnotes();
  };

  // Initial state
  goToSlide(0, true);

  // Optional: keyboard arrows
  document.addEventListener("keydown", onPnKeydown);
}

function onPnKeydown(e) {
  const overlay = document.getElementById("patchNotesOverlay");
  if (overlay.classList.contains("patchnotes-hidden")) return;

  if (e.key === "ArrowLeft") goToSlide(pnIndex - 1);
  if (e.key === "ArrowRight") goToSlide(pnIndex + 1);
}

function goToSlide(index, immediate = false) {
  if (pnCount <= 0) return;

  pnIndex = Math.max(0, Math.min(index, pnCount - 1));

  const track = document.getElementById("pn-track");
  const prevBtn = document.getElementById("pn-prev");
  const nextBtn = document.getElementById("pn-next");
  const dots = document.querySelectorAll("#pn-dots .pn-dot");

  if (immediate) track.style.transition = "none";
  track.style.transform = `translateX(-${pnIndex * 100}%)`;
  // force reflow then restore transition
  if (immediate) {
    track.offsetHeight;
    track.style.transition = "";
  }

  prevBtn.disabled = pnIndex === 0;
  nextBtn.disabled = pnIndex === pnCount - 1;

  dots.forEach((d, i) => d.classList.toggle("is-active", i === pnIndex));
}

function showPatchnotes() {
  document.getElementById("patchNotesOverlay")
    .classList.remove("patchnotes-hidden");
}

function hidePatchnotes() {
  document.getElementById("patchNotesOverlay")
    .classList.add("patchnotes-hidden");
}

async function openPatchnotesManual() {
  try {
    const res = await fetch("/api/patchnotes");
    const { patchnotes } = await res.json();

    if (!patchnotes || patchnotes.version !== PATCHNOTES_VERSION) return;

    buildPatchnotes(patchnotes);
    showPatchnotes();

  } catch (err) {
    console.error("Patchnotes error:", err);
  }
}