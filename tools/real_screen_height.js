const documentHeight = () => {
    const doc=document.documentElement
    doc.style.setProperty('--real-vh', `${window.innerHeight}px`)
}
window.addEventListener('resize',documentHeight)
documentHeight()