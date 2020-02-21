<?php
class generalfunctions extends Controller {

	function __construct($config, $session) {
		$this->config = $config;
		$this->session = $session;
	}

	private function generalDataLoad($type = null) {
		if ($type != null) {
			$blueprint_dir = $this->config->contentDir."/data/core";
			$path = $blueprint_dir . '/' . $type . '.json';

			if (file_exists($path)) {
				$data = json_decode(file_get_contents($path), true);

				return array(
					'success' => true,
					'message' => ucfirst($type) . " retrieved.",
					$type => $data
				);
			} else {
				return array(
					'success' => false,
					'message' => ucfirst($type) . " not found.",
					$type => null
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "General function failed."
			);
		}
	}

	private function generalDataSave($type = null) {
		if ($type != null) {
			if (isset($_POST['json'])) {
				$blueprint_dir = $this->config->contentDir."/data/core";

				if (!is_dir($blueprint_dir)) {
					mkdir($blueprint_dir);
				}

				// Delete all cached files if globals are updated since this effects all pages
				if ($type == "globals") {
					require_once "filefunctions.php";
					$FileFunctions = new filefunctions($this->config, $this->session, $this->config->dmsDir);
					$FileFunctions->recurse_delete($this->config->cacheDir);
				}

				$path = $blueprint_dir . '/' . $type . '.json';
				$json = json_decode($_POST['json']);

				$file = fopen($path, "w+");
				fwrite($file, json_encode($json));
				fclose($file);

				if (file_exists($path)) {
					return array(
						'success' => true,
						'message' => ucfirst($type) . " successfully saved.",
						$type => $json
					);
				} else {
					return array(
						'success' => false,
						'message' => ucfirst($type) . " failed save.",
						$type => null
					);
				}
			} else {
				return array(
					'success' => false,
					'message' => "JSON not provided."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "General function failed."
			);
		}
	}

	// Same function as in admin/core/builder/factory.php
	private function processMenu($tree, $classes = false) {

    $menu = '<ul class="'.$classes["classWrapper"].'">';
    foreach ($tree as $item) {
      // Prepare classes to be passed on to function
      $subClasses = array(
        "classWrapper" => (isset($item->classWrapper) ? $item->classWrapper : ""),
        "classItem" => (isset($item->classItem) ? $item->classItem : ""),
        "classLink" => (isset($item->classLink) ? $item->classLink : "")
      );
      // Build menu item
      $menu .= '<li class="'.$classes["classItem"].'">';
      $menu .= '<a target="'.$item->target.'" href="'.$item->src.'" class="'.$classes["classLink"].'">'.$item->subtitle.'</a>';
      $menu .= ($item->children != null && count($item->children) ? $this->processMenu($item->children, $subClasses) : "");
      $menu .= '</li>';
    }
    $menu .= '</ul>';

    return $menu;
	}

	// Same function as in admin/core/builder/factory.php
	private function getMenus() {

		$menus = [];
		$css = "";
		$js = "";
		
		$menus_path = $this->config->dmsDir . "/content/data/core/menus.json";

		if (file_exists($menus_path)) {
			$data = json_decode(file_get_contents($menus_path));
			foreach($data as $menu_name => $menu_data) {
				if ($menu_data->publish) {
					// Prepare classes to be passed on to function
					$classes = array(
						"classWrapper" => (isset($menu_data->classWrapper) ? $menu_data->classWrapper : ""),
						"classItem" => (isset($menu_data->classItem) ? $menu_data->classItem : ""),
						"classLink" => (isset($menu_data->classLink) ? $menu_data->classLink : "")
					);
					// Build menu html
					$menus[$menu_name] = $this->processMenu($menu_data->treeData, $classes);
					// Attach menu CSS & JS
					$css .= $menu_data->frontend[$menu_data->frontendIndex]->css;
					$js .= $menu_data->frontend[$menu_data->frontendIndex]->js;
				}
			}
		}
		
		return array(
			"menus" => $menus,
			"css" => $css,
			"js" => $js
		);
  }
	
	// Same function as in admin/core/builder/factory.php
	private function getStashes() {

		$stashes = [];

		$stashes_dir = $this->config->dmsDir . "/content/data/stashes";

		if (is_dir($stashes_dir)) {
			$list = scandir($stashes_dir);

			for($i = 0; $i < count($list); $i++) {
				$item = $list[$i];
				if ($item != "." && $item != "..") {
					$path = $stashes_dir."/".$item;
					if (is_dir($path)) {
						$dir_list = $this->getStashes($path);
						array_merge($stashes, $dir_list);
					} else if (file_exists($path)) {
						$data = json_decode(file_get_contents($path), true);
						$stashes[$data["slug"]] = $data["json"]["data"];
					}
				}
			}
		}
		
		return $stashes;
  }

	public function ProcessPreview() {

		function index_replacement($string_data, $index) {
			return (string) preg_replace("/\[(JDMS_index)\]/i", $index, $string_data);
		}

		function field_string_replacement($string_data) {
			return (string) preg_replace("/\[(JDMS_field\.(.*?))\]/i", " componentField.$2 | raw ", $string_data);
		}

		// Add function if older PHP
		if (!function_exists('array_key_first')) {
			function array_key_first(array $arr) {
				foreach($arr as $key => $unused) {
						return $key;
				}
				return NULL;
			}
		}

		if (isset($_POST['componentPackage'])) {

			// Get package data
			$package = json_decode($_POST['componentPackage']);

			// Make sure frontend and json is not null
			if ($package->frontend != null) {

				// Get all menus
				$all_menus = $this->getMenus();

				// Store all values for twig
				$values = array(
					"menus" => $all_menus["menus"],
					"stashes" => $this->getStashes()
				);

				// Get all SCSS
				$all_scss = index_replacement($package->frontend->css, "1") . $all_menus["css"];

				// Get all JS
				$all_js = index_replacement($package->frontend->js, "1") . $all_menus["js"];
				
				// Specific to component previews
				if ($package->json != null) {

					// Create values for twig template
					$component_field = [];

					// Value types to provide sample values
					$value_types = array(
						"boolean" => true,
						"integer" => 2,
						"double" => 2.22,
						"string" => "Sample",
						"array" => "Sample Array Here",
						"object" => "Sample Object Here",
						"NULL" => null
					);

					// Loop through component fields to create sample values
					for($i = 0; $i < count($package->json->fields); $i++) {
						// Get field data
						$field = $package->json->fields[$i];
						// Create sample values for each key
						$field_values = array();
						foreach($field->form as $key => $data) {
							$field_values[$key] = $value_types[gettype($data->value)];
						}
						// Check for multiple sub keys
						if (count($field_values) > 1) {
							// If more than one found, keep all sub values
							$component_field[$field->title] = $field_values;
						} else {
							// Else, if only one, make the single sub value the actual value of the field
							$component_field[$field->title] = $field_values[array_key_first($field_values)];
						}
					}

					// Get all SCSS = Global SCSS + Component SCSS
					$all_scss .= $package->json->frontend[$package->json->frontendIndex]->css->code;

					// Get all JS = Global JS + Component JS
					$all_js .= $package->json->frontend[$package->json->frontendIndex]->js->code;

					// Get component html
					$pre_html = $package->json->frontend[$package->json->frontendIndex]->html;

					// Add component sample values
					$values["componentField"] = $component_field;

				// Specific to menu previews
				} else if ($package->menu != null) {

					// Get all SCSS = Global SCSS + menu SCSS
					$all_scss .= $package->menu->frontend[$package->menu->frontendIndex]->css;

					// Get all JS = Global JS + menu JS
					$all_js .= $package->menu->frontend[$package->menu->frontendIndex]->js;

					// Prepare classes to be passed on to function
					$classes = array(
						"classWrapper" => (isset($package->menu->classWrapper) ? $package->menu->classWrapper : ""),
						"classItem" => (isset($package->menu->classItem) ? $package->menu->classItem : ""),
						"classLink" => (isset($package->menu->classLink) ? $package->menu->classLink : "")
					);

					// Get menu html
					$pre_html = $this->processMenu($package->menu->treeData, $classes);
				}

				// Require Twig template engine & SCSS processor
				require_once $this->config->adminDir . '/core/builder/vendor/autoload.php';

				// Config Twig template engine
				$loader = new \Twig\Loader\ArrayLoader([]);
				$twig = new \Twig\Environment($loader);

				// Process SCSS twig template
				$scss_template = $twig->createTemplate(field_string_replacement($all_scss));
				$scss_finalized = $scss_template->render($values);

				// Process SCSS
				$scss = new scssc();
				$preview_css = $scss->compile($scss_finalized);

				// Process JS twig template
				$js_template = $twig->createTemplate(field_string_replacement($all_js));
				$preview_js = $js_template->render($values);

				// Remove comments from CSS and JS
				$pattern = '/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:(?<!\:|\\\|\'|\")\/\/.*))/';
				$preview_css = preg_replace($pattern, '', $preview_css);
				$preview_js = preg_replace($pattern, '', $preview_js);

				// Minify CSS and JS
				$minifier_css = new MatthiasMullie\Minify\JS();
				$minifier_js = new MatthiasMullie\Minify\JS();
				$minifier_css->add($preview_css);
				$minifier_js->add($preview_js);
				$preview_css = $minifier_css->minify();
				$preview_js = $minifier_js->minify();
				
				// Process HTML twig template
				$preview_template = $twig->createTemplate(field_string_replacement($pre_html));
				$preview_html = $preview_template->render($values);
				
				// Finalized HTML
				$html = '<!doctype html><html><head>'.$package->frontend->head->top.'<meta charset="UTF-8" /><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/><meta http-equiv="cache-control" content="no-cache" /><meta http-equiv="pragma" content="no-cache" /><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/><title>JayDMS Preview Room</title><meta name="description" content="This html file is specifically to preview your component." /><meta name="robot" content="noindex, nofollow" /><script type="text/JavaScript" src="/jdms/admin/core/builder/utilities/document-ready.js"></script><style>'.$preview_css.'</style><script>documentReady(function() {'.$preview_js.'});</script>'.$package->frontend->head->bottom.'</head><body>'.$package->frontend->body->top.''.$preview_html.''.$package->frontend->body->bottom.'</body></html>';

				// Remove line breaks and white space
				$html = preg_replace('/[\s]+/mu', ' ', preg_replace( "/\n/", "", $html)); 

				// Get preview directory
				$preview_dir = $this->config->adminDir . '/preview-room';

				// Create directory if it does not exist
				if (!is_dir($preview_dir)) {
					mkdir($preview_dir);
				}

				// Set preview index path and remove previously created index file.
				$preview_file = $preview_dir . '/index.html';
				if (file_exists($preview_file)) {
					unlink($preview_file);
				}

				// Create file
				$file = fopen($preview_file, "w+");
				fwrite($file, $html);
				fclose($file);

				// Return true if file was created
				if (file_exists($preview_file)) {
					return array(
						'success' => true,
						'message' => "Preview successfully created."
					);
				} else {
					return array(
						'success' => false,
						'message' => "Preview was not created."
					);
				}
			} else {
				return array(
					'success' => false,
					'message' => "Frontend not provided."
				);
			}
		} else {
			return array(
				'success' => false,
				'message' => "Package not provided."
			);
		}
	}

	public function DeletePreview() {

		$preview_file = $this->config->adminDir . '/preview-room/index.html';

		if (file_exists($preview_file)) {
			if (unlink($preview_file)) {
				return array(
					'success' => true,
					'message' => "Preview deleted."
				);
			} else {
				return array(
					'success' => false,
					'message' => "Preview failed deletion."
				);
			}
		} else {
			return array(
				'success' => true,
				'message' => "Preview already deleted."
			);
		}
	}

	public function LoadGlobalFrontend() {
		return $this->generalDataLoad("frontend");
	}

	public function SaveGlobalFrontend() {
		return $this->generalDataSave("frontend");
	}

	public function LoadMenus() {
		return $this->generalDataLoad("menus");
	}

	public function SaveMenus() {
		return $this->generalDataSave("menus");
	}

	public function LoadGlobals() {
		return $this->generalDataLoad("globals");
	}

	public function SaveGlobals() {
		return $this->generalDataSave("globals");
	}
}
?>