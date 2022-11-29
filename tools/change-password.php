<?php
require_once "../tools/tools.php";
session_start();
header("Location: ".ROOT);
if(isset($_POST["old-password"]) and isset($_POST["new-password"])) {
    $conn=get_db_conn();
    $login=login_user($conn,$_SESSION["user_name"],$_POST["old-password"]);
    if($login) {
        if(change_user_password($conn,$_SESSION["user_id"],$_POST["new-password"])) {
            // success
            header("Location: ".ROOT."/pages/account?password-change-success=1");
            return;
        } else {
            // incorrect pattern for new password
            header("Location: ".ROOT."/pages/account?pattern-error=1");
            return;
        }
    }
    // incorrect password
    header("Location: ".ROOT."/pages/account?password-error=1");
}
mysqli_close($conn);
?>