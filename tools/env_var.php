<?php

require_once dirname(__FILE__).'/debug_mode.php';
$env = parse_ini_file(__DIR__ . '/../config/.env');

if(DEBUG_MODE) {
    // Error report
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    // Files
    define("ROOT","/dear-notes");
} else {
    // Files
    define("ROOT","");
}

// Database
define("DBSERVERNAME",$env['DB_HOST'].":".$env['DB_PORT']);
define("DBUSERNAME",$env['DB_USER']);
define("DBPASSWORD",$env['DB_PASS']);
define("DBNAME",$env['DB_NAME']);

// General
define("SITE_NAME","DearNotes");

define("SALT_SIZE",10); // 10 bytes->bin2hex = 20 chars
define("PASSWORD_PEPPER",$env['PASSWORD_PEPPER']);

define("LOGIN_TOKEN_SIZE",20); // 20 bytes->bin2hex = 40 chars

// Messages
define("ERROR_DB_MESSAGE","Erreur de la base de donnée.<br/>Veuillez réessayer plus tard ou contacter l'administrateur.");
define("ERROR_LOGIN_MESSAGE","Nom d'utilisateur ou mot de passe incorect");
define("ERROR_UNKNOWN_LOGIN_MESSAGE","Une erreur s'est produite, veuillez réessayer plus tard");
define("ERROR_REGISTER_USER_MESSAGE","Le nom d'utilisateur est déjà utilisé");
define("SUCCESS_POST_NOTE_MESSAGE","Note ajoutée avec succès !<br/>Elle restera visible 24h");
define("SUCCESS_LINK_MESSAGE","Vous avez bien été lié à votre moitié !<br/>Les notes disparaissent après 24h.");
define("ERROR_LINK_MESSAGE","Veuillez vérifier que le token ne soit pas erroné ou que vous ou votre moitié ne soit pas déjà connectée à quelqu'un.");
define("ERROR_PASSWORD_INCORRECT","Le mot de passe est incorrect");
define("SUCCESS_PASSWORD_CHANGE_MESSAGE","Le mot de passe a été changé avec succès !");
define("WRONG_PASSWORD_PATTERN","Le mot de passe doit contenir au minimum :<br/>- une minuscule<br/>- une majuscule<br/>- un chiffre<br/>- 8 caractères");

// DB : live notes table
define("LIVE_NOTES_TABLE","live_notes");
define("LIVE_NOTES_ID","id");
define("LIVE_NOTES_DATA","data");
define("LIVE_NOTES_DATE","creation_date");
define("LIVE_NOTES_FK_AUTHOR","fk_author_id");
define("LIVE_NOTES_FK_LINK","fk_link_id");

// DB : saved notes table
define("SAVED_NOTES_TABLE","saved_notes");
define("SAVED_NOTES_ID","id");
define("SAVED_NOTES_DATA","data");
define("SAVED_NOTES_DATE","creation_date");
define("SAVED_NOTES_AUTHOR_ID","author_id");
define("SAVED_NOTES_LINK_ID","link_id");

// DB : links table
define("LINKS_TABLE","links");
define("LINKS_ID","id");
define("LINKS_FK_USER_1","fk_user1_id");
define("LINKS_FK_USER_2","fk_user2_id");

// DB : users table
define("USERS_TABLE","users");
define("USERS_ID","id");
define("USERS_USERNAME","username");
define("USERS_PASSWORD","password");
define("USERS_SALT","salt");
define("USERS_TOKEN","link_token");
define("USERS_LAST_SEEN","last_seen_date");
define("USERS_DATE","creation_date");
define("USERS_LOGIN_TOKEN","last_login_token");
?>
