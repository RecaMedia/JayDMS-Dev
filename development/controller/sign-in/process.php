<?php
// Decrypt user token to get user data string
$encrypted_password = $this->encrypt_decrypt("encrypt", $_POST['password']);
// Get all user data to check if user exist
$this->all_users_data = json_decode(file_get_contents($this->users_file_path), true);

// Make sure user exist
if (isset($this->all_users_data['users'][$_POST['username']])) {

  // Decrypt user data
  $user_data = json_decode($this->encrypt_decrypt("decrypt", $this->all_users_data['users'][$_POST['username']]));
  
  // Check if password matches
  if ($user_data->encryptedPassword === $encrypted_password) {
    // Create user token
    $this->session->usertoken = $this->encrypt_decrypt("encrypt", json_encode($user_data));
    // Redirect to control panel
    header("Location: /cp/");
  } else {
    $this->form_error = true;
    $this->form_error_msg = "Password mismatch.<br />";
  }  
} else {
  $this->form_error = true;
  $this->form_error_msg = "User not found.<br />";
}
?>