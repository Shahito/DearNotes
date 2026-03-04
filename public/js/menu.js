// public/js/menu.js

document.addEventListener('DOMContentLoaded', () => {
    const menuTrigger = document.getElementById('menuTrigger');
    const menu = document.getElementById('menu');
    updateMenuFocus();

    function toggleMenu(e) {
        e.stopPropagation();
        
        menuTrigger.classList.toggle('closed');
        menu.classList.toggle('closed');
        updateMenuFocus();
    }

    function closeMenu() {
        menuTrigger.classList.add('closed');
        menu.classList.add('closed');
        updateMenuFocus();
    }

    function updateMenuFocus() {
        const buttons = menu.querySelectorAll("button");
        const isClosed = menu.classList.contains("closed");

        buttons.forEach(btn => {
            btn.tabIndex = isClosed ? -1 : 0;
        });
    }

    menuTrigger.addEventListener('click', (e) => toggleMenu(e));
    // Close menu when clicking outside
    document.addEventListener('click', closeMenu);
});