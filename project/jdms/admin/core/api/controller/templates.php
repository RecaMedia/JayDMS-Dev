<?php
class templates extends Controller {

	public function list(){

		if ($this->granted) {
			$ft = $this->loadModel('templatesfunctions');
			$return = $ft->GetList();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function save(){

		if ($this->granted) {
			$ft = $this->loadModel('templatesfunctions');
			$return = $ft->SaveTemplate();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function load(){

		if ($this->granted) {
			$ft = $this->loadModel('templatesfunctions');
			$return = $ft->LoadTemplate();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function delete(){

		if ($this->granted) {
			$ft = $this->loadModel('templatesfunctions');
			$return = $ft->DeleteTemplate();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}
}
