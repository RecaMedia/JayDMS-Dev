<?php
function getPosts($posttype) {

  // Access global data
  global $global_data;

  // Set default value
  $posttype_values = [];

  // Use data to scan and loop through posts according to post type
  $posttype_dir = DataDir . $posttype;

  if (is_dir($posttype_dir)) {

    // Scan this specific directory
    $posts = scandir($posttype_dir);

    // Remove "." && ".."
    for($i = 0; $i < count($posts); $i++) {
      if ($posts[$i] == "." || $posts[$i] == ".." || $posts[$i] == ".htaccess") {
        unset($posts[$i]);
      }
    }

    // Rebase
    $posts = array_values($posts);

    $page = (int)(isset($_GET['page']) && is_numeric($_GET['page']) ? $_GET['page'] : 1); // Fallback is 1
    $list_count = (int)(isset($global_data) ? $global_data['general']['posttypeListCount'] : 10); // Fallback is 10

    $start_index = ($page == 1 ? 0 : (($list_count * $page) - $list_count) - 1) ;
    $last_index = ($list_count * $page);

    $compare_to = ($last_index < count($posts) ? $last_index : count($posts));

    for($i = $start_index; $i < $compare_to; $i++) {
      // Set file name
      $post_file_name = $posts[$i];
      // Start processing each post found
      $post_file = $posttype_dir . "/" . $post_file_name;
      $post_data = json_decode(file_get_contents($post_file), true);
      // Send through builder to process build data
      $post_builder = new Factory($post_data["json"], $post_data["dyComp"]);
      $posttype_values[] = array(
        "title" => $post_data["title"],
        "tags" => $post_data["tags"],
        "description" => $post_data["description"],
        "publish" => $post_data["publish"],
        "values" => $post_builder->post->values
      );
    }
  }

  return $posttype_values;
}

?>