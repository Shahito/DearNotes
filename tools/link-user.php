<?php
require_once "./tools.php";
session_start();
is_login();

header("Location: ".ROOT."/pages/link-waiting");
if(isset($_POST["user-token"])) {
    $conn=get_db_conn();
    if(link_users_in_db($conn,$_SESSION['user_id'],$_POST["user-token"])) {
        header("Location: ".ROOT."/pages/link-waiting?successful-link=1");
        return;
    }
    header("Location: ".ROOT."/pages/link-waiting?error-link=0");
}
?>