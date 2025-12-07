<?php
require_once "../tools/tools.php";
session_start();
header("Location: ".ROOT."/pages/login");
if(isset($_POST["login-user"]) and isset($_POST["login-password"])) {
    $conn=get_db_conn();
    $login=login_user($conn,$_POST["login-user"],$_POST["login-password"]);
    if($login) {
        $_SESSION["user_id"]=$login; // user id
        $_SESSION["user_name"]=$_POST['login-user'];
        return;
    }
    // redirect to login page with GET "login-error" parameter
    header("Location: ".ROOT."/pages/login?login-error=1");
}
?>