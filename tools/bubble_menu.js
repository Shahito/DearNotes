function toggle_bubble_menu_visibility() {
    var bubble_menu=document.getElementById("bubble-menu-container")
    if(bubble_menu.getAttribute("selected")==="false") {
        bubble_menu.setAttribute("selected","true");
        document.querySelector("header").classList.add("darken");
        setTimeout(() => {
            document.querySelector("body").addEventListener('click', function unselectBubbleMenu() {
                bubble_menu.setAttribute("selected","false");
                document.querySelector("header").classList.remove("darken");
                document.querySelector("body").removeEventListener("click",unselectBubbleMenu);
            })
        }, 10);
    }
}