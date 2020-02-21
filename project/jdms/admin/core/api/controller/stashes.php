<?php
class stashes extends Controller {

	public function list(){

		if ($this->granted) {
			$ft = $this->loadModel('stashesfunctions');
			$return = $ft->GetStashes();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function save(){

		if ($this->granted) {
			$ft = $this->loadModel('stashesfunctions');
			$return = $ft->SaveStash();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function load(){

		if ($this->granted) {
			$ft = $this->loadModel('stashesfunctions');
			$return = $ft->LoadStash();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function delete(){

		if ($this->granted) {
			$ft = $this->loadModel('stashesfunctions');
			$return = $ft->DeleteStash();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
  }
  
  public function savedata(){

		if ($this->granted) {
			$ft = $this->loadModel('stashesfunctions');
			$return = $ft->SaveStashData();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function loaddata(){

		if ($this->granted) {
			$ft = $this->loadModel('stashesfunctions');
			$return = $ft->LoadStashData();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}
}
