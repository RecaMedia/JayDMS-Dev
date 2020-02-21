<?php
class fieldtypesfunctions extends Controller {

	private $refined_list;

	function __construct($config) {
		$this->config = $config;
	}

	private function readFiles($file_path) {

		$list = scandir($file_path);
		
		if ($list) {
			for($i = 0; $i < count($list); $i++) {
				$item = $list[$i];
				if ($item != "." && $item != "..") {
					$path = $file_path."/".$item;
					if (is_dir($path)) {
						$dir_list = $this->readFiles($path);
						array_merge($this->refined_list, $dir_list);
					} else {
						$name_parts = explode(".", $item);
						$ext = array_pop($name_parts);
						if ($ext == "json") {
							$filename = array_shift($name_parts);
							$data = json_decode(file_get_contents($path), true);
			
							$this->refined_list[] = array(
								"path" => $path,
								"filename" => $filename,
								"data" => $data
							);
						}
					}
				}
			}
			return $this->refined_list;
		} else {
			return $this->refined_list;
		}
	}

	public function GetList() {

		$this->refined_list = [];
		$field_types_dir = $this->config->adminDir."/core/fieldtypes";
		$this->refined_list = $this->readFiles($field_types_dir);
		
		return array(
			'success' => true,
			'message' => "Field types successful.",
			'list' => $this->refined_list
		);
	}

	public function GetFieldType($directory, $field) {

		$field_type_file = $this->config->adminDir."/core/fieldtypes/".$directory."/".$field.".json";

		if (file_exists($field_type_file)) {
			return array(
				'success' => true,
				'data' => json_decode(file_get_contents($field_type_file))
			);
		} else {
			return array(
				'success' => false,
				'data' => array()
			);
		}
	}
}
?>