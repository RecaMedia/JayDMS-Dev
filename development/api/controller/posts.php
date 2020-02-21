<?php
class posts extends Controller {

	public function list(){

		if ($this->granted) {
			$ft = $this->loadModel('postsfunctions');
			$return = $ft->GetList();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function save(){

		if ($this->granted) {
			$ft = $this->loadModel('postsfunctions');
			$return = $ft->SavePost();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function load(){

		if ($this->granted) {
			$ft = $this->loadModel('postsfunctions');
			$return = $ft->LoadPost();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function delete(){

		if ($this->granted) {
			$ft = $this->loadModel('postsfunctions');
			$return = $ft->DeletePost();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}
}
