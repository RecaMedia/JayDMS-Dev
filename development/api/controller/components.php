<?php
class components extends Controller {

	public function codesample($mode){

		if ($this->granted) {
			$ft = $this->loadModel('componentsfunctions');
			$return = $ft->GetSampleCode($mode);
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function list(){

		if ($this->granted) {
			$ft = $this->loadModel('componentsfunctions');
			$return = $ft->GetList();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function save(){

		if ($this->granted) {
			$ft = $this->loadModel('componentsfunctions');
			$return = $ft->SaveComponent();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function load(){

		if ($this->granted) {
			$ft = $this->loadModel('componentsfunctions');
			$return = $ft->LoadComponent();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function delete(){

		if ($this->granted) {
			$ft = $this->loadModel('componentsfunctions');
			$return = $ft->DeleteComponent();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}
}
