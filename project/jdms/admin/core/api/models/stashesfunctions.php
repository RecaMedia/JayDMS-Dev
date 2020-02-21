<?php
class stashesfunctions extends Controller {

	function __construct($config) {
		$this->config = $config;
  }

	public function GetStashes() {

		$refined_list = [];

		$template_dir = $this->config->dmsDir."/packages/default/stashes";

		if (is_dir($template_dir)) {
			$list = scandir($template_dir);

			for($i = 0; $i < count($list); $i++) {
				$item = $list[$i];
				if ($item != "." && $item != "..") {
					$path = $template_dir."/".$item;
					if (is_dir($path)) {
						$dir_list = $this->readFiles($path);
						array_merge($refined_list, $dir_list);
					} else if (file_exists($path)) {
						$name_parts = explode(".", $item);
						$ext = array_pop($name_parts);
						if ($ext == "json") {
							$slug = array_shift($name_parts);
							$data = json_decode(file_get_contents($path), true);
			
							$refined_list[] = array(
								"path" => $path,
								"slug" => $slug,
								"data" => $data
							);
						}
					}
				}
			}

			return array(
				'success' => true,
				'message' => "Stashes successful.",
				'list' => $refined_list
			);
		} else {
			return array(
				'success' => false,
				'message' => "No Stashes were found.",
				'list' => []
			);
		}
	}

	public function LoadStash() {

		if (isset($_POST['stash'])) {
			$stashes_dir = $this->config->dmsDir."/packages/default/stashes";
			$file_name = $_POST['stash'];
			$path = $stashes_dir . '/' . $file_name . '.json';
	
			if (file_exists($path)) {
				$stashes = json_decode(file_get_contents($path));

				return array(
					'success' => true,
					'message' => "Stash retrieved.",
					'stash' => $stashes
				);
			} else {
				return array(
					'success' => false,
					'message' => "Stash not found.",
					'stash' => null
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "Stash name not provided."
			);
		}
	}

	public function SaveStash() {
		if (isset($_POST['stash']) && isset($_POST['json'])) {
			$stashes_dir = $this->config->dmsDir."/packages/default/stashes";

			if (!is_dir($stashes_dir)) {
				mkdir($stashes_dir);
			}

			$json = json_decode($_POST['json']);
			$file_name = $_POST['stash'];
			$path = $stashes_dir . '/' . $file_name . '.json';

			$file = fopen($path, "w");
			fwrite($file, json_encode($json));
			fclose($file);

			if (file_exists($path)) {
				return array(
					'success' => true,
					'message' => "Stash successfully saved."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Stash failed save."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "JSON not provided."
			);
		}
	}

	public function DeleteStash() {
		if (isset($_POST['stash'])) {
			$stashes_dir = $this->config->dmsDir."/packages/default/stashes";
			$blueprint_dir = $this->config->contentDir."/data/stashes";

			$file_name = $_POST['stash'];
			$path = $stashes_dir . '/' . $file_name . '.json';
			$data_file = $blueprint_dir . '/' . $file_name . '.json';

			$data_file_deleted = true;
			if (file_exists($data_file)) {
				$data_file_deleted = false;
				if (unlink($data_file)) {
					$data_file_deleted = true;
				}
			}

			if (unlink($path) && $data_file_deleted) {
				return array(
					'success' => true,
					'message' => "Stash successfully deleted."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Stash failed deletion."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "Stash name not provided."
			);
		}
	}

	public function LoadStashData() {

		if (isset($_POST['stash'])) {
      $file_name = $_POST['stash'];
      $blueprint_dir = $this->config->contentDir."/data/stashes";
			$path = $blueprint_dir . '/' . $file_name . '.json';
	
			if (file_exists($path)) {
				$data = json_decode(file_get_contents($path), true);

				return array(
					'success' => true,
					'message' => "Stash data retrieved.",
					'data' => $data
				);
			} else {
				return array(
					'success' => false,
					'message' => "Stash data not found.",
					'stash' => null
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "Stash name not provided."
			);
		}
	}

	public function SaveStashData() {
		if (isset($_POST['data'])) {
			$blueprint_dir = $this->config->contentDir."/data/stashes";
			
			if (!is_dir($blueprint_dir)) {
				mkdir($blueprint_dir);
			}

			$json = json_decode($_POST['data']);

			$file_name = $json->slug;
			$path = $blueprint_dir . '/' . $file_name . '.json';

			$file = fopen($path, "w");
			fwrite($file, json_encode($json));
			fclose($file);

			if (file_exists($path)) {
				return array(
					'success' => true,
					'message' => "Stash data successfully saved."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Stash data failed save."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "Stash name or JSON not provided."
			);
		}
	}
}
?>