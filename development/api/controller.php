<?php
class Controller extends Utilities {

	private $api_dir = null;

	public $session = null;
	public $granted = false;

	public function __construct(){
		global $api_dir;
		global $configurations;
		
		$this->api_dir =& $api_dir;
		$this->config =& $configurations;

		require "../controller/session.php";
		$this->session = Session::getInstance();
		$this->checkAccess();
	}

	private function checkAccess() {
		if (isset($this->session->usertoken)) {
      $this->granted = true;
    } else {
      $this->granted = false;
		}
		$this->granted = true; // This is temporary and needs to be removed for final release
	}

	public function loadModel($model_name){
		require $this->api_dir . '/models/' . strtolower($model_name) . '.php';
		// return new model (and pass the database connection to the model)
		return new $model_name($this->config, $this->session);
	}
}