<?php
class users extends Controller {

	public function current(){

		if ($this->granted) {
			$uf = $this->loadModel('usersfunctions');
			$return = $uf->CurrentUser();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function get(){

		if ($this->granted) {
			$uf = $this->loadModel('usersfunctions');
			$return = $uf->GetUser();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function update(){

		if ($this->granted) {
			$uf = $this->loadModel('usersfunctions');
			$return = $uf->UpdateUser();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function add(){

		if ($this->granted) {
			$uf = $this->loadModel('usersfunctions');
			$return = $uf->AddUser();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function delete(){

		if ($this->granted) {
			$uf = $this->loadModel('usersfunctions');
			$return = $uf->DeleteUser();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function all(){

		if ($this->granted) {
			$uf = $this->loadModel('usersfunctions');
			$return = $uf->GetAllUsers();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}
}
