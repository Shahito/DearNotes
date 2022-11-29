<?php
require_once "./tools.php";
session_start();
is_login();
$conn=get_db_conn();

header("Location: ".ROOT."/");
if(!has_link_in_db($conn,$_SESSION['user_id'])) {
    header("Location: ".ROOT."/pages/link-waiting");
    exit;
}

if(isset($_POST["data-img"])) {
    $conn=get_db_conn();
    $byte_array=unpack("C*",$_POST["data-img"]);
    if(count($byte_array)<=1080000) {
        add_note_in_db($conn,$_POST["data-img"],$_SESSION['user_id']);
        header("Location: ".ROOT."/?note-success=1");
    }
}
?>