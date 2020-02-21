<?php
class general extends Controller {

	public function loadFrontend(){

		if ($this->granted) {
			$gf = $this->loadModel('generalfunctions');
			$return = $gf->LoadGlobalFrontend();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function saveFrontend(){

		if ($this->granted) {
			$gf = $this->loadModel('generalfunctions');
			$return = $gf->SaveGlobalFrontend();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function loadMenus(){

		if ($this->granted) {
			$gf = $this->loadModel('generalfunctions');
			$return = $gf->LoadMenus();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function saveMenus(){

		if ($this->granted) {
			$gf = $this->loadModel('generalfunctions');
			$return = $gf->SaveMenus();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function loadGlobals(){

		if ($this->granted) {
			$gf = $this->loadModel('generalfunctions');
			$return = $gf->LoadGlobals();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function saveGlobals(){

		if ($this->granted) {
			$gf = $this->loadModel('generalfunctions');
			$return = $gf->SaveGlobals();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function buildPreview(){

		if ($this->granted) {
			$gf = $this->loadModel('generalfunctions');
			$return = $gf->ProcessPreview();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}

	public function removePreview(){

		if ($this->granted) {
			$gf = $this->loadModel('generalfunctions');
			$return = $gf->DeletePreview();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		// Print json return
		echo json_encode($return);
	}
}
