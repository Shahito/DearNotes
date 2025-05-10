// Configuration globale
const config = {
    canvasId: 'draw-box',
    brushIds: ['brush-size-1', 'brush-size-2', 'brush-size-3', 'brush-size-4'],
    brushSizes: [2, 5, 20, 50],
    colorButtonClass: 'color-brush',
    undoButtonId: 'undo-btn',
    redoButtonId: 'redo-btn',
    clearButtonId: 'cancel-btn',
    saveButtonId: 'save-btn',
    clearColor: '#f3e779'
};

// Initialisation
const canvas = document.getElementById(config.canvasId);
const ctx = canvas.getContext('2d');
let drawing = false;
let currentColor = '#000000';
let currentBrushSize = config.brushSizes[0];

let history = [];
let redoStack = [];
let lastPos = null;
let moved = false;

// Utilise les dimensions CSS réelles du canvas
function initCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = config.clearColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateUndoRedoButtons();
}
initCanvas();

// Utils
function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    let touch = e.touches?.[0] || e.changedTouches?.[0] || e;
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

// Fonctions

let color_indicator = document.getElementById("selected-brush");
color_indicator.addEventListener("click", () => {
    let brush_selectors = document.querySelectorAll("#draw-palette span.color-brush");
    brush_selectors.forEach(brush => {
        if (brush.getAttribute("visible") === "false") {
            brush.setAttribute("visible", "true");
            canvas.setAttribute("palette-open", "true");
        } else {
            brush.setAttribute("visible", "false");
            canvas.setAttribute("palette-open", "false");
        }
    });
});

const brush_selectors = document.querySelectorAll("#draw-palette span.color-brush,#eraser-brush");
brush_selectors.forEach(brush => {
    brush.addEventListener("click", () => {
        brush_selectors.forEach((el) => { el.removeAttribute("selected"); });
        brush.setAttribute("selected", "");
        color = brush.getAttribute("color");
        color_indicator.style.backgroundColor = color;
        color_indicator.setAttribute("rnb", "false");
        brush_selectors.forEach(_ => {
            _.setAttribute("visible", "false");
        });
        canvas.setAttribute("palette-open", "false");
        if (color === "eraser") {
            currentColor = config.clearColor;
        } else {
            currentColor = color;
        }
    });
});

function updateUndoRedoButtons() {
    const undoButton = document.getElementById(config.undoButtonId);
    const redoButton = document.getElementById(config.redoButtonId);

    // Désactiver ou activer le bouton Undo
    if (history.length === 0) {
        undoButton.classList.add('inactive-btn');
    } else {
        undoButton.classList.remove('inactive-btn');
    }

    // Désactiver ou activer le bouton Redo
    if (redoStack.length === 0) {
        redoButton.classList.add('inactive-btn');
    } else {
        redoButton.classList.remove('inactive-btn');
    }
}

function save(e) {
    let dataURL = canvas.toDataURL();
    let form = document.getElementById("form-post-notes");
    let data_input = document.getElementById("data-img");
    e.preventDefault();
    let transition_bg = document.getElementById("transition-bg");
    transition_bg.setAttribute("active-bg0", "true");
    data_input.value = dataURL;
    form.submit();
}

function saveState() {
    history.push(canvas.toDataURL());
    if (history.length > 50) history.shift(); // limite mémoire
    redoStack = [];
    updateUndoRedoButtons();
}

function restoreState(stateURL) {
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = stateURL;
    updateUndoRedoButtons();
}

function undo() {
    updateUndoRedoButtons();
    if (history.length === 0) return;
    const last = history.pop();
    redoStack.push(canvas.toDataURL());
    restoreState(last);
}

function redo() {
    updateUndoRedoButtons();
    if (redoStack.length === 0) return;
    const redoState = redoStack.pop();
    history.push(canvas.toDataURL());
    restoreState(redoState);
}

function clearCanvas() {
    saveState();
    ctx.fillStyle = config.clearColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function startDrawing(e) {
    drawing = true;
    lastPos = getCanvasPos(e);
    moved = false;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    saveState();
}

function stopDrawing() {
    if (!moved && lastPos) {
        ctx.beginPath();
        ctx.arc(lastPos.x, lastPos.y, currentBrushSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = currentColor;
        ctx.fill();
    }
    drawing = false;
    lastPos = null;
}

// Événements Canvas
canvas.addEventListener('mousedown', (e) => startDrawing(e));
canvas.addEventListener('touchstart', (e) => startDrawing(e), { passive: false });

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
});
canvas.addEventListener('touchmove', (e) => {
    if (!drawing) return;
    const pos = getCanvasPos(e);

    const dx = pos.x - lastPos.x;
    const dy = pos.y - lastPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const steps = Math.floor(distance / 1); // Plus petit pour fluidité (touchmove)

    for (let i = 0; i < steps; i++) {
        const x = lastPos.x + (dx * i) / steps;
        const y = lastPos.y + (dy * i) / steps;
        ctx.lineTo(x, y);
    }

    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPos = pos;

    if (e.cancelable) e.preventDefault();
}, { passive: false });

canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchend', stopDrawing, { passive: false });
canvas.addEventListener('mouseleave', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

// Gestion des brush
config.brushIds.forEach((id, index) => {
    const btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener('click', () => {
            config.brushIds.forEach((id, index) => {
                document.getElementById(id).removeAttribute("selected");
            });
            currentBrushSize = config.brushSizes[index];
            btn.setAttribute("selected", "");
        });
    }
});

// Boutons undo/redo/clear
document.getElementById(config.undoButtonId)?.addEventListener('click', undo);
document.getElementById(config.redoButtonId)?.addEventListener('click', redo);
document.getElementById(config.clearButtonId)?.addEventListener('click', clearCanvas);
document.getElementById(config.saveButtonId)?.addEventListener('click', save);

// Resize & redraw on resize (optionnel)
window.addEventListener('resize', () => {
    // Recalculer la taille du canvas au redimensionnement
    initCanvas();
});

// var onPhone = window.innerWidth <= 720;
// var brushSize = onPhone ? 1.4 : 2;
// var i = 0;
// var brushColor = "#000";
// var fillColor = "#f3e779";
// var canvas = document.getElementById("draw-box");
// var cursorOffsetX = document.querySelector("div#new-note-container").offsetWidth / 2 - canvas.offsetWidth / 2;
// var cursorOffsetY = document.querySelector("div#new-note-container").offsetHeight / 2 - canvas.offsetHeight / 2;
// var ctx = canvas.getContext('2d');
// var cancel_btn = document.getElementById("cancel-btn");
// var save_btn = document.getElementById("save-btn");
// resize();
// ctx.fillStyle = fillColor;
// ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
// var pos = { x: 0, y: 0 };
// toggleColorSelector();
// setBrushColor();
// setBrushSize();
// cancel_btn.addEventListener("click", clear);
// save_btn.addEventListener("click", save);
// canvas.addEventListener('mousedown', setPosition);
// canvas.addEventListener('mouseenter', setPosition);
// canvas.addEventListener('touchstart', setPosition);
// canvas.addEventListener('mousedown', draw);
// canvas.addEventListener('mouseenter', draw);
// canvas.addEventListener('touchstart', draw);
// canvas.addEventListener('mousemove', draw);
// canvas.addEventListener('touchmove', draw);

// function setPosition(e) {
//     if (e.targetTouches) {
//         let touch = e.targetTouches[0];
//         pos.x = touch.pageX;
//         pos.y = touch.pageY;
//     } else {
//         pos.x = e.clientX;
//         pos.y = e.clientY;
//     }
//     pos.x = pos.x - cursorOffsetX;
//     pos.y = pos.y - cursorOffsetY;
// }
// function resize() {
//     ctx.canvas.width = canvas.offsetWidth;
//     ctx.canvas.height = canvas.offsetHeight;
// }
// function draw(e) {
//     if ((e.buttons == 1 || e.type == "touchmove") && true) {
//         ctx.beginPath();
//         ctx.lineWidth = brushSize;
//         ctx.lineCap = 'round';
//         if (typeof brushColor != "string") {
//             ctx.strokeStyle = brushColor[Math.floor(i)];
//             if (i > brushColor.length) { i = 0; } else { i++; }
//         } else {
//             ctx.strokeStyle = brushColor;
//         }
//         ctx.moveTo(pos.x, pos.y);
//         setPosition(e);
//         ctx.lineTo(pos.x, pos.y);
//         ctx.stroke();
//         ctx.closePath();
//     }
// }
// function toggleColorSelector() {
//     let color_indicator = document.getElementById("selected-brush");
//     color_indicator.addEventListener("click", () => {
//         let brush_selectors = document.querySelectorAll("#draw-palette span.color-brush");
//         brush_selectors.forEach(brush => {
//             if (brush.getAttribute("visible") === "false") {
//                 brush.setAttribute("visible", "true");
//                 canvas.setAttribute("palette-open", "true");
//             } else {
//                 brush.setAttribute("visible", "false");
//                 canvas.setAttribute("palette-open", "false");
//             }
//         });
//     });
// }
// function setBrushColor() {
//     let color_indicator = document.getElementById("selected-brush");
//     let brush_selectors = document.querySelectorAll("#draw-palette span.color-brush,#eraser-brush");
//     brush_selectors.forEach(brush => {
//         brush.addEventListener("click", () => {
//             brush_selectors.forEach((el) => { el.removeAttribute("selected"); });
//             brush.setAttribute("selected", "");
//             color = brush.getAttribute("color");
//             color_indicator.style.backgroundColor = color;
//             color_indicator.setAttribute("rnb", "false");
//             brush_selectors.forEach(_ => {
//                 _.setAttribute("visible", "false");
//             });
//             canvas.setAttribute("palette-open", "false");
//             if (color === "rnb") {
//                 brushColor = Array(
//                     "#f00", "#f10", "#f20", "#f30", "#f40", "#f50", "#f60", "#f70",
//                     "#f80", "#f90", "#fa0", "#fb0", "#fc0", "#fd0", "#fe0",
//                     "#ff0", "#ef0", "#df0", "#cf0", "#bf0", "#af0", "#9f0", "#8f0",
//                     "#7f0", "#6f0", "#5f0", "#4f0", "#3f0", "#2f0", "#1f0",
//                     "#0f0", "#0f1", "#0f2", "#0f3", "#0f4", "#0f5", "#0f6", "#0f7",
//                     "#0f8", "#0f9", "#0fa", "#0fb", "#0fc", "#0fd", "#0fe",
//                     "#0ff", "#0ef", "#0df", "#0cf", "#0bf", "#0af", "#09f", "#08f",
//                     "#07f", "#06f", "#05f", "#04f", "#03f", "#02f", "#01f",
//                     "#00f", "#10f", "#20f", "#30f", "#40f", "#50f", "#60f", "#70f",
//                     "#80f", "#90f", "#a0f", "#b0f", "#c0f", "#d0f", "#e0f",
//                     "#f0f", "#f0e", "#f0d", "#f0c", "#f0b", "#f0a", "#f09", "#f08",
//                     "#f07", "#f06", "#f05", "#f04", "#f03", "#f02", "#f01"
//                 );
//                 color_indicator.setAttribute("rnb", "true");
//             } else if (color === "eraser") {
//                 brushColor = fillColor;
//             } else {
//                 brushColor = color;
//             }
//         });
//     });
// }
// function setBrushSize() {
//     let brush_selectors = document.querySelectorAll("#draw-palette span.brush-size-btn");
//     brush_selectors.forEach(brush => {
//         brush.addEventListener("click", () => {
//             brush_selectors.forEach((el) => { el.removeAttribute("selected"); });
//             brushSize = onPhone ? brush.getAttribute("size") * 0.7 : brush.getAttribute("size");
//             brush.setAttribute("selected", "");
//         });
//     });
// }
// function clear() {
//     ctx.fillStyle = "#f3e779";
//     ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
// }
// function save(e) {
//     let dataURL = canvas.toDataURL();
//     let form = document.getElementById("form-post-notes");
//     let data_input = document.getElementById("data-img");
//     e.preventDefault();
//     let transition_bg = document.getElementById("transition-bg");
//     transition_bg.setAttribute("active-bg0", "true");
//     data_input.value = dataURL;
//     form.submit();
// }