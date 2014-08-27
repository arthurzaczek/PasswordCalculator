<?php 
$action = $_REQUEST['action'];
$name = $_REQUEST['name'];
$filename = 'data/'.preg_replace("([^\w\s\d\-_~,;:\[\]\(\].]|[\.]{2,})", '', $name).'.json';

if($action == 'get') {
	if (file_exists($filename)) {
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename='.basename($filename));
		header('Content-Transfer-Encoding: binary');
		header('Expires: 0');
		header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
		header('Pragma: public');
		header('Content-Length: '. filesize($filename));
		ob_clean();
		flush();
		readfile($filename);
    exit;
	} else {
		header('HTTP/1.0 404 Not Found');
		echo "<h1>404 Not Found</h1>";
		echo 'The file '.$filename.' that you have requested could not be found.';
		exit();
	}
} else if($action == 'post') {
	$str_json = file_get_contents('php://input');
	file_put_contents($filename, $str_json, LOCK_EX);
	echo '{ "success": "true" }';
	exit();
} else {
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password Calculator Service</title>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>

    <!-- Bootstrap -->
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
    <!-- Optional theme -->
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap-theme.min.css">
    <!-- Latest compiled and minified JavaScript -->
    <script type="text/javascript" src="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>

    <!-- crypto js -->
    <script type="text/javascript" src="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha256.js"></script>

    <!-- Password calculator -->
    <script type="text/javascript" src="PasswordCalculator.js"></script>
    <link rel="stylesheet" href="stylesheet.css">
</head>
<body>
    <div class="container">
        <div class="jumbotron">
            <h1>Password Calculator Service</h1>
            <p>This Page manages your snyc settings. <a href="readme.html">Read more...</a></p>
        </div>
    </div>
</body>
</html>
<?php } ?>