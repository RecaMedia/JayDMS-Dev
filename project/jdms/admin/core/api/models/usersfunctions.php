<?php
class usersfunctions extends Controller {

	function __construct($config, $session) {
    $this->config = $config;
    $this->session = $session;
  }
  
  public function CurrentUser() {
    return array(
      'success' => true,
      'message' => "User retreived.",
      "user" => json_decode($this->encrypt_decrypt("decrypt", $this->session->usertoken))
    );
  }

  public function GetUser() {
    
    if (isset($_POST['username'])) {

      // Users file path
      $users_file = $this->config->contentDir."/data/core/users.json";

      // Check if file exist
			if (file_exists($users_file)) {

        // Get data from file and post object
        $username = $_POST['username'];
        $all_users = json_decode(file_get_contents($users_file), true);

        // Check if user exist
        if ( !isset($all_users["users"][$username]) ) {
          return array(
            'success' => false,
            'message' => "User does not exist."
          );
        }

        $user = (isset($all_users["users"][$username]) ? json_decode($this->encrypt_decrypt("decrypt", $all_users["users"][$username])) : null);

        if ($user != null) {
          return array(
            'success' => true,
            'message' => "User retreived.",
            "user" => $user
          );
        } else {
          return array(
            'success' => false,
            'message' => "User not found."
          );
        }
      } else {
				return array(
					'success' => false,
					'message' => "Unable to get user info."
				);
			}
    } else {
			return array(
				'success' => false,
				'message' => "Username not provided."
			);
		}
  }

	public function UpdateUser() {

    // Check for submitted data
		if (isset($_POST['json'])) {

      // Users file path
      $users_file = $this->config->contentDir."/data/core/users.json";

      // Check if file exist
			if (file_exists($users_file)) {

        // Get data from file and post object
        $submitted_data = json_decode($_POST['json'], true);
        $all_users = json_decode(file_get_contents($users_file), true);

        // Check if user exist
        if ( !isset($all_users["users"][$submitted_data["originalUsername"]]) ) {
          return array(
            'success' => false,
            'message' => "User does not exist."
          );
        }

        // Grab original password before removing user data
        $original_user_data = json_decode($this->encrypt_decrypt("decrypt", $all_users["users"][$submitted_data["originalUsername"]]));
        $original_encrypted_password = $original_user_data->encryptedPassword;

        // Remove the previous user data object
        unset($all_users["users"][$submitted_data["originalUsername"]]);

        // Check if new password was sumbitted
        if (isset($submitted_data["password"]) && strlen($submitted_data["password"]) > 6) {
          // Encrypt new password
          $encrypted_password = $this->encrypt_decrypt("encrypt", $submitted_data["password"]);
        } else {
          // Use orginial password
          $encrypted_password = $original_encrypted_password;
        }

        // Add user data to all users object
        $updated_user = array(
          "datetime" => $submitted_data["datetime"],
          "email" => $submitted_data["email"],
          "encryptedPassword" => $encrypted_password,
          "firstname" => $submitted_data["firstname"],
          "lastname" => $submitted_data["lastname"],
          "role" => $submitted_data["role"],
          "username" => $submitted_data["username"]
        );
        $all_users["users"][$submitted_data["username"]] = $this->encrypt_decrypt("encrypt", json_encode($updated_user));

        // Write users file
        $file = fopen($users_file, "w+");
        fwrite($file, json_encode($all_users));
        fclose($file);

        $this->session->usertoken = $this->encrypt_decrypt("encrypt", json_encode($updated_user));

        // Return
				return array(
					'success' => true,
					'message' => "User updated."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Unable to update user."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "User data not provided."
			);
		}
  }

  public function AddUser() {

    // Check for submitted data
		if (isset($_POST['json'])) {

      // Users file path
      $users_file = $this->config->contentDir."/data/core/users.json";

      // Check if file exist
			if (file_exists($users_file)) {

        // Get data from file and post object
        $submitted_data = json_decode($_POST['json'], true);
        $all_users = json_decode(file_get_contents($users_file), true);

        // Check if user exist
        if ( isset($all_users["users"][$submitted_data["username"]]) ) {
          return array(
            'success' => false,
            'message' => "User already exist."
          );
        }

        // Encrypt new password
        $encrypted_password = $this->encrypt_decrypt("encrypt", $submitted_data["password"]);

        // Add user data to all users object
        $updated_user = array(
          "datetime" => $submitted_data["datetime"],
          "email" => $submitted_data["email"],
          "encryptedPassword" => $encrypted_password,
          "firstname" => $submitted_data["firstname"],
          "lastname" => $submitted_data["lastname"],
          "role" => $submitted_data["role"],
          "username" => $submitted_data["username"]
        );
        $all_users["users"][$submitted_data["username"]] = $this->encrypt_decrypt("encrypt", json_encode($updated_user));

        // Write users file
        $file = fopen($users_file, "w+");
        fwrite($file, json_encode($all_users));
        fclose($file);

        // Return
				return array(
					'success' => true,
					'message' => "User added."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Unable to add user."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "User data not provided."
			);
		}
  }

  public function DeleteUser() {

    // Check for submitted data
		if (isset($_POST['username'])) {

      // Users file path
      $users_file = $this->config->contentDir."/data/core/users.json";

      // Check if file exist
			if (file_exists($users_file)) {

        // Get data from file and post object
        $username = $_POST['username'];
        $all_users = json_decode(file_get_contents($users_file), true);

        // Check if user exist
        if ( !isset($all_users["users"][$username]) ) {
          return array(
            'success' => false,
            'message' => "User does not exist."
          );
        }

        // Get current user info
        $current_user = json_decode($this->encrypt_decrypt("decrypt", $this->session->usertoken));

        // Check if user has administrator rights
        if ($current_user->role == "administrator") {

          // Remove user
          unset($all_users["users"][$username]);

          // Check if user is removing self
          $refresh_needed = false;
          if ($username == $current_user->username) {
            // User deleted self, we need to remove session token
            $this->session->usertoken = null;
            $refresh_needed = true;
          }

          // Write users file
          $file = fopen($users_file, "w+");
          fwrite($file, json_encode($all_users));
          fclose($file);

          // Return
          return array(
            'success' => true,
            'message' => "User has been removed.",
            'refresh' => $refresh_needed
          );
        } else {
          return array(
            'success' => false,
            'message' => "You need to have administrator privileges to remove user."
          );
        }
			} else {
				return array(
					'success' => false,
					'message' => "Unable to remove user."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "User data not provided."
			);
		}
  }
  
  public function GetAllUsers() {
    
      // Users file path
      $users_file = $this->config->contentDir."/data/core/users.json";

      // Check if file exist
			if (file_exists($users_file)) {

        // Get data from file
        $all_users = json_decode(file_get_contents($users_file), true);

        foreach($all_users["users"] as $username => $user_data) {
          $all_users["users"][$username] = json_decode($this->encrypt_decrypt("decrypt", $user_data));
        }

        return array(
          'success' => true,
          'message' => "User retreived.",
          "users" => $all_users["users"]
        );
      } else {
				return array(
					'success' => false,
					'message' => "Unable to get users info."
				);
			}

  }
}
?>