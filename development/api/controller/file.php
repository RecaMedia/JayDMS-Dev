<?php
/*
@category   CMS
@package    Backdoor - Your Online Companion Editor
@author     Shannon Reca | shannonreca.com
@copyright  2018 Shannon Reca
@usage      For more information visit https://github.com/RecaMedia/Backdoor
@license    https://github.com/RecaMedia/Backdoor/blob/master/LICENSE
@version    v2.0.4
@since      01/12/18
*/

class File extends Controller {

  public function directory(){

		if ($this->granted) {
			$dm = $this->loadModel('filefunctions');
			$return = $dm->LoadDirectory();
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function copy(){

		if ($this->granted) {
			$fm = $this->loadModel('filefunctions');
			$return = $fm->process('copyFile');
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function rename(){

		if ($this->granted) {
			$fm = $this->loadModel('filefunctions');
			$return = $fm->process('renameFile');
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function delete(){

		if ($this->granted) {
			$fm = $this->loadModel('filefunctions');
			$return = $fm->process('deleteFile');
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function create($type){

		if ($this->granted) {
			$fm = $this->loadModel('filefunctions');
			if ($type == "folder") {
				$return = $fm->process('newFolder');
			} else {
				$return = array('success' => false,'statusMessage' => 'Type not provided.');
			}
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function permission(){

		if ($this->granted) {
			$fm = $this->loadModel('filefunctions');
			$return = $fm->process('changePermission');
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}

	public function upload($from_browser = null){

		if ($this->granted) {
			$fm = $this->loadModel('filefunctions');

			if ($from_browser == null) {
				// This upload is from editor
				$return = $fm->Uploader();
			} else {
				// This upload is from file manager
				$return = $fm->uploadSingleFile();
			}
		} else {
			$return = array('success' => false,'statusMessage' => 'Access denied.');
		}

		echo json_encode($return);
	}
}
