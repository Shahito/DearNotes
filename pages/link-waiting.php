<?php
require "../tools/tools.php";
session_start();
if(!is_login()) header("Location: ".ROOT."/pages/login");
$conn=get_db_conn();
$redirect_home=has_link_in_db($conn,$_SESSION['user_id']);
$user_token=get_user_token_from_id($conn,$_SESSION['user_id']);
?>
<html lang='fr'>
    <head>
        <title><?php echo SITE_NAME;?> - Mise en relation</title>
        <link rel="stylesheet" href="../style/main.css"/>
        <link href="../ressources/tab-icon.svg" rel="icon"/>
        <meta name="theme-color" content="#333">
        <meta name="msapplication-navbutton-color" content="#333">
        <meta name="apple-mobile-web-app-status-bar-style" content="#333">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Font awesome import -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    </head>
    <body draggable="false" class="preload">
        <header></header>
        <main id="link">
            <div class="pres-img-waiting">
                <img src="../ressources/waiting-peach-endless.gif" alt="Gif de Peach qui attend (mochi cat)"/>
            </div>
            <?php
                if(isset($_GET['error-link']) && $_GET['error-link']==0) {
                    echo "<div class='invalid'>".ERROR_LINK_MESSAGE."</div>";
                }
            ?>
            <form action="../tools/link-user.php" id="link" method="POST">
                <input type="text" name="user-token" placeholder="Token de votre moitié" required/>
                <input type="submit" value="Lier les comptes"/>
            </form>
            <div class="explain">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" alt="Icone d'information">
                    <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-144c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z"/>
                </svg>
                <div class="explain-text">
                    Donnez cette "phrase" secrète à votre moitié ou copiez la sienne dans le champ au dessus pour vous connecter à elle !
                    <br/>
                    Une fois liés, vous serez inséparables ! (Littéralement)
                    <br/>
                    Votre token :
                </div>
                <div class="token-action-wrapper">
                    <div id="js-copy-field" class="user-token">
                        <?php echo $user_token; ?>
                    </div>
                    <button id="copy-btn" success-copy="false" onClick="copy_from_button()">Copier</button>
                </div>
            </div>
        </main>
        <div id="transition-bg"></div>
        <footer></footer>
    </body>
    <script>
        /* Prevent animation on load */
        setTimeout(function() {
            document.body.className="";
        },500);
    </script>
    <script src="../tools/clipboard_copy_button.js"></script>
    <script src="../tools/page-transition.js"></script>
    <?php
        if($redirect_home) {
            if(isset($_GET['successful-link']) && $_GET['successful-link']==1) {
                echo "<script type='text/javascript'>
                    goWithTransition('..?successful-link=1',2,true);
                </script>";
            } else {
                echo "<script type='text/javascript'>
                    goWithTransition('../',2,true);
                </script>";
            }
        }
    ?>
</html>