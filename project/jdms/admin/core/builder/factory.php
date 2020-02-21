<?php

class Factory {

  public $post;

  function __construct($page_obj = null, $dynamic_frontend = false, $frontend = null, $parent_prefix = null, $CSS_JS_containers = null) {

    $this->session = null;

    // Default post
    $this->post = (object) array(
      "head" => [],
      "values" => array(
        "blank" => "" // This value is used for any JDMS_field prints that weren't matched
      ),
      "container" => [], // CSS & JS that should not be duplicated, eventually gets merged
      "css" => "",
      "js" => "",
      "html" => ""
    );
    
    // Only on initial call, sub-calls $page_obj will not be null
    if ($page_obj == null) {
      // Check for sessions
      require dirname(__DIR__) . DIRECTORY_SEPARATOR . "controller/session.php";
      $this->session = Session::getInstance();
      // Set header and footer values from global
      $this->post->values["header"] = HeaderData;
      $this->post->values["footer"] = FooterData;
      // Get Menu and Stash data
      $this->getMenus();
      $this->getStashes();
    }

    // Initialize instance
    $this->init($page_obj, $dynamic_frontend, $frontend, $parent_prefix, $CSS_JS_containers);
  }

  private function processMenu($tree, $classes = false) {

    $menu = '<ul class="'.$classes["classWrapper"].'">';
    foreach ($tree as $item) {
      // Prepare classes to be passed on to function
      $subClasses = array(
        "classWrapper" => (isset($item["classWrapper"]) ? $item["classWrapper"] : ""),
        "classItem" => (isset($item["classItem"]) ? $item["classItem"] : ""),
        "classLink" => (isset($item["classLink"]) ? $item["classLink"] : "")
      );
      // Build menu item
      $menu .= '<li class="'.$classes["classItem"].'">';
      $menu .= '<a target="'.$item["target"].'" href="'.$item["src"].'" class="'.$classes["classLink"].'">'.$item["subtitle"].'</a>';
      $menu .= ($item["children"] != null && count($item["children"]) ? $this->processMenu($item["children"], $subClasses) : "");
      $menu .= '</li>';
    }
    $menu .= '</ul>';

    return $menu;
  }

  private function getMenus() {

    // We want to make sure we run this once
    if (!isset($this->post->values["menus"])) {
      $refined_list = [];
      
      $menus_path = DataDir . "core/menus.json";

      if (file_exists($menus_path)) {
        $data = json_decode(file_get_contents($menus_path), true);
        foreach($data as $menu_name => $menu_data) {
          if ($menu_data["publish"]) {
            // Prepare classes to be passed on to function
            $classes = array(
              "classWrapper" => (isset($menu_data["classWrapper"]) ? $menu_data["classWrapper"] : ""),
              "classItem" => (isset($menu_data["classItem"]) ? $menu_data["classItem"] : ""),
              "classLink" => (isset($menu_data["classLink"]) ? $menu_data["classLink"] : "")
            );
            // Build menu html
            $refined_list[$menu_name] = $this->processMenu($menu_data["treeData"], $classes);
            // Attach menu CSS & JS
            $this->post->css .= $menu_data["frontend"][$menu_data["frontendIndex"]]["css"];
            $this->post->js .= $menu_data["frontend"][$menu_data["frontendIndex"]]["js"];
          }
        }
        $this->post->values["menus"] = $refined_list;
      }
    }
  }

  private function getStashes() {

    // We want to make sure we run this once
    if (!isset($this->post->values["stashes"])) {
      $refined_list = [];

      $stashes_dir = DataDir . "stashes";

      if (is_dir($stashes_dir)) {
        $list = scandir($stashes_dir);

        for($i = 0; $i < count($list); $i++) {
          $item = $list[$i];
          if ($item != "." && $item != "..") {
            $path = $stashes_dir."/".$item;
            if (is_dir($path)) {
              $dir_list = $this->getStashes($path);
              array_merge($refined_list, $dir_list);
            } else if (file_exists($path)) {
              $data = json_decode(file_get_contents($path), true);
              $refined_list[$data["slug"]] = $data["json"]["data"];
            }
          }
        }
      }
      
      $this->post->values["stashes"] = $refined_list;
    }
  }

  private function index_replacement($string_data, $index) {
    return (string) preg_replace("/\[(JDMS_index)\]/i", $index, $string_data);
  }

  private function field_string_replacement($string_data, $component_prefix, $looking_for_field, $subcomponent_html) {
    
    // Look for all matches containing the componentField tag
    preg_match_all('/\[(JDMS_field(.*?))\]/i', $string_data, $field_matches);
    // Loop throught all matches and replace
    foreach($field_matches[2] as $index => $field_name) {
      // Clean period from "componentField." <-- "."
      $cleaned_field_name_path = substr($field_name, 1);
      // Strip any child paths
      $cleaned_field_name = explode(".", $cleaned_field_name_path);
      // Check if field name matches what we're looking for
      if ($cleaned_field_name[0] == $looking_for_field) {
        // Determine if subcomponent or not
        if (!$subcomponent_html) {
          // If not subcomponent, proceed with twig print
          // Look for string and array prints
          $string_data = preg_replace("/\{\{[ ]\[(JDMS_field\.$cleaned_field_name_path)\][ ]\}\}/i", "{{ ".$component_prefix.$field_name." | raw }}", $string_data);
          return preg_replace("/\{\%(.*)\[JDMS_field\.$cleaned_field_name_path\](.*)\%\}/i", "{%$1".$component_prefix.$field_name."$2%}", $string_data);
        } else {
          // Else, replace with entire HTML from subcomponent
          return preg_replace("/\{\{[ ]\[(JDMS_field\.$cleaned_field_name_path)\][ ]\}\}/i", $subcomponent_html, $string_data);
        }
      }
    }
    // Return string if not happened
    return $string_data;
  }

  // Replaces all {{ index }} tags
  private function process_index($frontend, $component_index) {
    $frontend->css->code = $this->index_replacement($frontend->css->code, $component_index);
    $frontend->js->code = $this->index_replacement($frontend->js->code, $component_index);
    $frontend->html = $this->index_replacement($frontend->html, $component_index);
    return $frontend;
  }
  
  private function process_front_end($dynamic_frontend, $frontend, $page, $component_type, $prefix, $field, $subcomponent_html) {
    $processed_frontend = (object) array(
      "js" => (object) array("standalone" => $frontend->js->standalone, "code" => $frontend->js->code),
      "css" => (object) array("standalone" => $frontend->css->standalone, "code" => $frontend->css->code),
      "html" => ""
    );
    // Get all frontend items from component data
    $processed_frontend->css->code = $this->field_string_replacement($frontend->css->code, $prefix, $field, $subcomponent_html);
    $processed_frontend->js->code = $this->field_string_replacement($frontend->js->code, $prefix, $field, $subcomponent_html);
    $processed_frontend->html = $this->field_string_replacement($frontend->html, $prefix, $field, $subcomponent_html);
    // Return front end
    return $processed_frontend;
  }

  private function init($page_obj, $dynamic_frontend, $frontend, $parent_prefix, $CSS_JS_containers) {

    // Default front end
    if ($CSS_JS_containers == null) {
      $CSS_JS_containers = array("css" => [], "js" => []);
    }
    $pre_frontend = (object) array(
      "js" => new stdClass,
      "css" => new stdClass,
      "html" => ""
    );
    $final_frontend = (object) array(
      "js" => "",
      "css" => "",
      "html" => ""
    );

    if ($page_obj == null) {
      // Set sub component flag
      $is_subcomponent = false;
      // Get page content from blueprint json
      $blueprint = json_decode(file_get_contents(DataFile), true);
      // Set dynamic front end flag
      $dynamic_frontend = $blueprint["dyComp"];
      define("DynamicFrontEnd", $dynamic_frontend);
      define("Published", $blueprint["publish"]);
      // Set page json object
      $page = $blueprint["json"];
    } else {
      // Set sub component flag
      $is_subcomponent = true;
      // Set page json object
      $page = $page_obj;
    }

    // Cache page data
    $page_data = $page["data"];

    if (Published || isset($this->session->usertoken)) {

      // Loop through component order
      for ($index = 0; $index < count($page["order"]); $index++) {

        // Get component key
        $component_type = $page["order"][$index];
        
        // Only proceed if data exist for component
        if ($page_data[$component_type] != null && array_key_exists($index, $page_data[$component_type])) {
          // Get component fields
          $component_fields = $page_data[$component_type][$index];
          // Component prefix is a unique ID for locating correct values
          $component_prefix = $component_type."_".$index;

          // Use static frontend stored in page json data as default/fallback, unless dynamic is requested
          $pre_frontend->css = (object) $page["frontend"][$component_type][$index]["css"];
          $pre_frontend->js = (object) $page["frontend"][$component_type][$index]["js"];
          $pre_frontend->html = $page["frontend"][$component_type][$index]["html"];

          // Determine which front end to use
          if ($dynamic_frontend) {
            // Get component file
            $component_file = PackagesDir . "default/components/" . $component_type . ".json";
            // If file exist, proceed
            if (file_exists($component_file)) {
              // Get necessary component data as an object
              $component_data = json_decode(file_get_contents($component_file));
              // Get frontendIndex to know which version of the frontend to use
              $frontendIndex = $page["frontend"][$component_type][$index]["frontendIndex"];
              // Get all frontend items from component data
              $pre_frontend->css = (object) $component_data->frontend[$frontendIndex]->css;
              $pre_frontend->js = (object) $component_data->frontend[$frontendIndex]->js;
              $pre_frontend->html = $component_data->frontend[$frontendIndex]->html;
            }
          }

          // Object path prefix for HTML renders
          $final_prefix = ($parent_prefix != null ? $parent_prefix."." : "").$component_prefix;

          // Replace all "components" fieldtype names with double underscore. Ex: .my_field. => __my_field__
          // Since we're not create children objects
          $pre_frontend = $this->process_index($pre_frontend, str_replace(".","__", $final_prefix));

          // Loop through all fields
          foreach($component_fields as $field => $value) {

            // Default value
            $confirmed_subcomponent = false;

            // Check if value is array
            if (is_array($value)) {
              // Check if fields contain sub-component data
              if (array_key_exists("order", $value) && array_key_exists("data", $value) && array_key_exists("frontend", $value)) {
                $confirmed_subcomponent = true;
              }
            }

            if ($confirmed_subcomponent) {
              /************/
              // Because this is a sub component object, we need to handle this as a new build within the field values
              /************/
              // Clone front end object
              $sub_frontend = clone $pre_frontend;
              // Create prefix for subcomponent
              $subcomponent_prefix = $final_prefix.".".$field;
              // Send through builder to process build data
              $sub_builder = new Factory($value, $dynamic_frontend, $sub_frontend, $subcomponent_prefix, $CSS_JS_containers);
              // Merge CSS & JS container information to parent container
              $CSS_JS_containers = array_merge($sub_builder->post->container, $CSS_JS_containers);
              // Merge CSS & JS front-end data
              $pre_frontend->css->code = $pre_frontend->css->code . $sub_builder->post->css;
              $pre_frontend->js->code = $pre_frontend->js->code . $sub_builder->post->js;
              // Since we're looping through component fields, the HTML needs to be kept, to be rewritten over and over until all fields are replaced
              $pre_frontend->html = $this->field_string_replacement($pre_frontend->html, $subcomponent_prefix, $field, $sub_builder->post->html);
              // Set data values
              $this->post->values[$component_prefix][$field] = $sub_builder->post->values;
              /************/
            } else {
              // Process front end
              $pre_frontend = $this->process_front_end($dynamic_frontend, $pre_frontend, $page, $component_type, $final_prefix, $field, false);
              // Set data values
              $this->post->values[$component_prefix][$field] = $value;
            }
          }

          // Finalize code
          $final_frontend->css = $pre_frontend->css->code;
          $final_frontend->js = $pre_frontend->js->code;
          $final_frontend->html = $pre_frontend->html;

          // Set builder front-end data
          if ($pre_frontend->css->standalone) {
            // If CSS is standalone then add
            $this->post->css .= $final_frontend->css;
          } else {
            // Else add to container where it will be added once after the loop
            $CSS_JS_containers["css"][$component_type] = $final_frontend->css;
          }

          if ($pre_frontend->js->standalone) {
            // If JS is standalone then add
            $this->post->js .= $final_frontend->js;
          } else {
            // Else add to container where it will be added once after the loop
            $CSS_JS_containers["js"][$component_type] = $final_frontend->js;
          }

          // Continue to add html in sequential order
          $this->post->html .= $final_frontend->html;
        }
      }

      // Return CSS & JS container to public post variable
      $this->post->container = $CSS_JS_containers;

      // Only run these commands once
      // The parent will never have $is_subcomponent as true
      if (!$is_subcomponent) {
        // Do final sweep to remove unmatched JDMS_field prints and replace with blank
        $center_HTML = (string) preg_replace("/\[(JDMS_field\.(.*))\]/i", "blank", $this->post->html);
        // Wrap html with header and footer
        $this->post->html = HeaderHTML . $center_HTML . FooterHTML;
      }

      // Merge CSS and JS that were not standalone
      foreach($CSS_JS_containers["css"] as $component => $css) {
        $this->post->css .= $css;
      }
      foreach($CSS_JS_containers["js"] as $component => $js) {
        $this->post->js .= $js;
      }

      // Remove comments from CSS and JS
      $pattern = '/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:(?<!\:|\\\|\'|\")\/\/.*))/';
      $this->post->css = preg_replace($pattern, '', $this->post->css);
      $this->post->js = preg_replace($pattern, '', $this->post->js);

      if (!empty($blueprint)) {
        $this->post->head[] = "<title>".$blueprint["title"]."</title>";
        $this->post->head[] = "<meta name=\"keywords\" content=\"".implode(", ", $blueprint["tags"])."\" />";
        $this->post->head[] = "<meta name=\"description\" content=\"".$blueprint["description"]."\" />";
        $this->post->head[] = "<meta name=\"robot\" content=\"".($blueprint["index"] ? "index" : "noindex").", ".($blueprint["follow"] ? "follow" : "nofollow")."\" />";
        $this->post->head[] = "<meta name=\"author\" content=\"\" />";
        $this->post->head[] = "<meta property=\"og:title\" content=\"".$blueprint["title"]."\" />";
        $this->post->head[] = "<meta property=\"og:description\" content=\"".$blueprint["description"]."\" />";
      }
    } else {
      echo "Page is not published.";
    }
  }
}

function cache_file($print) {
  global $URLPath;
  // Make sure cache dir exist
  if (!is_dir(CacheDir)) {
    mkdir(CacheDir);
  }
  // Use provided data to create path to cache post type directory
  $path_parts = explode("/", $URLPath);
  $post_type = $path_parts[0];
  $post_type_dir = CacheDir . $post_type;
  // Check if dir exist, if not create
  if (!is_dir($post_type_dir)) {
    mkdir($post_type_dir);
  }
  // Cache file at location
  $file = fopen(CacheFile, "w+");
  fwrite($file, $print);
  fclose($file);
}

function finalize_template($global, $build) {

  $page = $build->post;

  function copyYear() {
    if (isset($global->meta['year']) && $global->meta['year'] != "") {
      return $global->meta['year'] != date('Y') ? $global->meta['year'].' - ' . date('Y') : $global->meta['year'];
    } else {
      return date('Y');
    }
  }

  function siteURL() {
    return sprintf(
      "%s://%s%s",
      isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https' : 'http',
      $_SERVER['SERVER_NAME'],
      $_SERVER['REQUEST_URI']
    );
  }

  // Default head from factory instance
  $built_head = "";
  
  // Check if head items exist, else fall back to defaults in global settings
  if (count($page->head)) {
    foreach ($page->head as $item) {
      $built_head .= $item."\n";
    }
  } else {
      $built_head .= "<title>".$global->meta['title']."</title>";
      $built_head .= "<meta name=\"description\" content=\"".$global->meta['description']."\" />";
      $built_head .= "<meta name=\"robot\" content=\"index, follow\" />";
      $built_head .= "<meta property=\"og:title\" content=\"".$global->meta['title']."\" />";
      $built_head .= "<meta property=\"og:description\" content=\"".$global->meta['description']."\" />";
  }

  $minifier_css = new MatthiasMullie\Minify\JS();
  $minifier_js = new MatthiasMullie\Minify\JS();
  $minifier_css->add($page->css);
  $minifier_js->add($page->js);
  $page->css = $minifier_css->minify();
  $page->js = $minifier_js->minify();
  
  // Print page
  return '
    <!doctype html>
    <html>
      <head>
        '.$global->head_top.'
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
        <meta http-equiv="cache-control" content="no-cache" />
        <meta http-equiv="pragma" content="no-cache" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
        '.$built_head.'
        <meta name="copyright" content="&copy; '.copyYear().' '.$global->meta['title'].'" />
        <meta property="og:type" content="'.$global->meta['type'].'"/>
        <meta property="og:url" content="'.siteURL().'"/>
        <meta property="og:image" content="'.$global->meta['image'].'"/>
        <meta property="og:site_name" content="'.$global->meta['title'].'"/>
        <script type="text/JavaScript" src="/jdms/admin/core/builder/utilities/document-ready.js"></script>
        <style>
          '.$page->css.'
        </style>
        <script>
          documentReady(function() {
            '.$page->js.'
          });
        </script>
        '.$global->head_bottom.'
      </head>
      <body>
        '.(!Published && isset($build->session->usertoken) ? '<div class="ui-admin-bar">In Preview Mode</div>' : '').'
        '.$global->body_top.'
        '.$page->html.'
        '.$global->body_bottom.'
      </body>
    </html>
  ';
}
?>