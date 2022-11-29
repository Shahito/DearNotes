a
<?php
require_once "./tools/tools.php";
session_start();
if(!is_login()) header("Location: ".ROOT."/pages/login");
$conn=get_db_conn();
$redirect_link=!has_link_in_db($conn,$_SESSION['user_id']);
?>
<html lang='fr'>
    <head>
        <title><?php echo SITE_NAME;?> - Accueil</title>
        <link rel="stylesheet" href="./style/main.css"/>
        <link href="./ressources/tab-icon.svg" rel="icon"/>
        <meta name="theme-color" content="#333">
        <meta name="msapplication-navbutton-color" content="#333">
        <meta name="apple-mobile-web-app-status-bar-style" content="#333">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body draggable="false" class="preload">
        <header>
            <div id="bubble-action-refresh" class="bubble-action" onClick="location.href='.'">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" alt="Icone de rechargement de la page">
                    <path d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"/>
                </svg>
            </div>
            <div id="bubble-menu-deployer" class="bubble-action" onClick="toggle_bubble_menu_visibility()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512" alt="Icone pour dérouler le menu">
                    <path d="M64 360c30.9 0 56 25.1 56 56s-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56zm0-160c30.9 0 56 25.1 56 56s-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56zM120 96c0 30.9-25.1 56-56 56S8 126.9 8 96S33.1 40 64 40s56 25.1 56 56z"/>
                </svg>
            </div>
            <div id="bubble-menu-container" selected="false">
                <ul id="bubble-menu">
                    <li onClick="goWithTransition('./pages/add-notes',0)">
                        <div class="bubble-menu-item-title">Ajouter un mot</div>
                        <div class="bubble-menu-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" alt="Icone d'ajout de note">
                                <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H290.7c17 0 33.3-6.7 45.3-18.7L429.3 368c12-12 18.7-28.3 18.7-45.3V96c0-35.3-28.7-64-64-64H64zm0 64H384V320H320c-17.7 0-32 14.3-32 32v64H64V96z"/>
                            </svg>
                        </div>
                    </li>
                    <li onClick="goWithTransition('./pages/account',3)">
                        <div class='bubble-menu-item-title'>Compte</div>
                        <div class='bubble-menu-item-icon'>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" alt="Icone de modification du compte">
                                <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H322.8c-3.1-8.8-3.7-18.4-1.4-27.8l15-60.1c2.8-11.3 8.6-21.5 16.8-29.7l40.3-40.3c-32.1-31-75.7-50.1-123.9-50.1H178.3zm435.5-68.3c-15.6-15.6-40.9-15.6-56.6 0l-29.4 29.4 71 71 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6l-14.4-14.4zM375.9 417c-4.1 4.1-7 9.2-8.4 14.9l-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2l60.1-15c5.6-1.4 10.8-4.3 14.9-8.4L576.1 358.7l-71-71L375.9 417z"/>
                            </svg>
                        </div>
                    </li>
                    <li onClick="goWithTransition('./tools/logout',3,true)">
                        <div class="bubble-menu-item-title">Se déconnecter</div>
                        <div class="bubble-menu-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" alt="Icone de déconnexion">
                                <path d="M160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96C43 32 0 75 0 128V384c0 53 43 96 96 96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H96c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32h64zM504.5 273.4c4.8-4.5 7.5-10.8 7.5-17.4s-2.7-12.9-7.5-17.4l-144-136c-7-6.6-17.2-8.4-26-4.6s-14.5 12.5-14.5 22v72H192c-17.7 0-32 14.3-32 32l0 64c0 17.7 14.3 32 32 32H320v72c0 9.6 5.7 18.2 14.5 22s19 2 26-4.6l144-136z"/>
                            </svg>
                        </div>
                    </li>
                </ul>
            </div>
        </header>
        <main id="home">
            <?php
            if(isset($_GET['successful-link']) && $_GET['successful-link']==1) {
                echo "<div class='success-message'>".SUCCESS_LINK_MESSAGE."</div>";
            } elseif (isset($_GET['note-success']) && $_GET['note-success']==1) {
                echo "<div class='success-message'>".SUCCESS_POST_NOTE_MESSAGE."</div>";
            }
            $user_link_id=has_link_in_db($conn,$_SESSION['user_id']);
            delete_expired_notes($conn,$_SESSION['user_id'],$user_link_id);
            $notes=get_all_notes_from_link($conn,$user_link_id);
            if($notes->fetch_assoc()!=NULL) {
                foreach($notes as $note) {
                    echo "<div class='notes'><img src='".$note[LIVE_NOTES_DATA]."' alt='Note'/>";
                    echo "<span>Temps restant : ".get_formatted_left_time_from_date($note[LIVE_NOTES_DATE])."</span>";
                    echo "<div class='shadow'></div><div class='spotlight'></div></div>";
                }
            } else {
                $linked_user_id=get_linked_user_id($conn,$_SESSION['user_id']);
                $notes=get_all_saved_notes_from_author($conn,$linked_user_id);
                if(count($notes)!=0) {
                    srand(mktime(0,0,0));
                    $random_note_index=rand(0,count($notes)-1);
                    echo "<div class='memories-suggestion'>";
                    echo "<button id='memories-reveal' onClick='display_random_notes()'>";
                    echo "<img src='./ressources/crying-peach-endless.gif' alt='Gif de Goma qui console Peach (mochi cat)'/>";
                    echo "Voir un souvenir aléatoire</button>";
                    echo "<span class='memories-title'>Le souvenir d'aujourd'hui</span>";
                    echo "<div class='notes'>";
                    echo "<img src='".$notes[$random_note_index][0]."' alt='Note'/>";
                    echo "<span>Créée le ".get_formatted_date_from_date($notes[$random_note_index][1])."</span>";
                    echo "<div class='shadow'></div><div class='spotlight'></div></div></div>";
                }
            }
            mysqli_close($conn);
            ?>
        </main>
        <div id="transition-bg"></div>
        <footer></footer>
    </body>
    <script src="./tools/notes_random_placement.js"></script>
    <script src="./tools/bubble_menu.js"></script>
    <script src="./tools/real_screen_height.js"></script>
    <script>
        /* Prevent animation on load */
        setTimeout(function() {
            document.body.className="";
        },500);
    </script>
    <script src="./tools/page-transition.js"></script>
    <script>
        function display_random_notes() {
            let random_note_container=document.querySelector("div.memories-suggestion");
            random_note_container.setAttribute("drawn","");
        }
    </script>
    <?php
        if($redirect_link) {
        echo "<script type='text/javascript'>
                goWithTransition('./pages/link-waiting',3,true);
            </script>";
        }
    ?>
</html>
