// public/js/board.js
function timeLeftFromDate(dateStr){
  const now = new Date();
  const expire = new Date(dateStr);
  const diff = expire - now; // ms before expiration

  if (diff <= 0) return false;
  
  const h = Math.floor(diff/3600000);
  const m = Math.floor((diff%3600000)/60000);
  return `${h}h ${m}m`;
}

(async () => {
  const user = await requireAuth(); // redirige si pas loggé
  
  const stats = await api('/stats');
  if(stats.partner) {
    await displayNotes();
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
  // Show couple code to shared
  const coupleCode = await api('/couple/code');
  document.getElementById('coupleCode').textContent = coupleCode.code;
  document.getElementById('joinCoupleForm').classList.add('hidden');
  document.getElementById('createCoupleSection').classList.add('hidden');
  document.getElementById('copyCoupleCode').addEventListener('click', async () => {
    const code = document.getElementById('coupleCode').innerText;
    try{
      await navigator.clipboard.writeText(code);
      alert("Code copié !");
    } catch(e) {
      alert("Impossible de copier le code.");
    }
  });
}

function initCoupleZone() {
  // Show and init couple join/create form
  document.getElementById('coupleInfo').classList.add('hidden');
  document.getElementById('createCoupleBtn').onclick = async () => {
    try {
      const r = await api('/couple/create', { method: 'POST' });
      window.location.reload();
    } catch (e) {
      alert(e.message);
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
      alert(e.message);
    }
  };
}

async function displayNotes() {
  // Load and display live notes
    await loadNotes();
    const allNotes = document.querySelectorAll('div.notes');
    const notesTrigger = document.getElementById("notes-trigger");
    allNotes.forEach(note => {
        if(note.classList.contains('memory-notes')) return;
        note.classList.add('render-clear');
        note.addEventListener('click', () => {
          if(note.classList.contains('render-clear')) {
            note.classList.remove('render-clear');
            note.classList.add('focused');
            notesTrigger.classList.add('active');
          }
        });
    });
    notesTrigger.addEventListener("click", () => {
        allNotes.forEach(note => {
            note.classList.remove('focused');
            notesTrigger.classList.remove('active');
            setTimeout(() => {
              note.classList.add('render-clear');
            }, 1000);
        });
    });
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

function rand(min,max){ return Math.random()*(max-min)+min; }

function overlap(a, list){
  return list.some(b => !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  ));
}

async function loadNotes() {
  try {
    const res = await api('/note/list');

    const notesDiv = document.getElementById('home');
    const memoryDiv = document.getElementById('memory');

    if (res.notes && res.notes.length > 0) {
      res.notes.forEach(n => {
        if(!timeLeftFromDate(n.expiresAt)) return;
        const wrapper = document.createElement("div");
        wrapper.className = "notes";

        const img = document.createElement("img");
        img.src = n.image;
        img.alt = "Note";
        img.className = "note-img";
        
        const span = document.createElement("span");
        span.textContent = "Temps restant : " + timeLeftFromDate(n.expiresAt);

        const shadow = document.createElement("div");
        shadow.className = "shadow";

        const spot = document.createElement("div");
        spot.className = "spotlight";

        wrapper.appendChild(img);
        wrapper.appendChild(span);
        wrapper.appendChild(shadow);
        wrapper.appendChild(spot);

        notesDiv.appendChild(wrapper);
      });
      // after rendering placement
      placeNotesRandom();
    } else {
      const m = await api('/memory/random');
      if (m.memory) {
        const formatApiDate = s => new Date(Date.parse(s)).toLocaleDateString('fr-FR');
        memoryDiv.innerHTML =`
          <img class='memory-gif' src='/images/bubu_dudu_gif/hug_endless.gif' alt='Gif couple Dudu et Bubu'/>
          <button id='memories-reveal' onClick="displayMemory()">
          Voir un souvenir aléatoire</button>
          <span class='memories-title'>Le souvenir d'aujourd'hui</span>
          <div class='notes memory-notes loaded'>
          <img src='${m.memory.image}' alt='Note'/>
          <span>Créée le ${formatApiDate(m.memory.createdAt)}</span>
          <div class='shadow'></div><div class='spotlight'></div></div>`;
      } else {
        memoryDiv.innerHTML = `
        <img class='memory-gif' src="/images/bubu_dudu_gif/bored_endless.gif" alt="Gif Dudu s'ennui"/>
        <button id='memories-reveal' class='no-memories'>
        Aucune note archivée</button>`;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

function displayMemory() {
  document.getElementById('memory').setAttribute('drawn','');
}