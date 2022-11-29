function copy_from_button() {
    let copy_text=document.getElementById("js-copy-field").innerText;
    const el=document.createElement('textarea');
    el.value=copy_text;
    el.setAttribute('readonly','');
    el.style.position='absolute';
    el.style.left='-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    copy_btn=document.getElementById("copy-btn")
    copy_btn.setAttribute("success-copy","true");
    copy_btn.textContent="Copié !";
}