<?php
require 'utilities.php';

class JayDMS extends Utilities {

  private static $instance;
  private $installed = false;
  private $config_file_path = "";
  private $users_file_path = "";
  private $all_users_data = null;
  private $form_error = false;
  private $form_error_msg = "";

  public $config = null;
  public $session = null;
  public $user = null;
   
	private function __construct() {
    // Get session class
    require "session.php";

    // Initiate session
    $this->session = Session::getInstance();

    // Remove token on signout
    if (isset($_GET['signout'])) {
      $this->session->usertoken = null;
    }

    // Get file path to config
    $this->config_file_path = dirname(__DIR__) . DIRECTORY_SEPARATOR . basename(__DIR__) . "/config.php";

    // Get file path to users
    $core_dir = dirname(dirname(dirname(__DIR__))) . '/content/data/core';
    if (!is_dir($core_dir)) {
      mkdir($core_dir);
    }
    $this->users_file_path = $core_dir . '/users.json';

    // Handle install form submission before checking for config and user files
    $this->catchFormSubmission("install");

    // Check if files exist, if so, installation has been done
    if (!file_exists($this->config_file_path) && !file_exists($this->users_file_path)) {
      // Launch installation process
      $this->launchInstallation();
    } else {
      // Get config and set vars for later usage
      require $this->config_file_path;
      $this->config = (object) $configurations;
      $this->installed = true;
      // Handle sign-in form submission
      $this->catchFormSubmission("signin");
    }
  }
   
  // Self starter
	public static function start() {
		if ( !isset(self::$instance)) {
			self::$instance = new self;
		}
		return self::$instance;
  }

  private function createFormToken() {
    return trim(substr(hash('sha256', rand(1, 256) . ":" . date("Y-m-d H:i:s")), 0, 16));
  }
  
  private function catchFormSubmission($type = "") {
    // Check for an absolute form submission
    if (isset($_POST) && isset($_POST['jaydmsformtoken']) && $_POST['jaydmsformtoken'] === $this->session->formtoken) {
      // Detect form submission for initializing JayDMS
      if ($type == "install") {
        if (isset($_POST['initializejaydms'])) {
          require "install/process.php";
        }
      }
      // Detect form submission for sign-in
      if ($type == "signin") {
        if (isset($_POST['signinjaydms'])) {
          require "sign-in/process.php";
        }
      }
    }
  }

	public function checkSession() {
    // Check if user token exist
    if (isset($this->session->usertoken)) {
      return true;
    } else {
      return false;
    }
  }

  private function launchInstallation() {
    require 'install/index.php';
  }

  private function launchSignIn() {
    require 'sign-in/index.php';
  }

  public function adminView() {
    if ($this->checkSession()) {
      ?>
      <div id="AdminModal"></div>
      <div id="AdminUI"></div>
      <script src="/jdms/admin/assets/js/admin-min.js"></script>
      <?php
    } else if ($this->installed) {
      $this->launchSignIn();
    }
  }
}
?>