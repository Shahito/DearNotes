<?php
require_once "../tools/tools.php";
session_start();
if(!is_login()) header("Location: ".ROOT."/pages/login");
$conn=get_db_conn();
if(!has_link_in_db($conn,$_SESSION['user_id'])) header("Location: ".ROOT."/pages/link-waiting");
mysqli_close($conn);
?>
<html lang='fr'>
    <head>
        <title><?php echo SITE_NAME;?> - Nouveau mot</title>
        <link rel="stylesheet" href="../style/main.css"/>
        <link href="../ressources/tab-icon.svg" rel="icon"/>
        <link href="../ressources/tab-icon.svg" rel="shortcut icon" type="image/x-icon">
        <meta name="theme-color" content="#333">
        <meta name="msapplication-navbutton-color" content="#333">
        <meta name="apple-mobile-web-app-status-bar-style" content="#333">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Font awesome import -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    </head>
    <body id="notes-body" draggable="false" class="preload" style="overscroll-behavior-y: contain;">
        <header>
            <div id="bubble-action-home" class="bubble-action" onClick="goWithTransition('../',0)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" alt="Icone de retour au menu">
                    <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>
                </svg>
            </div>
        </header>
        <main id="notes">
            <div id="new-note-container">
                <div id="canvas-command">
                    <span id="cancel-btn" class="btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" alt="Icone de croix, annuler">
                            <path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>
                        </svg>
                    </span>
                    <span id="save-btn" class="btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" alt="Icone de coche, valider">
                            <path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                        </svg>
                    </span>
                </div>
                <div class="canvas-wrapper">
                    <canvas id="draw-box" palette-open="false"></canvas>
                </div>
                <div id="draw-palette">
                    <span id="eraser-brush" color="eraser"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M290.7 57.4L57.4 290.7c-25 25-25 65.5 0 90.5l80 80c12 12 28.3 18.7 45.3 18.7H288h9.4H512c17.7 0 32-14.3 32-32s-14.3-32-32-32H387.9L518.6 285.3c25-25 25-65.5 0-90.5L381.3 57.4c-25-25-65.5-25-90.5 0zM297.4 416H288l-105.4 0-80-80L227.3 211.3 364.7 348.7 297.4 416z"/></svg></span>
                    
                    <div id="brush-size-selector">
                        <span id="brush-size-1" class="brush-size-btn" size="2" selected><span class="icon-round-brush"></span></span>
                        <span id="brush-size-2" class="brush-size-btn" size="10"><span class="icon-round-brush"></span></span>
                        <span id="brush-size-3" class="brush-size-btn" size="20"><span class="icon-round-brush"></span></span>
                        <span id="brush-size-4" class="brush-size-btn" size="100"><span class="icon-round-brush"></span></span>
                    </div>

                    <span id="selected-brush" rnb="false"></span>
                    <span id="black-brush" class="color-brush" visible="false" color="#000" selected></span>
                    <span id="white-brush" class="color-brush" visible="false" color="#fff"></span>
                    <span id="red-brush" class="color-brush" visible="false" color="#f00"></span>
                    <span id="orange-brush" class="color-brush" visible="false" color="#f80"></span>
                    <span id="pink-brush" class="color-brush" visible="false" color="#fe80c9"></span>
                    <span id="green-brush" class="color-brush" visible="false" color="#0f0"></span>
                    <span id="cyan-brush" class="color-brush" visible="false" color="#0ff"></span>
                    <span id="blue-brush" class="color-brush" visible="false" color="#00f"></span>
                    <span id="rainbow-brush" class="color-brush" visible="false" color="rnb"></span>
                </div>
            </div>
            <form id="form-post-notes" action="../tools/add-notes" method="POST">
                <input type="hidden" id="data-img" name="data-img" value=""/>
            </form>
        </main>
        <div id="transition-bg"></div>
        <footer></footer>
    </body>
    <script src="../tools/draw.js"></script>
    <script src="../tools/page-transition.js"></script>
    <script>
        /* Prevent animation on load */
        setTimeout(function() {
            document.body.className="";
        },500);
    </script>
</html>