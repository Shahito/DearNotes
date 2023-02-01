<?php
require_once "../tools/tools.php";
session_start();
if(!is_login()) header("Location: ".ROOT."/pages/login");
$conn=get_db_conn();
if(!has_link_in_db($conn,$_SESSION['user_id'])) header("Location: ".ROOT."/pages/link-waiting");
?>
<html lang='fr'>
    <head>
        <title><?php echo SITE_NAME;?> - Compte</title>
        <link rel="stylesheet" href="../style/main_1.10.0.css"/>
        <link href="../ressources/tab-icon.svg" rel="icon"/>
        <link href="../ressources/tab-icon.svg" rel="shortcut icon" type="image/x-icon">
        <meta name="theme-color" content="#333">
        <meta name="msapplication-navbutton-color" content="#333">
        <meta name="apple-mobile-web-app-status-bar-style" content="#333">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Font awesome import -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    </head>
    <body id="account-body" draggable="false" class="preload">
        <header>
            <div id="bubble-action-home" class="bubble-action" onClick="goWithTransition('../',2)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" alt="Icone de retour au menu">
                    <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>
                </svg>
            </div>
        </header>
        <main id="account">
            <?php
            if(isset($_GET['password-change-success']) and $_GET['password-change-success']==1) {
                echo "<div class='success-message'>".SUCCESS_PASSWORD_CHANGE_MESSAGE."</div>";
            }
            ?>
            <div class="account-stats">
                <div class="stat">
                    Inscrit depuis le <strong><?php echo get_formatted_user_creation_date($conn,$_SESSION['user_id']); ?></strong>
                </div>
                <div class="stat">
                    En relation avec <strong><?php echo get_linked_user_name($conn,$_SESSION['user_id']); ?></strong>
                </div>
                <div class="stat">
                    <?php
                    $sent_notes=get_notes_number_from_user($conn,$_SESSION['user_id']);
                    if(!$sent_notes) {
                        echo "Vous n'avez pas encore envoyé de mot";
                    } else {
                        echo "Vous avez envoyé <strong>".$sent_notes.($sent_notes>1?" mots":" mot")."</strong>";
                    }
                    ?>
                </div>
                <div class="stat">
                    <?php
                    $linked_user_id=get_linked_user_id($conn,$_SESSION['user_id']);
                    $received_notes=get_notes_number_from_user($conn,$linked_user_id);
                    if(!$received_notes) {
                        echo "Vous n'avez pas encore reçu de mot";
                    } else {
                        echo "Vous avez reçu <strong>".$received_notes.($received_notes>1?" mots":" mot")."</strong>";
                    }
                    ?>
                </div>
            </div>
            <form action="../tools/change-password" id="password-change" method="POST">
                <label for="old-password">
                    Ancien mot de passe :
                </label>
                <input type="password" name="old-password" id="old-password" placeholder="Ancien mot de passe" required/>
                <?php
                if(isset($_GET["password-error"]) and $_GET["password-error"]==1) {
                    echo "<div class='invalid-login-message'>".ERROR_PASSWORD_INCORRECT."</div>";
                }
                ?>
                <label for="password">
                    Nouveau mot de passe :
                </label>
                <input type="password" name="new-password" id="password" placeholder="Nouveau mot de passe" required/>
                <?php
                if(isset($_GET['pattern-error']) and $_GET['pattern-error']==1) {
                    echo "<div class='invalid-pattern-message'>".WRONG_PASSWORD_PATTERN."</div>";
                }
                ?>
                <label for="confirm-password">
                    Confirmation du mot de passe :
                </label>
                <input type="password" name="new-confirm-password" id="confirm-password" placeholder="Confirmation du mot de passe" required/>
                <div class="warning-field"></div>
                <input type="submit" value="Modifier" invisible/>
            </form>
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
    <script src="../tools/confirm_password.js"></script>
    <script>
        verify_password("password-change","password","confirm-password");
    </script>
    <script src="../tools/page-transition.js"></script>
</html>
