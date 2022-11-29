<?php

define("DEBUG_MODE",FALSE);

if(DEBUG_MODE) {
    // Error report
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    // Database
    define("DBSERVERNAME","localhost");
    define("DBUSERNAME","root");
    define("DBPASSWORD","root");
    define("DBNAME","sticky_love_db");

    // Files
    define("ROOT","/far-sticky-love");
} else {
    // Database
    define("DBSERVERNAME","localhost:3306");
    define("DBUSERNAME","oksg1743");
    define("DBPASSWORD","sha_O2SWITCH2580");
    define("DBNAME","oksg1743_sticky_love_db");
    
    // Files
    define("ROOT","");
}

// General
define("SITE_NAME","FarStickyLove");

define("SALT_SIZE",10); // 10 bytes->bin2hex = 20 chars
define("PASSWORD_PEPPER","cefed66686d90d9b813c");

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
define("USERS_DATE","creation_date");
define("USERS_LOGIN_TOKEN","last_login_token");
?>
