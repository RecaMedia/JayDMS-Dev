<?php
class posttypesfunctions extends Controller {

	function __construct($config) {
		$this->config = $config;
	}

	private function recurse_copy($src, $dst) {
    $dir = opendir($src);
    $result = ($dir === false ? false : true);
    if ($result !== false) {
      $result = @mkdir($dst);
      if ($result === true) {
        while(false !== ( $file = readdir($dir)) ) {
          if (( $file != '.' ) && ( $file != '..' ) && $result) {
            if ( is_dir($src . DIRECTORY_SEPARATOR . $file) ) {
              $result = $this->recurse_copy($src . DIRECTORY_SEPARATOR . $file,$dst . DIRECTORY_SEPARATOR . $file);
            } else { 
              $result = copy($src . DIRECTORY_SEPARATOR . $file,$dst . DIRECTORY_SEPARATOR . $file);
            }
          }
        }
        closedir($dir);
      }
    }
    return $result;
  }

  private function recurse_delete($path) {
    if (is_dir($path) === true) {
      $files = array_diff(scandir($path), array('.', '..'));
      foreach ($files as $file) {
        $this->recurse_delete(realpath($path) . DIRECTORY_SEPARATOR . $file);
      }
      return rmdir($path);
    } else if (is_file($path) === true) {
      return unlink($path);
    }
    return false;
  }

	public function GetList() {

		$refined_list = [];

		$posttypes_dir = $this->config->dmsDir."/packages/default/posttypes";

		if (is_dir($posttypes_dir)) {
			$list = scandir($posttypes_dir);

			for($i = 0; $i < count($list); $i++) {
				$item = $list[$i];
				if ($item != "." && $item != "..") {
					$path = $posttypes_dir."/".$item;
					if (is_dir($path)) {
						$dir_list = $this->readFiles($path);
						array_merge($this->refined_list, $dir_list);
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
				'message' => "Post Types successful.",
				'list' => $refined_list
			);
		} else {
			return array(
				'success' => false,
				'message' => "No Post Types were found.",
				'list' => []
			);
		}
	}

	public function LoadPostType() {

		if (isset($_POST['slug'])) {
			$posttype_dir = $this->config->dmsDir."/packages/default/posttypes";
			$slug = $_POST['slug'];
			$path = $posttype_dir . '/' . $slug . '.json';
	
			if (file_exists($path)) {
				$posttype = json_decode(file_get_contents($path));

				return array(
					'success' => true,
					'message' => "Post Type retrieved.",
					'posttype' => $posttype
				);
			} else {
				return array(
					'success' => false,
					'message' => "Post Type not found.",
					'posttype' => null
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "Slug not provided."
			);
		}
	}

	public function SavePostType() {
		if (isset($_POST['json'])) {
			$posttype_dir = $this->config->dmsDir."/packages/default/posttypes";
			$blueprint_dir = $this->config->contentDir."/data/";

			if (!is_dir($posttype_dir)) {
				mkdir($posttype_dir);
			}

			$json = json_decode($_POST['json']);

			// Default file
			$posttype_slug = $json->slug;
			$posttype_file = $posttype_dir . '/' . $posttype_slug . '.json';

			// Default directory paths
			$posttype_data_dir = $blueprint_dir . '/' . $posttype_slug;
			$cache_dir = $this->config->cacheDir . "/" . $posttype_slug;

			$rename_msg = "";
			
			// Check if a rename is involved, 
			if (isset($_POST['renameFrom']) && $_POST['renameFrom'] != $posttype_slug) {

				// Set paths from previous location
				$old_posttype_slug = $_POST['renameFrom'];
				$old_posttype_file = $posttype_dir . '/' . $old_posttype_slug . '.json';
				$old_posttype_data_dir = $blueprint_dir . "/" . $old_posttype_slug;
				$old_cache_dir = $this->config->cacheDir . "/" . $old_posttype_slug;

				// Move previous directory if exist
				if (is_dir($old_posttype_data_dir)){
					// We need to transfer files to new location
					if (!$this->recurse_copy($old_posttype_data_dir, $posttype_data_dir)) {
						$rename_msg .= " Moving files have failed.";
					}
					// Delete old location
					if (!$this->recurse_delete($old_posttype_data_dir)){
						$rename_msg .= " Removing previous directory has failed.";
					}
				}

				// Move previous directory if exist
				if (is_dir($old_cache_dir)){
					// We need to transfer files to new location
					if (!$this->recurse_copy($old_cache_dir, $cache_dir)) {
						$rename_msg .= " Moving cache files have failed.";
					}
					// Delete old location
					if (!$this->recurse_delete($old_cache_dir)){
						$rename_msg .= " Removing previous cache directory has failed.";
					}
				}

				unlink($old_posttype_file);
			} else {
				// Check if directories exist prior to making
				if (!is_dir($posttype_data_dir)){
					mkdir($posttype_data_dir, 0775, true);
				}
				if (!is_dir($cache_dir)){
					mkdir($cache_dir, 0775, true);
				}
			}

			$file = fopen($posttype_file, "w");
			fwrite($file, json_encode($json));
			fclose($file);

			if (file_exists($posttype_file)) {
				return array(
					'success' => true,
					'message' => "Post Type successfully saved." . $rename_msg
				);
			} else {
				return array(
					'success' => false,
					'message' => "Post Type failed save." . $rename_msg
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "JSON not provided."
			);
		}
	}

	public function DeletePostType() {
		if (isset($_POST['slug'])) {
			$posttype_dir = $this->config->dmsDir."/packages/default/posttypes";
			$blueprint_dir = $this->config->contentDir."/data/";

			$slug = $_POST['slug'];
			$path = $posttype_dir . '/' . $slug . '.json';
			$dir_path = $blueprint_dir . '/' . $slug;

			if (unlink($path)) {

				if (is_dir($dir_path)){
					$this->recurse_delete($dir_path);
				}

				return array(
					'success' => true,
					'message' => "Post Type successfully deleted."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Post Type failed deletion."
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