<?php
class fieldtypes extends Controller {

	public function list(){

		if ($this->granted) {
			$ft = $this->loadModel('fieldtypesfunctions');
			$return = $ft->GetList();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function get($directory, $field){

		if ($this->granted) {
			$ft = $this->loadModel('fieldtypesfunctions');
			$return = $ft->GetFieldType($directory, $field);
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}
}
