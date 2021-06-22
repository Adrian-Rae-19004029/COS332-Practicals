<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Directory Index</title>
</head>
<body>
	<h1>Files in the saved directory</h1>
	<h6>Welcome to the jungle</h6>
	<?php 
	try{
		$filenames = scandir('synced');
		foreach($filenames as $f){
			if($f!="." && $f!=".."){
				echo "<a href='synced/".$f."'>".$f."</a><br>";
			}
		}
	}
	catch(Exception $e){
		echo "<p>No file in directory</p>";
	}
	
?>
</body>
</html>



