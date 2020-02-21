<?php
class filefunctions extends Controller {

	function __construct($config, $session, $set_dir = null) {
    $this->config = $config;
    $this->session = $session;

    // Include the DirectoryLister class
    require_once('../vendors/directory-lister/DirectoryLister.php');

    // Initialize the DirectoryLister object
    $this->lister = new DirectoryLister();

    $this->assets = $this->config->dmsDir . DIRECTORY_SEPARATOR . "content" . DIRECTORY_SEPARATOR . "assets";

    // Restrict access to current directory
    getcwd();
    chdir(($set_dir == null ? $this->assets : $set_dir));
    ini_set('open_basedir', getcwd());
  }

  private function get_file_extension($file_name) {
    return substr(strrchr($file_name,'.'),0);
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

  public function recurse_delete($path) {
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

  public function uploadSingleFile($file_object = null) {

    if ($file_object == null) {
      $file_object = $_FILES['files'];
    }

    // Denie unpermitted file types
    // Add file types you do not what to permit here
    $denied_files = array();

    if (!in_array($file_object['type'], $denied_files)) {
      //Get the temp file path
      $target_filename = $file_object['tmp_name'];

      //Make sure we have a filepath
      if ($target_filename != ""){

        $directory = (isset($_POST['dir']) && $_POST['dir'] != "") ? DIRECTORY_SEPARATOR . $_POST['dir'] : "";

        $newFilePath = $this->assets . $directory . DIRECTORY_SEPARATOR . $file_object['name'];

        //Upload the file into the dir
        if(move_uploaded_file($target_filename, $newFilePath)) {

          chmod($newFilePath, 0644);

          return array(
            "success" => true,
            "name" => $file_object['name'],
            'location' => $newFilePath
          );
        } else {
          return array(
            "success" => false
          );
        }
      }
    } else {
      return array(
        "success" => false
      );
    }
  }

  public function process($processType) {

    if (isset($processType) && $processType != "" && isset($_POST['location'])) {
      
      // The content/assets directory is our root for user files
      $root = $this->assets;

      $location = $root . ($_POST['location'] != "" ? DIRECTORY_SEPARATOR . $_POST['location'] : "");

      // Remove trailing forward slash.
      if (substr($location, -1) == '/') {
        $location = substr($location, 0, -1);
      }

      if (is_dir($location)) {
        // Folder Found
        $item_type = "folder";
      } else {
        // File Found
        $item_type = "file";
      }

      $location = urldecode($location);

      // Run requested function.
      switch ($processType) {
        // Copy Process.
        case 'copyFile':
          $success = false;

          if ($item_type == "file") {
            if (file_exists($location)) {
              $file_name = basename($location);
              $file_ext = $this->get_file_extension($file_name);
              $bare_name = basename($location,$file_ext);
              $new_name = $bare_name."_copy".$file_ext;
              $new_location = dirname($location);
              $copy_to = $new_location . DIRECTORY_SEPARATOR . $new_name;

              if (copy($location,$copy_to)) {
                $success = true;
                $extra = $copy_to;
                chmod($copy_to, 0644);
              }
            }
          } else if ($item_type == "folder") {
            if ($this->recurse_copy($location, $location."_copy")) {
              $success = true;
              $extra = $location."_copy";
            }
          }

          if ($success) {
            $return = array(
              "success"	=> true,
              "message" => "File was successfully copied."
            );
          } else {
            $return = array(
              "success"	=> false,
              "message" => "There was an error copying file. ".$location." "
            );
          }
          break;

        // Rename Process. -----------------------------------------------------
        case 'renameFile':

          if (isset($_POST['newName']) && !empty($_POST['newName']) && is_string($_POST['newName']))  {
            $success = false;

            $new_name = $_POST['newName'];

            $parent_dir = dirname($location);
            $rename_to = $parent_dir . DIRECTORY_SEPARATOR . $new_name;

            if (rename($location, $rename_to)) {
              $success = true;
              $extra = $rename_to;
              chmod($rename_to, 0644);
            }

            if ($success) {
              $return = array(
                "success"	=> true,
                "message" => "File was successfully renamed."
              );
            } else {
              $return = array(
                "success"	=> false,
                "message" => "There was an error renaming file."
              );
            }
          } else {
            $return = array(
              "success"	=> false,
              "message" => "Missing value."
            );
          }

          break;

        // Delete Process. -----------------------------------------------------
        case 'deleteFile':
          $success = false;
          $extra = $location;

          $devInfo = "";

          if ($item_type == "file") {
            $devInfo .= "Delete file attempt - ".$location;
            if (file_exists($location)) {
              if (unlink($location)) {
                $success = true;
              }
            }
          } else if ($item_type == "folder") {
            $devInfo .= "Delete folder attempt - ".$location;
            if ($this->recurse_delete($location)) {
              $success = true;
            }
          }

          if ($success) {
            $return = array(
              "action"	=> $processType,
              "item"		=> $item_type,
              "message" => "File was successfully deleted. ".$devInfo,
              "success"	=> true
            );
          } else {
            $return = array(
              "action"	=> $processType,
              "item"		=> $item_type,
              "message" => "There was an error deleting file. ".$devInfo,
              "success"	=> false
            );
          }
          break;

        // New Folder Process. -----------------------------------------------------
        case 'newFolder':

          if (isset($_POST['name']) && is_string($_POST['name']))  {
            $success = false;

            $name = $_POST['name'];

            $new_folder_to = $location . DIRECTORY_SEPARATOR . $name;

            if (mkdir($new_folder_to)) {
              $success = true;
              $extra = $new_folder_to;
              chmod($new_folder_to, 0755);
            }

            if ($success) {
              $return = array(
                "success"	=> true,
                "message" => "New folder was successfully created.",
              );
            } else {
              $return = array(
                "success"	=> false,
                "message" => "There was an error creating folder."
              );
            }
          } else {
            $return = array(
              "success"	=> false,
              "message" => "Missing value. ".isset($_POST['name'])." ".is_string($_POST['name'])
            );
          }

          break;

        // CHMOD Process. -----------------------------------------------------
        case 'changePermission':

          if (isset($_POST['permission']) && (is_string($_POST['permission']) || is_int($_POST['permission'])))  {
            $success = false;

            $set_to = $_POST['permission'];

            $permission = (int) $set_to;
            $extra = $location." set to ".$set_to;

            if (chmod($location, $permission)) {
              $success = true;
            }

            if ($success) {
              $return = array(
                "success"	=> true,
                "message" => "Permissions have been updated."
              );
            } else {
              $return = array(
                "success"	=> false,
                "message" => "There was an error changing permissions."
              );
            }
          } else {
            $return = array(
              "success"	=> false,
              "message" => "Missing value."
            );
          }

          break;
      }

      return $return;
    } else {
      return array(
        'success' => false,
        'message' => "Missing values."
      );
    }
  }

  public function Uploader() {

    if(isset($_FILES['files'])){
      // Count # of uploaded files in array
      $total = count($_FILES['files']['name']);
      if ($total > 0) {

        $return_list = [];

        for ($i = 0; $i < $total; $i++) {

          $file_data = array(
            'name' => $_FILES['files']['name'][$i],
            'tmp_name' => $_FILES['files']['tmp_name'][$i],
            'size' => $_FILES['files']['size'][$i],
            'type' => $_FILES['files']['type'][$i],
            'error' => $_FILES['files']['error'][$i]
          );

          $file_response = $this->uploadSingleFile($file_data);

          if ($file_response) {
            $return_list[] = $file_response;
          }
        }

        return array(
          'success' => true,
          'message' => "Upload completed.",
          "list" => $return_list
        );
      } else {
        return array('success' => false,'message' => "Please select file.");
      }
    } else {
      return array('success' => false,'message' => "Missing values.");
    }
  }

  public function LoadDirectory() {
    // Return file hash
    if (isset($_GET['hash'])) {
      // Get file hash array and JSON encode it
      $hashes = $this->lister->getFileHash($_GET['hash']);
      $data   = json_encode($hashes);
      // Return the data
      die($data);
    }

    // Initialize the directory array
    if (isset($_POST['dir']) && !empty($_POST['dir'])) {
      $dir_array = $this->lister->listDirectory($_POST['dir']."/");
    } else {
      $dir_array = $this->lister->listDirectory('.');
    }

    $breadcrumbs = $this->lister->listBreadcrumbs();
    $sys_messages = $this->lister->getSystemMessages();

    if (!$sys_messages) {
      $sys_messages = null;
    }

    $browser_data = array(
      'breadcrumbs' => $breadcrumbs
    );

    $files_array = array();

    foreach ($dir_array as $name => $file_info) {

      if (is_file($file_info['file_path'])) {
        $is_folder = false;
      } else {
        $is_folder = true;
      }

      $files_array[$name] = array(
        '_info' => array(
          'filename' => $name,
          'icon' => $file_info['icon_class'],
          'url' => $file_info['url_path'],
          'path' => $file_info['file_path'],
          'size' => $file_info['file_size'],
          'lastmodified' => $file_info['mod_time'],
          'sort' => $file_info['sort'],
          'handler' => $file_info['handler'],
          'isfolder' => $is_folder,
          'permission' => $file_info['permission']
        )
      );

      if ($is_folder) {
        $files_array[$name]['_files'] = new stdClass;
      }
    }

    $browser_data['files'] = $files_array;
    $directory = json_decode(json_encode($browser_data), true);

    return array(
      'success' => true,
      'message' => "Directory information found.",
      'directory' => $directory
    );
  }
}