<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Origin, Access-Control-Allow-Headers, X-Requested-With, Content-Type, Accept, Authorization, api-key');
header('Access-Control-Expose-Headers: Content-Type, api-key');

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Max-Age: 60');
header('Content-Type: application/json');

// Get config for file path
require '../controller/config.php';
// Get utilities
require '../controller/utilities.php';
// Load application classes
require 'controller.php';
require 'router.php';

// Start the application
$API = new Router();
?>