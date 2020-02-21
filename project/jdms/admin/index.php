<?php
// Get JayDMS controller
require './core/controller/index.php';
// Start JayDMS
$JadyDMS = JayDMS::start();
?>
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
    <title>JayDMS</title>
    <link rel="shortcut icon" href="/jdms/admin/assets/img/jdms-logo-tm.svg" type="image/x-icon">
    <link rel="stylesheet" href="https://unpkg.com/ionicons@4.5.0/dist/css/ionicons.min.css"/>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous"/>
    <link rel="stylesheet" href="/jdms/admin/assets/css/admin.css"/>
  </head>
  <body>
    <?php $JadyDMS->adminView(); // Load admin view ?>
  </body>
</html>