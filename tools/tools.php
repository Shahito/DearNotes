<?php

require_once dirname(__FILE__).'/env_var.php';

if(DEBUG_MODE) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

// extend session lifetime
session_set_cookie_params(86400);

function get_db_conn() {
    $conn=new mysqli(DBSERVERNAME,DBUSERNAME,DBPASSWORD,DBNAME);
    return $conn;
}

function is_login() {
    $conn=get_db_conn();
    if(isset($_SESSION['user_id']) and $_SESSION['user_id']!=FALSE) {
        // valid php session
        update_last_seen_date_in_db($conn,$_SESSION['user_id']);
        mysqli_close($conn);
        return TRUE;
    }
    $user_id=has_valid_login_cookie($conn);
    if($user_id!=FALSE) {
        // valid login cookie
        $_SESSION['user_id']=$user_id;
        set_login_cookie($conn,$user_id);
        update_last_seen_date_in_db($conn,$user_id);
        mysqli_close($conn);
        return TRUE;
    }
    mysqli_close($conn);
    return FALSE;
}

function has_valid_login_cookie($conn) {
    if(isset($_COOKIE['AUTH_TOKEN']) and !empty($_COOKIE['AUTH_TOKEN'])) {
        $query="SELECT `".USERS_ID."` FROM `".USERS_TABLE."` WHERE `".USERS_LOGIN_TOKEN."`=?";
        $query_select=$conn->prepare($query);
        $query_select->bind_param("s",$_COOKIE['AUTH_TOKEN']);
        $query_select->execute() or die(ERROR_DB_MESSAGE);
        $result=$query_select->get_result();
        $row=$result->fetch_assoc();
        return ($row)?$row[USERS_ID]:FALSE;
    }
    return FALSE;
}
// override old cookie
// create new cookie for another week (different)
function set_login_cookie($conn,$user_id) {
    $new_token=get_random_login_token();
    setcookie("AUTH_TOKEN",$new_token,time()+(604800),"/");
    $query="UPDATE `".USERS_TABLE."`
    SET `".USERS_LOGIN_TOKEN."`=?
    WHERE `".USERS_ID."`=?";
    $query_update=$conn->prepare($query);
    $query_update->bind_param("ss",$new_token,$user_id);
    $query_update->execute() or die(ERROR_DB_MESSAGE);
}
function update_last_seen_date_in_db($conn,$user_id) {
    $query="UPDATE `".USERS_TABLE."`
    SET `".USERS_LAST_SEEN."`=?
    WHERE `".USERS_ID."`=?";
    $query_update=$conn->prepare($query);
    $query_update->bind_param("ss",new DateTime('now'),$user_id);
    $query_update->execute() or die(ERROR_DB_MESSAGE);
}

function get_random_login_token() {
    return bin2hex(random_bytes(LOGIN_TOKEN_SIZE));
}

function is_user_in_db($conn,$username) {
    // return 'user info' / FALSE
    // if user is in db
    $query="SELECT * FROM `".USERS_TABLE."` WHERE `".USERS_USERNAME."`=?";
    $query_select=$conn->prepare($query);
    $query_select->bind_param("s",$username);
    $query_select->execute() or die(ERROR_DB_MESSAGE);
    $result=$query_select->get_result();
    $row=$result->fetch_assoc();
    return ($row)?$row:FALSE;
}

function login_user($conn,$username,$password) {
    // return user id / FALSE
    // if the "user - pass" is OK
    $user_info=is_user_in_db($conn,$username);
    if($user_info==FALSE) { return FALSE; }
    $password=get_salty_peppery_password($password,$user_info[USERS_SALT]);
    if(!$password) return FALSE;
    if(password_verify($password,$user_info[USERS_PASSWORD])) {
        set_login_cookie($conn,$user_info[USERS_ID]);
        return $user_info[USERS_ID];
    }
    return FALSE;
}

function verify_password_complexity($password) {
    $lowercase_pattern="/[a-z]/";
    $uppercase_pattern="/[A-Z]/";
    $num_pattern="/[0-9]/";
    if(!preg_match($lowercase_pattern,$password) 
    || !preg_match($uppercase_pattern,$password) 
    || !preg_match($num_pattern,$password) 
    || strlen($password)<8) {
        return FALSE;
    }
    return TRUE;
}

function get_random_salt() {
    return bin2hex(random_bytes(SALT_SIZE));
}
function get_salty_peppery_password($password,$salt) {
    $password=$password.$salt.PASSWORD_PEPPER;
    return $password;
}
function get_salt_from_user_id($conn,$user_id) {
    $query="SELECT `".USERS_SALT."` FROM `".USERS_TABLE."` 
    WHERE `".USERS_ID."`=?";
    $query_select=$conn->prepare($query);
    $query_select->bind_param("s",$user_id);
    $query_select->execute() or die(ERROR_DB_MESSAGE);
    $result=$query_select->get_result();
    $row=$result->fetch_assoc();
    if($row) { return $row[USERS_SALT]; }
    return FALSE;
}

function add_user_in_db($conn,$username,$password) {
    if(!verify_password_complexity($password)) return FALSE;
    $salt=get_random_salt();
    $password=get_salty_peppery_password($password,$salt);
    $hashed_password=password_hash($password,PASSWORD_BCRYPT);
    $link_token=bin2hex(random_bytes(20));
    $query="INSERT INTO `users`(
        `".USERS_USERNAME."`,`".USERS_PASSWORD."`,`".USERS_SALT."`,`".USERS_TOKEN."`) VALUES (?,?,?,?)";
    $query_insert=$conn->prepare($query);
    $query_insert->bind_param("ssss",$username,$hashed_password,$salt,$link_token);
    $query_insert->execute() or die(ERROR_DB_MESSAGE);
    return mysqli_insert_id($conn);
}

function change_user_password($conn,$user_id,$new_password) {
    if(!verify_password_complexity($new_password)) return FALSE;
    $user_salt=get_salt_from_user_id($conn,$user_id);
    if(!$user_salt) return FALSE;
    $new_password=get_salty_peppery_password($new_password,$user_salt);
    $hashed_password=password_hash($new_password,PASSWORD_BCRYPT);
    $query="UPDATE `".USERS_TABLE."`
    SET `".USERS_PASSWORD."`=?
    WHERE `".USERS_ID."`=?";
    $query_update=$conn->prepare($query);
    $query_update->bind_param("ss",$hashed_password,$user_id);
    $query_update->execute() or die(ERROR_DB_MESSAGE);
    return TRUE;
}

function link_users_in_db($conn,$user1_id,$user2_token) {
    // get user2 id from link token
    // create link
    $user2_id=get_user_id_from_token($conn,$user2_token);
    if(!has_link_in_db($conn,$user1_id) 
    and !has_link_in_db($conn,$user2_id) 
    and $user2_id!=FALSE
    and $user1_id!=$user2_id) {
        $query="INSERT INTO `".LINKS_TABLE."`(`".LINKS_FK_USER_1."`,`".LINKS_FK_USER_2."`) VALUES (?,?)";
        $query_insert=$conn->prepare($query);
        $query_insert->bind_param("ss",$user1_id,$user2_id);
        $query_insert->execute() or die(ERROR_DB_MESSAGE);
        return mysqli_insert_id($conn);
    }
    return FALSE;
}

function has_link_in_db($conn,$user_id) {
    $query="SELECT `".LINKS_ID."` FROM `".LINKS_TABLE."` 
    WHERE `".LINKS_FK_USER_1."`=? OR `".LINKS_FK_USER_2."`=?";
    $query_select=$conn->prepare($query);
    $query_select->bind_param("ss",$user_id,$user_id);
    $query_select->execute() or die(ERROR_DB_MESSAGE);
    $result=$query_select->get_result();
    $row=$result->fetch_assoc();
    if($row) { return $row[LINKS_ID]; }
    return FALSE;
}

function get_user_id_from_token($conn,$user_token) {
    $query="SELECT `".USERS_ID."` FROM `".USERS_TABLE."` 
    WHERE `".USERS_TOKEN."`=?";
    $query_select=$conn->prepare($query);
    $query_select->bind_param("s",$user_token);
    $query_select->execute() or die(ERROR_DB_MESSAGE);
    $result=$query_select->get_result();
    $user_id=$result->fetch_assoc();
    return ($user_id?$user_id[USERS_ID]:FALSE);
}

function get_user_token_from_id($conn,$user_id) {
    $query="SELECT `".USERS_TOKEN."` FROM `".USERS_TABLE."` 
    WHERE `".USERS_ID."`=?";
    $query_select=$conn->prepare($query);
    $query_select->bind_param("s",$user_id);
    $query_select->execute() or die(ERROR_DB_MESSAGE);
    $result=$query_select->get_result();
    $link_token=$result->fetch_assoc();
    return $link_token?$link_token[USERS_TOKEN]:FALSE;
}

function get_formatted_date_from_date(String $date) {
    $date_obj=DateTime::createFromFormat("Y-m-d H:i:s",$date);
    $formatted_date=$date_obj->format("d/m/Y");
    return $formatted_date;
}

function get_formatted_left_time_from_date(String $creation_date_in_db) {
    $creation_date=DateTime::createFromFormat("Y-m-d H:i:s",$creation_date_in_db);
    $now=new DateTime('now');
    $creation_date->modify('+24 hours');
    $diff=$creation_date->diff($now);
    return (($diff->h!=0)?$diff->h."h":$diff->i."m");
}

function is_notes_expired(String $creation_date_in_db) {
    $creation_date=DateTime::createFromFormat("Y-m-d H:i:s",$creation_date_in_db);
    $now=new DateTime('now');
    $creation_date->modify('+24 hours');
    if($creation_date<$now) {
        return TRUE;
    }
    return FALSE;
}

function delete_expired_notes(mysqli $conn,String $user_id,String $link_id) {
    $notes=get_all_notes_from_link($conn,$link_id);
    foreach($notes as $note) {
        if(is_notes_expired($note[LIVE_NOTES_DATE])) {
            $query="INSERT INTO `".SAVED_NOTES_TABLE."` 
            SELECT * FROM `".LIVE_NOTES_TABLE."` 
            WHERE `".LIVE_NOTES_ID."`=?";
            $query_insert=$conn->prepare($query);
            $query_insert->bind_param("s",$note[LIVE_NOTES_ID]);
            $query_insert->execute() or die(ERROR_DB_MESSAGE);
            $query="DELETE FROM `".LIVE_NOTES_TABLE."` 
            WHERE `".LIVE_NOTES_ID."`=?";
            $query_delete=$conn->prepare($query);
            $query_delete->bind_param("s",$note[LIVE_NOTES_ID]);
            $query_delete->execute() or die(ERROR_DB_MESSAGE);
        }
    }
}

function add_note_in_db(mysqli $conn,String $data_img,$user_id) {
    $user_link=has_link_in_db($conn,$_SESSION['user_id']);
    if($user_link) {
        $query="INSERT INTO `".LIVE_NOTES_TABLE."`
        (`".LIVE_NOTES_DATA."`,`".LIVE_NOTES_FK_AUTHOR."`,`".LIVE_NOTES_FK_LINK."`) 
        VALUES (?,?,?)";
        $query_insert=$conn->prepare($query);
        $query_insert->bind_param("sss",$data_img,$user_id,$user_link);
        $query_insert->execute() or die(ERROR_DB_MESSAGE);
    }
}

function get_all_notes_from_link($conn,$link_id) {
    $query="SELECT * FROM `".LIVE_NOTES_TABLE."` 
    WHERE `".LIVE_NOTES_FK_LINK."`=?";
    $query_select=$conn->prepare($query);
    $query_select->bind_param("s",$link_id);
    $query_select->execute() or die(ERROR_DB_MESSAGE);
    $result=$query_select->get_result();
    return $result;
}

function get_all_saved_notes_ids_from_author($conn,$linked_user_id,$exclude_yest=FALSE) {
    if(!$exclude_yest) {
        $query="SELECT `".SAVED_NOTES_ID."` FROM `".SAVED_NOTES_TABLE."` 
        WHERE `".SAVED_NOTES_AUTHOR_ID."`=?";
        $query_select=$conn->prepare($query);
        $query_select->bind_param("s",$linked_user_id);
    } else {
        // select only note id that are at least 2 day old to
        // take out notes that wasn't in the yesterday random choice
        $query="SELECT `".SAVED_NOTES_ID."` FROM `".SAVED_NOTES_TABLE."`
        WHERE `".SAVED_NOTES_AUTHOR_ID."`=? AND `".SAVED_NOTES_DATE."`<?";
        $query_select=$conn->prepare($query);
        $y_date=(((new DateTime())->modify('-2 days'))->format("Y-m-d H:i:s"));
        $query_select->bind_param("ss",$linked_user_id,$y_date);
    }
    $query_select->execute() or die(ERROR_DB_MESSAGE);
    $result=$query_select->get_result()->fetch_all();
    return $result;
}

function get_linked_user_id(mysqli $conn,String $user_id) {
    $link_id=has_link_in_db($conn,$user_id);
    $query="SELECT `".LINKS_FK_USER_1."`,`".LINKS_FK_USER_2."` FROM `".LINKS_TABLE."` 
    WHERE `".LINKS_ID."`=?";
    $query_select=$conn->prepare($query);
    $query_select->bind_param("s",$link_id);
    $query_select->execute() or die(ERROR_DB_MESSAGE);
    $result=$query_select->get_result()->fetch_assoc();
    return ($result[LINKS_FK_USER_1]!=$user_id)?$result[LINKS_FK_USER_1]:$result[LINKS_FK_USER_2];
}

function get_linked_user_name(mysqli $conn,String $user_id) {
        $linked_user_id=get_linked_user_id($conn,$user_id);
        $query="SELECT `".USERS_USERNAME."` FROM `".USERS_TABLE."` 
        WHERE `".USERS_ID."`=?";
        $query_select=$conn->prepare($query);
        $query_select->bind_param("s",$linked_user_id);
        $query_select->execute() or die(ERROR_DB_MESSAGE);
        $result=$query_select->get_result()->fetch_assoc();
        return $result[USERS_USERNAME];
}

function get_formatted_user_creation_date($conn,$user_id) {
    $query="SELECT `".USERS_DATE."` FROM `".USERS_TABLE."` 
    WHERE `".USERS_ID."`=?";
    $query_select=$conn->prepare($query);
    $query_select->bind_param("s",$user_id);
    $query_select->execute() or die(ERROR_DB_MESSAGE);
    $result=$query_select->get_result()->fetch_assoc();
    $creation_date_in_db=$result[USERS_DATE];
    $creation_date=DateTime::createFromFormat("Y-m-d H:i:s",$creation_date_in_db);
    return $creation_date->format("d/m/Y");
}
function get_notes_number_from_user(mysqli $conn,String $user_id) {
    $result=0;
    $link_id=has_link_in_db($conn,$user_id);
    $query="SELECT COUNT(*) FROM `".LIVE_NOTES_TABLE."`
    WHERE `".LIVE_NOTES_TABLE."`.`".LIVE_NOTES_FK_AUTHOR."`=? AND ".LIVE_NOTES_FK_LINK."=?";
    $query_select=$conn->prepare($query);
    $query_select->bind_param("ss",$user_id,$link_id);
    $query_select->execute() or die(ERROR_DB_MESSAGE);
    $result+=$query_select->get_result()->fetch_row()[0];
    $query="SELECT COUNT(*) FROM `".SAVED_NOTES_TABLE."`
    WHERE `".SAVED_NOTES_TABLE."`.`".SAVED_NOTES_AUTHOR_ID."`=? AND ".SAVED_NOTES_LINK_ID."=?";
    $query_select=$conn->prepare($query);
    $query_select->bind_param("ss",$user_id,$link_id);
    $query_select->execute() or die(ERROR_DB_MESSAGE);
    $result+=$query_select->get_result()->fetch_row()[0];
    return $result;
}

function get_yesterday_random_note_id($conn,$notes_ids) {
    // get note id using yesterday day as random seed
    srand(mktime(0,0,0,date("m"),date("d")-1,date("Y")));
    if(count($notes_ids)<=0) { return FALSE; }
    $random_note_index=rand(0,count($notes_ids)-1);
    return $random_note_index;
}
function get_today_random_note_id($conn) {
    // get note id and data using today's as random seed
    $linked_user_id=get_linked_user_id($conn,$_SESSION['user_id']);
    $yest_notes_ids=get_all_saved_notes_ids_from_author($conn,$linked_user_id,$exclude_yest=TRUE);
    $notes_ids=get_all_saved_notes_ids_from_author($conn,$linked_user_id);
    if(count($notes_ids)>=2) {
        $yesterday_note_id=get_yesterday_random_note_id($conn,$yest_notes_ids);
        if($yesterday_note_id!==FALSE) {
            array_splice($notes_ids,$yesterday_note_id,1);
        }
        srand(mktime(0,0,0));
        $random_note_index=rand(0,count($notes_ids)-1);
        return $notes_ids[$random_note_index][0];
    } else if (count($notes_ids)===1) {
        return $notes_ids[0][0];
    }
    return FALSE;
}
function get_today_random_note_data($conn) {
    $note_id=get_today_random_note_id($conn);
    if($note_id===FALSE) { return FALSE; }
    $query="SELECT `".SAVED_NOTES_DATA."`,`".SAVED_NOTES_DATE."` FROM `".SAVED_NOTES_TABLE."` 
    WHERE `".SAVED_NOTES_ID."`=?";
    $query_select=$conn->prepare($query);
    $query_select->bind_param("s",$note_id);
    $query_select->execute() or die(ERROR_DB_MESSAGE);
    $result=$query_select->get_result()->fetch_assoc();
    return $result;
}
?>
