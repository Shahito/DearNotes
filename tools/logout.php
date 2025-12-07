<?php
require_once "./tools.php";
header("Location: ".ROOT."/pages/login");
session_start();
session_unset();
session_destroy();
setcookie("AUTH_TOKEN",null,-1,"/"); 
?>