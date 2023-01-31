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
        <link rel="stylesheet" href="../style/main_1.9.0.css"/>
        <link href="../ressources/tab-icon.svg" rel="icon"/>
        <link href="../ressources/tab-icon.svg" rel="shortcut icon" type="image/x-icon">
        <meta name="theme-color" content="#333">
        <meta name="msapplication-navbutton-color" content="#333">
        <meta name="apple-mobile-web-app-status-bar-style" content="#333">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Font awesome import -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    </head>
    <body id="login-body" draggable="false" class="">
        <header></header>
        <main id="login-section">
            <!-- Login form -->
            <form id="login" class="show" action="../tools/login" method="POST">
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
                <button onClick="swicthToRegisterForm()" id="register-switch" class="login-register-switch">Nouveau ? Créer un compte</button>
            </form>
            <!-- Register form -->
            <form id="register" class="hide" action="../tools/register" method="POST">
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
                <button onClick="swicthToLoginForm()" id="login-switch" class="login-register-switch">Dejà un compte ? Se connecter</button>
            </form>
        </main>
        <div id="transition-bg"></div>
        <footer></footer>
    </body>
    <script src="../tools/cookie_alert.js"></script>
    <script src="../tools/confirm_password.js"></script>
    <script>
        function swicthToRegisterForm() {
            login_form=document.querySelector("form#login");
            register_form=document.querySelector("form#register");
            login_form.classList.add("hide");
            login_form.classList.remove("show");
            register_form.classList.add("show");
            register_form.classList.remove("hide");
        }
        function swicthToLoginForm() {
            login_form=document.querySelector("form#login");
            register_form=document.querySelector("form#register");
            register_form.classList.add("hide");
            register_form.classList.remove("show");
            login_form.classList.add("show");
            login_form.classList.remove("hide");
        }
    </script>
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
