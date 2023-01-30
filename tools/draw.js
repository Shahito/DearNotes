var onPhone=window.innerWidth<=720;
var brushSize=onPhone?1.4:2;
var i=0;
var brushColor="#000";
var fillColor="#f3e779";
var canvas=document.getElementById("draw-box");
var cursorOffsetX=document.querySelector("div#new-note-container").offsetWidth/2-canvas.offsetWidth/2;
var cursorOffsetY=document.querySelector("div#new-note-container").offsetHeight/2-canvas.offsetHeight/2;
var ctx=canvas.getContext('2d');
var cancel_btn=document.getElementById("cancel-btn");
var save_btn=document.getElementById("save-btn");
resize();
ctx.fillStyle=fillColor;
ctx.fillRect(0,0,canvas.offsetWidth,canvas.offsetHeight);
var pos={x:0,y:0};
toggleColorSelector();
setBrushColor();
setBrushSize();
cancel_btn.addEventListener("click",clear);
save_btn.addEventListener("click",save);
canvas.addEventListener('mousedown',setPosition);
canvas.addEventListener('mouseenter',setPosition);
canvas.addEventListener('touchstart',setPosition);
canvas.addEventListener('mousedown',draw);
canvas.addEventListener('mouseenter',draw);
canvas.addEventListener('touchstart',draw);
canvas.addEventListener('mousemove',draw);
canvas.addEventListener('touchmove',draw);

function setPosition(e) {
    if(e.targetTouches) {
        let touch=e.targetTouches[0];
        pos.x=touch.pageX;
        pos.y=touch.pageY;
    } else {
        pos.x=e.clientX;
        pos.y=e.clientY;
    }
    pos.x=pos.x-cursorOffsetX;
    pos.y=pos.y-cursorOffsetY;
}
function resize() {
    ctx.canvas.width=canvas.offsetWidth;
    ctx.canvas.height=canvas.offsetHeight;
}
function draw(e) {
    if((e.buttons==1 || e.type=="touchmove") && true) {
        ctx.beginPath();
        ctx.lineWidth=brushSize;
        ctx.lineCap='round';
        if(typeof brushColor!="string") {
            ctx.strokeStyle=brushColor[Math.floor(i)];
            if(i>brushColor.length) { i=0; } else { i++; }
        } else {
            ctx.strokeStyle=brushColor;
        }
        ctx.moveTo(pos.x,pos.y);
        setPosition(e);
        ctx.lineTo(pos.x,pos.y);
        ctx.stroke();
        ctx.closePath();
    }
}
function toggleColorSelector() {
    let color_indicator=document.getElementById("selected-brush");
    color_indicator.addEventListener("click",() => {
        let brush_selectors=document.querySelectorAll("#draw-palette span.color-brush");
        brush_selectors.forEach(brush => {
            if(brush.getAttribute("visible")==="false") {
                brush.setAttribute("visible","true");
                canvas.setAttribute("palette-open","true");
            } else {
                brush.setAttribute("visible","false");
                canvas.setAttribute("palette-open","false");
            }
        });
    });
}
function setBrushColor() {
    let color_indicator=document.getElementById("selected-brush");
    let brush_selectors=document.querySelectorAll("#draw-palette span.color-brush,#eraser-brush");
    brush_selectors.forEach(brush => {
        brush.addEventListener("click",() => {
            brush_selectors.forEach((el) => { el.removeAttribute("selected"); });
            brush.setAttribute("selected","");
            color=brush.getAttribute("color");
            color_indicator.style.backgroundColor=color;
            color_indicator.setAttribute("rnb","false");
            brush_selectors.forEach(_ => {
                _.setAttribute("visible","false");
            });
            canvas.setAttribute("palette-open","false");
            if(color==="rnb") {
                brushColor=Array(
                    "#f00","#f10","#f20","#f30","#f40","#f50","#f60","#f70",
                    "#f80","#f90","#fa0","#fb0","#fc0","#fd0","#fe0",
                    "#ff0","#ef0","#df0","#cf0","#bf0","#af0","#9f0","#8f0",
                    "#7f0","#6f0","#5f0","#4f0","#3f0","#2f0","#1f0",
                    "#0f0","#0f1","#0f2","#0f3","#0f4","#0f5","#0f6","#0f7",
                    "#0f8","#0f9","#0fa","#0fb","#0fc","#0fd","#0fe",
                    "#0ff","#0ef","#0df","#0cf","#0bf","#0af","#09f","#08f",
                    "#07f","#06f","#05f","#04f","#03f","#02f","#01f",
                    "#00f","#10f","#20f","#30f","#40f","#50f","#60f","#70f",
                    "#80f","#90f","#a0f","#b0f","#c0f","#d0f","#e0f",
                    "#f0f","#f0e","#f0d","#f0c","#f0b","#f0a","#f09","#f08",
                    "#f07","#f06","#f05","#f04","#f03","#f02","#f01"
                );
                color_indicator.setAttribute("rnb","true");
            } else if(color==="eraser") {
                brushColor=fillColor;
            } else {
                brushColor=color;
            }
        });
    });
}
function setBrushSize() {
    let brush_selectors=document.querySelectorAll("#draw-palette span.brush-size-btn");
    brush_selectors.forEach(brush => {
        brush.addEventListener("click",() => {
            brush_selectors.forEach((el) => { el.removeAttribute("selected"); });
            brushSize=onPhone?brush.getAttribute("size")*0.7:brush.getAttribute("size");
            brush.setAttribute("selected","");
        });
    });
}
function clear() {
    ctx.fillStyle="#f3e779";
    ctx.fillRect(0,0,canvas.offsetWidth,canvas.offsetHeight);
}
function save(e) {
    let dataURL=canvas.toDataURL();
    let form=document.getElementById("form-post-notes");
    let data_input=document.getElementById("data-img");
    e.preventDefault();
    let transition_bg=document.getElementById("transition-bg");
    transition_bg.setAttribute("active-bg0","true");
    data_input.value=dataURL;
    form.submit();
}