<?php
$form_success = false;

// Setup Vars
$salt = $_POST['salt'];
$timezone = $_POST['timezone'];


/****************************************************/
// Config File Process
/****************************************************/

$config_file_data = '
<?php
// Get directories\n
$api_dir = dirname(__DIR__)."/api";
$admin_dir = dirname(dirname(__DIR__));
$dms_dir = dirname(dirname(dirname(__DIR__)));
$cache_dir = $dms_dir."/cache";
$content_dir = $dms_dir."/content";

// Set keys
$salt_key = "'.$salt.'";

// Create config var
$configurations = (object) array(
  "saltKey" => $salt_key,
  "baseDir" => $api_dir,
  "adminDir" => $admin_dir,
  "dmsDir" => $dms_dir,
  "cacheDir" => $cache_dir,
  "contentDir" => $content_dir
);

// set timezone
date_default_timezone_set("'.$timezone.'");
?>';

// Create config file
$file = fopen($this->config_file_path, "w+"); // config_file_path is defined in parent file
fwrite($file, $config_file_data);
fclose($file);

// Verify file has been created
$config_file_ready = false;
if (file_exists($this->config_file_path)) {
  $config_file_ready = true;
  // Setting temporary config value since file was just created and needs to exist for the encrypt function
  $this->config = (object) array("saltKey" => $salt);
} else {
  $this->form_error = true;
  $this->form_error_msg .= 'Unable to create configuration file. Please check your PHP and permission settings.<br />';
}


/****************************************************/
// User Account Process
/****************************************************/


if ($config_file_ready && isset($_POST['initializeusers'])) {

  // Setup Vars
  $first_name = $_POST['firstname'];
  $last_name = $_POST['lastname'];
  $username = $_POST['username'];
  $email = $_POST['email'];
  $password = $_POST['password'];

  // Email checker
  function isValidEmail($emailcheck){
    return preg_match("/^([a-zA-Z0-9])+([\.a-zA-Z0-9_-])*@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-]+)*\.([a-zA-Z]{2,6})$/", $emailcheck);
  }

  // Validation process
  if($first_name == "" || $last_name == "" || $username == "" || $email == "" || $password == ""){
    $this->form_error = true;
    $this->form_error_msg .= 'All inputs must be filled.<br />';
  }
  if(!isValidEmail($email)){
    $this->form_error = true;
    $this->form_error_msg .= 'Please enter a valid email address.<br />';
  }

  // If no errors, proceed
  if (!$this->form_error){

    // Clean up
    $first_name = ucfirst(strtolower(preg_replace("/[^A-Za-z ]/","", $first_name)));
    $last_name = ucfirst(strtolower(preg_replace("/[^A-Za-z ]/","", $last_name)));
    $username = preg_replace("/[^A-Za-z0-9!@#$%^&*_-]/i","", $username);
    $email = $email;
    $crypted_password = $this->encrypt_decrypt("encrypt", $password);
    
    // This specific user data
    $admin_user_data = array(
      "firstname" => $first_name,
      "lastname" => $last_name,
      "username" => $username,
      "email" => $email,
      "encryptedPassword" => $crypted_password,
      "role" => "administrator",
      "datetime" => date("Y-m-d H:i:s")
    );

    // Users object for all future users
    $all_user_file_data = array(
      "users" => array(
        $username => $this->encrypt_decrypt("encrypt", json_encode($admin_user_data))
      )
    );

    // Create users file
    $file = fopen($this->users_file_path, "w+"); // user_file_path is defined in parent file
    fwrite($file, json_encode($all_user_file_data));
    fclose($file);

    // Verify file has been created
    $user_file_ready = false;
    if (file_exists($this->users_file_path)) {
      $user_file_ready = true;
    } else {
      $this->form_error = true;
      $this->form_error_msg .= 'Unable to create users file. Please check your PHP and permission settings.<br />';
    }
  }
}
?>