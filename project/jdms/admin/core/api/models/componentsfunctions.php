<?php
class componentsfunctions extends Controller {

	function __construct($config) {
		$this->config = $config;
	}

	public function GetSampleCode($mode) {

		$sample_code_dir = $this->config->adminDir."/core/sample-codes";
		$list = scandir($sample_code_dir);

		if ($list) {
			$refined_list = [];

			for($i = 0; $i < count($list); $i++) {
				$item = $list[$i];

				if ($item != "." && $item != "..") {
					$name_parts = explode(".", $item);
					$item_mode = array_shift($name_parts);

					$path = $sample_code_dir."/".$item;
					$code = file_get_contents($path);

					if ($mode == $item_mode) {
						return array(
							'success' => true,
							'message' => "Sample code found.",
							'code' => $code
						);
					}
				}
			}

			return array(
				'success' => false,
				'message' => "Sample code not found.",
				'code' => ""
			);
		} else {
			return array(
				'success' => false,
				'message' => "Sample codes do not exist.",
				'code' => ""
			);
		}
	}

	public function GetList() {

		$refined_list = [];

		$components_dir = $this->config->dmsDir."/packages/default/components";

		if (is_dir($components_dir)) {
			$list = scandir($components_dir);

			for($i = 0; $i < count($list); $i++) {
				$item = $list[$i];
				if ($item != "." && $item != "..") {
					$name_parts = explode(".", $item);
					$ext = array_pop($name_parts);
					$path = $components_dir."/".$item;
					if (!is_dir($path) && file_exists($path) && $ext == "json") {
						$name_parts = explode(".", $item);
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

			return array(
				'success' => true,
				'message' => "Components successful.",
				'list' => $refined_list
			);
		} else {
			return array(
				'success' => false,
				'message' => "No Components were found.",
				'list' => []
			);
		}
	}

	public function LoadComponent() {

		if (isset($_POST['slug'])) {
			$component_dir = $this->config->dmsDir."/packages/default/components";
			$slug = $_POST['slug'];
			$path = $component_dir . '/' . $slug . '.json';
	
			if (file_exists($path)) {
				$component = json_decode(file_get_contents($path));

				return array(
					'success' => true,
					'message' => "Component retrieved.",
					'component' => $component
				);
			} else {
				return array(
					'success' => false,
					'message' => "Component not found.",
					'component' => null
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "Slug not provided."
			);
		}
	}

	public function SaveComponent() {
		if (isset($_POST['json'])) {
			$component_dir = $this->config->dmsDir."/packages/default/components";
			$json = json_decode($_POST['json']);

			if (!is_dir($component_dir)) {
				mkdir($component_dir, 0775, true);
			}

			$file_name = $json->slug;
			$path = $component_dir . '/' . $file_name . '.json';

			$file = fopen($path, "w+");
			fwrite($file, json_encode($json));
			fclose($file);

			if (file_exists($path)) {
				return array(
					'success' => true,
					'message' => "Component successfully saved."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Component failed save."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "JSON not provided."
			);
		}
	}

	public function DeleteComponent() {
		if (isset($_POST['slug'])) {
			$component_dir = $this->config->dmsDir."/packages/default/components";
			$slug = $_POST['slug'];
			$path = $component_dir . '/' . $slug . '.json';

			if (unlink($path)) {
				return array(
					'success' => true,
					'message' => "Component successfully deleted."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Component failed deletion."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "Slug not provided."
			);
		}
	}
}
?>