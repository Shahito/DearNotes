var notes=document.querySelectorAll('div.notes:not(div.memories-suggestion div.notes)');
var winWidth=window.innerWidth;
var winHeight=window.innerHeight;
var mid_offset=0;

if(screen.availWidth<screen.availHeight) {
    winHeight=winHeight-((1.5+3.5)*20);
    // bubble-menu : bottom=1.5rem / height: 3.5rem *** 1rem=20px
}
for (var i=0;i<notes.length;i++) {
    var note=notes[i];
    randomAng=getRandomNumber(-15,15);
    if(screen.availWidth>=screen.availHeight) {
        note.style.transform="rotate("+randomAng+"deg)";
        randomTop=getRandomNumber(45,winHeight-note.offsetHeight-45);
        randomLeft=getRandomNumber(45+(((winWidth-note.offsetWidth)/notes.length)*i),(((winWidth-note.offsetWidth)/notes.length)*(i+1))-45);
    } else if(notes.length<5) {
        // scale_offset=25;
        scale_offset=43.33;
        if(typeof randomTop==='undefined') { randomTop=-scale_offset-100; }
        note.style.transform="scale(0.6) rotate("+randomAng+"deg)";
        randomTop=getRandomNumber(randomTop+100,(((winHeight-note.offsetHeight)/notes.length)*(i+1))+scale_offset);
        randomLeft=getRandomNumber(-scale_offset,winWidth-note.offsetWidth+scale_offset);
    } else {
        scale_offset=80;
        if(typeof randomTop==='undefined') { randomTop=-scale_offset; }
        note.style.transform="scale(0.5) rotate("+randomAng+"deg)";
        randomTop=getRandomNumber(randomTop,(((winHeight-note.offsetHeight)/notes.length)*(i+1))+scale_offset);
        randomLeft=getRandomNumber(-scale_offset,winWidth-note.offsetWidth+scale_offset);
    }
    note.style.top=randomTop+"px";
    note.style.left=randomLeft+"px";
}
function getRandomNumber(min,max) {
    return Math.random()*(max-min)+min;
}