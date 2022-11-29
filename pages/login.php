<?php
require_once "../tools/tools.php";
session_start();
$redirect_home=FALSE;
$redirect_link=FALSE;
if(is_login()) {
    $redirect_home=TRUE;
    $conn=get_db_conn();
    $redirect_link=!has_link_in_db($conn,$_SESSION['user_id']);
    mysqli_close($conn);
}
?>
<html lang='fr'>
    <head>
        <title><?php echo SITE_NAME;?> - Connexion</title>
        <link rel="stylesheet" href="../style/main.css"/>
        <link href="../ressources/tab-icon.svg" rel="icon"/>
        <meta name="theme-color" content="#333">
        <meta name="msapplication-navbutton-color" content="#333">
        <meta name="apple-mobile-web-app-status-bar-style" content="#333">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Font awesome import -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    </head>
    <body draggable="false" class="">
        <header></header>
        <main id="login-section">
            <!-- Login form -->
            <form id="login" action="../tools/login" method="POST">
                <label for="user-login">
                    Nom d'utilisateur :
                </label>
                <input type="text" name="login-user" placeholder="Nom d'utilisateur" required/>
                <label for="login-password">
                    Mot de passe :
                </label>
                <input type="password" name="login-password" id="login-password" placeholder="Mot de passe" required/>
                <?php
                    if(isset($_GET["login-error"]) and $_GET["login-error"]==1) {
                        echo "<div class='invalid-login-message'>".ERROR_LOGIN_MESSAGE."</div>";
                    }
                ?>
                <input type="submit" value="Se connecter" invisible/>
            </form>
            <img class="spacer-line-brush-style-vertical" src="../ressources/line-brush-vertical.png" draggable="false" alt="Séparation vertical en forme de coup de pinceau"/>
            <img class="spacer-line-brush-style-horizontal" src="../ressources/line-brush-horizontal.png" draggable="false" alt="Séparation horizontal en forme de coup de pinceau"/>
            <!-- Register form -->
            <form id="register" action="../tools/register" method="POST">
                <label for="register-user">
                    Nom d'utilisateur :
                </label>
                <input type="text" name="register-user" placeholder="Nom d'utilisateur" required/>
                <?php
                if(isset($_GET["same-user"]) and $_GET["same-user"]==1) {
                    echo "<div class='invalid-login-message'>".ERROR_REGISTER_USER_MESSAGE."</div>";
                }
                ?>
                <label for="register-password">
                    Mot de passe :
                </label>
                <input type="password" name="register-password" id="register-password" placeholder="Mot de passe" required/>
                <label>
                    Mot de passe (confirmation) :
                </label>
                <input type="password" name="register-confirm-password" id="register-confirm-password" placeholder="Mot de passe (confirmation)" required/>
                <?php
                    if(isset($_GET["unknown-error"]) and $_GET["unknown-error"]==1) {
                        echo "<div class='invalid-login-message'>".ERROR_UNKNOWN_LOGIN_MESSAGE."</div>";
                    }
                ?>
                <div class="warning-field"></div>
                <input type="submit" value="Créer un compte" invisible/>
            </form>
        </main>
        <div id="transition-bg"></div>
        <footer></footer>
    </body>
    <script src="../tools/cookie_alert.js"></script>
    <script src="../tools/confirm_password.js"></script>
    <script>
        verify_password("login","login-password");
        verify_password("register","register-password","register-confirm-password");
    </script>
    <script src="../tools/page-transition.js"></script>
    <?php
    if($redirect_link) {
        echo "<script type='text/javascript'>
            goWithTransition('./link-waiting',1);
        </script>";
    } elseif($redirect_home) {
        echo "<script type='text/javascript'>
            goWithTransition('../',2);
        </script>";
    }
    ?>
</html>