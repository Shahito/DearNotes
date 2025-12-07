<?php
require_once "./tools.php";
session_start();
header("Location: ".ROOT."/pages/login");
if(isset($_POST["register-user"]) and 
isset($_POST["register-password"]) and 
isset($_POST["register-confirm-password"]) and
isset($_POST["register-user"])!="") {
    $conn=get_db_conn();
    if(is_user_in_db($conn,$_POST["register-user"])) {
        // redirect to login page with GET "same-user" parameter
        header("Location: ".ROOT."/pages/login?same-user=1");
    } else {
        // create user in db
        $user_id=add_user_in_db($conn,$_POST["register-user"],$_POST["register-password"]);
        if(!$user_id) {
            header("Location: ".ROOT."/pages/login?unknown-error=1");
            return;
        }
        $login=login_user($conn,$_POST["register-user"],$_POST["register-password"]);
        if($login) {
            $_SESSION["user_id"]=$login; // user id
            $_SESSION["user_name"]=$_POST["register-user"];
            return;
        }
    }
}
?>