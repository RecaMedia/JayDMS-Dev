<?php
class templatesfunctions extends Controller {

	function __construct($config) {
		$this->config = $config;
	}

	public function GetList() {

		$refined_list = [];

		$template_dir = $this->config->dmsDir."/packages/default/templates";

		if (is_dir($template_dir)) {
			$list = scandir($template_dir);

			for($i = 0; $i < count($list); $i++) {
				$item = $list[$i];
				if ($item != "." && $item != "..") {
					$path = $template_dir."/".$item;
					if (!is_dir($path) && file_exists($path)) {
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
				'message' => "Templates successful.",
				'list' => $refined_list
			);
		} else {
			return array(
				'success' => false,
				'message' => "No Templates were found.",
				'list' => []
			);
		}
	}

	public function LoadTemplate() {

		if (isset($_POST['slug'])) {
			$template_dir = $this->config->dmsDir."/packages/default/templates";
			$slug = $_POST['slug'];
			$path = $template_dir . '/' . $slug . '.json';
	
			if (file_exists($path)) {
				$template = json_decode(file_get_contents($path));

				return array(
					'success' => true,
					'message' => "Template retrieved.",
					'template' => $template
				);
			} else {
				return array(
					'success' => false,
					'message' => "Template not found.",
					'template' => null
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "Slug not provided."
			);
		}
	}

	public function SaveTemplate() {
		if (isset($_POST['json'])) {
			$template_dir = $this->config->dmsDir."/packages/default/templates";
			$json = json_decode($_POST['json']);

			if (!is_dir($template_dir)) {
				mkdir($template_dir, 0775, true);
			}

			$file_name = $json->slug;
			$path = $template_dir . '/' . $file_name . '.json';

			$file = fopen($path, "w");
			fwrite($file, json_encode($json));
			fclose($file);

			if (file_exists($path)) {
				return array(
					'success' => true,
					'message' => "Template successfully saved."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Template failed save."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "JSON not provided."
			);
		}
	}

	public function DeleteTemplate() {
		if (isset($_POST['slug'])) {
			$template_dir = $this->config->dmsDir."/packages/default/templates";
			$slug = $_POST['slug'];
			$path = $template_dir . '/' . $slug . '.json';

			if (unlink($path)) {
				return array(
					'success' => true,
					'message' => "Template successfully deleted."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Template failed deletion."
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