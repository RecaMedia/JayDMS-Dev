<?php
/****************************************************/
// Initial Variables and Checks
/****************************************************/

// Default const paths
define("AdminDir", dirname(dirname(__DIR__)));
define("PackagesDir", dirname(dirname(dirname(__DIR__))) . "/packages/");
define("ContentDir", dirname(dirname(dirname(__DIR__))) . "/content/");
define("CacheDir", dirname(dirname(dirname(__DIR__))) . "/cache/");
define("DataDir", ContentDir . "data/");

// Use URL path passed by htaccess file
$URLPath = (isset($_GET['path']) ? $_GET['path'] : "");

// Reserved words
$blocked_paths = ['stashes','stash','forms','form','core'];

// Default global vars, used later when building page
$global_frontend = (object) array(
  "head_top" => "",
  "meta" => null,
  "head_bottom" => "",
  "body_top" => "",
  "body_bottom" => ""
);

// Require Twig template engine
require_once 'vendor/autoload.php';
// Config Twig template engine
$loader = new \Twig\Loader\ArrayLoader([]);
$twig = new \Twig\Environment($loader);
// Allows to add extensions
$twig->addExtension(new \Twig\Extension\StringLoaderExtension());

// Reserved word check
$reserved_word_found = false;
foreach($blocked_paths as $reserved_word) {
  // Check if path begins with stashes, which is forbidden
  preg_match('/^'.$reserved_word.'\//', $URLPath, $word_found);
  if (!empty($word_found)) {
    $reserved_word_found = true;
  }
}

/****************************************************/
// Process Global Settings
/****************************************************/

// Check if global items exist
$global_file = DataDir . "core/globals.json";

// File exist then proceed
if (file_exists($global_file)) {

  function field_string_replacement($string_data, $path) {
    return (string) preg_replace("/\[(JDMS_field\.(.*?))\]/i", " ".$path.".$2 | raw ", $string_data);
  }

  // Defaults
  $global_css = "";
  $global_js = "";

  // Get global data
  $global_data = json_decode(file_get_contents($global_file), true);

  // Check if this is home
  if ($URLPath == "") {
    // If home, use default home page from global settings
    $URLPath = substr($global_data['general']['homePage'], 1); // Skipping the inital forward slash
  }

  // Set meta
  $global_frontend->meta = $global_data['meta'];

  // Get component files for Header and Footer
  $components_path = PackagesDir . "/default/components/";
  $header_component_file = (isset($global_data['header']['comp']['slug']) ? $components_path . $global_data['header']['comp']['slug'] . ".json" : false);
  $footer_component_file = (isset($global_data['footer']['comp']['slug']) ? $components_path . $global_data['footer']['comp']['slug'] . ".json" : false);

  // If file exist, proceed
  if (file_exists($header_component_file)) {
    // Get necessary component data as an object
    $header_component_data = json_decode(file_get_contents($header_component_file));
    // Get frontendIndex to know which version of the frontend to use
    $frontendIndex = $global_data['header']['comp']["frontendIndex"];
    // Get all frontend items from component data
    $global_css .= $header_component_data->frontend[$frontendIndex]->css->code;
    $global_js .= $header_component_data->frontend[$frontendIndex]->js->code;
    // Pass html and data for later use on Factory
    define("HeaderData", $global_data['header']['data']);
    define("HeaderHTML", field_string_replacement($header_component_data->frontend[$frontendIndex]->html, "header"));
  } else {
    echo "file does not exist";
    define("HeaderData", array());
    define("HeaderHTML", "");
  }

  // If file exist, proceed
  if (file_exists($footer_component_file)) {
    // Get necessary component data as an object
    $footer_component_data = json_decode(file_get_contents($footer_component_file));
    // Get frontendIndex to know which version of the frontend to use
    $frontendIndex = $global_data['footer']['comp']["frontendIndex"];
    // Get all frontend items from component data
    $global_css .= $footer_component_data->frontend[$frontendIndex]->css->code;
    $global_js .= $footer_component_data->frontend[$frontendIndex]->js->code;
    // Pass html and data for later use on Factory
    define("FooterData", $global_data['footer']['data']);
    define("FooterHTML", field_string_replacement($footer_component_data->frontend[$frontendIndex]->html, "footer"));
  } else {
    define("FooterData", array());
    define("FooterHTML", "");
  }
}

// Define const
define("DataFile", DataDir . $URLPath . ".json");
define("CacheFile", CacheDir . $URLPath . ".html");

/****************************************************/
// Process Build
/****************************************************/

// Set content type
header("Content-Type: text/html");

// Get Factory class
require_once 'factory.php';

// Add Extensions
$func_getPosts = new \Twig\TwigFunction('getPosts', function($posttype){
  require_once 'utilities/twig-getposts-ext.php';
  return getPosts($posttype);
});
$twig->addFunction($func_getPosts);

// Used cached file if exist or just build using Factory
if (file_exists(CacheFile) && !$reserved_word_found) {
  // print existing html file
  echo file_get_contents(CacheFile);

} else if (file_exists(DataFile) && !$reserved_word_found) {

  // Get JSON from requested post
  $content = json_decode(file_get_contents(DataFile));

  // Build post data
  $build = new Factory();

  // Merge header and footer CSS & JS with existing page CSS & JS
  $build->post->css = $global_css . $build->post->css;
  $build->post->js = $global_js . $build->post->js;

  // Check if frontend items exist
  $frontend_file = DataDir . "core/frontend.json";
  if (file_exists($frontend_file)) {
    $frontend_data = json_decode(file_get_contents($frontend_file), true);
    // Set frontend data
    $global_frontend->head_top = $frontend_data['head']['top'];
    $global_frontend->head_bottom = $frontend_data['head']['bottom'];
    $global_frontend->body_top = $frontend_data['body']['top'];
    $global_frontend->body_bottom = $frontend_data['body']['bottom'];
    // Merge global CSS & JS with existing page CSS & JS
    $build->post->css = $frontend_data['css'] . $build->post->css;
    $build->post->js = $frontend_data['js'] . $build->post->js;
  }

  // Process SCSS to CSS
  try {
    $scss_template = $twig->createTemplate($build->post->css);
    $scss_finalized = $scss_template->render($build->post->values);
    $scss = new scssc();
    $build->post->css = $scss->compile($scss_finalized);
  } catch (Exception $e) {
    $error_msg = addslashes($e->getMessage()."");
    echo '<script>console.error("JayDMS: Error processing SCSS.");</script>';
  }

  // Set Twig template from string
  $template = $twig->createTemplate(finalize_template($global_frontend, $build));
  // Get final HTML print
  $final_print = $template->render($build->post->values);

  // Check if file was suppose to be dynamic
  if (!DynamicFrontEnd) {
    // Remove line breaks and white space
    $final_print = preg_replace('/[\s]+/mu', ' ', preg_replace( "/\n/", "", $final_print)); 
    // If not, cache file
    cache_file($final_print);
  }
  // Render template with provided variables
  echo $final_print;
} else {
  // Fallback for DataFile file missing.
  echo "Page not found.";
}
?>