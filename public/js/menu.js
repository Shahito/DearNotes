// public/js/menu.js

document.addEventListener('DOMContentLoaded', () => {
    const menuTrigger = document.getElementById('menuTrigger');
    const menu = document.getElementById('menu');

    function toggleMenu(e) {
        e.stopPropagation();
        
        menuTrigger.classList.toggle('closed');
        menu.classList.toggle('closed');
    }

    function closeMenu() {
        menuTrigger.classList.add('closed');
        menu.classList.add('closed');
    }

    menuTrigger.addEventListener('click', (e) => toggleMenu(e));
    // Close menu when clicking outside
    document.addEventListener('click', closeMenu);
});