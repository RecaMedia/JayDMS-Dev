<?php
class postsfunctions extends Controller {

	function __construct($config) {
		$this->config = $config;
	}

	public function GetList() {

    if (isset($_POST['posttype'])) {
      $posttype = $_POST['posttype'];
      $blueprint_dir = $this->config->contentDir."/data/";
			$posttype_dir = $blueprint_dir."/".$posttype;

      $refined_list = [];
      
      $list = scandir($posttype_dir);

      for($i = 0; $i < count($list); $i++) {
        $item = $list[$i];
        if ($item != "." && $item != "..") {
					$name_parts = explode(".", $item);
					$ext = array_pop($name_parts);
          $path = $posttype_dir."/".$item;
          if (!is_dir($path) && file_exists($path) && $ext == "json") {
            $name_parts = explode(".", $item);
            $slug = array_shift($name_parts);
    
            $refined_list[] = array(
              "path" => $path,
              "slug" => $slug,
            );
          }
        }
      }

      return array(
        'success' => true,
        'message' => $posttype." successfully loaded.",
        'list' => $refined_list
      );
    } else {
			return array(
				'success' => false,
				'message' => "Post Type not provided."
			);
		}
	}

	public function LoadPost() {

		if (isset($_POST['posttype']) && isset($_POST['slug'])) {
      $posttype = $_POST['posttype'];
      $slug = $_POST['slug'];
      $blueprint_dir = $this->config->contentDir."/data/";
			$posttype_dir = $blueprint_dir."/".$posttype;
			$path = $posttype_dir . '/' . $slug . '.json';
	
			if (file_exists($path)) {
				$data = json_decode(file_get_contents($path), true);

				return array(
					'success' => true,
					'message' => "Post retrieved.",
					'data' => $data
				);
			} else {
				return array(
					'success' => false,
					'message' => "Post not found.",
					'posttype' => null
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "Post Type or Slug not provided."
			);
		}
	}

	public function SavePost() {
		if (isset($_POST['posttype']) && isset($_POST['json'])) {
      $posttype = $_POST['posttype'];
			$blueprint_dir = $this->config->contentDir."/data/";
			$posttype_dir = $blueprint_dir."/".$posttype;
			$cache_dir = $this->config->cacheDir."/".$posttype;

			if (!is_dir($posttype_dir)) {
				mkdir($posttype_dir);
			}

			$json = json_decode($_POST['json']);

			$file_name = $json->slug;
			$path = $posttype_dir . '/' . $file_name . '.json';
			$cache_path = $cache_dir . '/' . $file_name . '.html';

			$file = fopen($path, "w+");
			fwrite($file, json_encode($json));
			fclose($file);

			if (file_exists($path)) {
				// Delete cached file if exist
				if (file_exists($cache_path)) {
					unlink($cache_path);
				}
				return array(
					'success' => true,
					'message' => "Post successfully saved."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Post failed save."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "Post Type or JSON not provided."
			);
		}
	}

	public function DeletePost() {
		if (isset($_POST['posttype']) && isset($_POST['slug'])) {
			$posttype = $_POST['posttype'];
      $blueprint_dir = $this->config->contentDir."/data/";
			$posttype_dir = $blueprint_dir."/".$posttype;
			$slug = $_POST['slug'];
			$path = $posttype_dir . '/' . $slug . '.json';

			if (unlink($path)) {
				return array(
					'success' => true,
					'message' => "Post successfully deleted."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Post failed deletion."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "Post Type or Slug not provided."
			);
		}
	}
}
?>