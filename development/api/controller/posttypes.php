<?php
class posttypes extends Controller {

	public function list(){

		if ($this->granted) {
			$ft = $this->loadModel('posttypesfunctions');
			$return = $ft->GetList();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function save(){

		if ($this->granted) {
			$ft = $this->loadModel('posttypesfunctions');
			$return = $ft->SavePostType();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function load(){

		if ($this->granted) {
			$ft = $this->loadModel('posttypesfunctions');
			$return = $ft->LoadPostType();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function delete(){

		if ($this->granted) {
			$ft = $this->loadModel('posttypesfunctions');
			$return = $ft->DeletePostType();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}
}
