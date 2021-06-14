<?php
	if(isset($_POST['deletionIndex'])){
		$index= intval($_POST['deletionIndex']);
		$options = array("INSTR"=>"DELE","PARA"=>array("INDEX"=>$index,"HOST"=>"pop.gmail.com","PORT"=>995, "USER"=>"adrianraehome@gmail.com","PASS"=>"Bl@derunner6"));
		$result = execute_preprocessor($options);
		echo $result;
		die();
	}
?>


<!DOCTYPE html>
<html>
<head>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<style>
table {
  font-family: sans-serif;
  table-layout: fixed ;
  width: 100%;
  border-collapse: collapse;
}

td, th {
  border: 2px solid black;
  text-align: center;
  width: 25% ;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
</style>
</head>
<body>
<h1>Claudio and Adrian Present:</h1>
<table>
  <tr>
    <th>Sender</th>
    <th>Subject</th>
    <th>Message Size (bytes)</th>
    <th>Delete</th>
  </tr>
  <?php 
  	$options = array("INSTR"=>"RETR","PARA"=>array("HOST"=>"pop.gmail.com","PORT"=>995, "USER"=>"adrianraehome@gmail.com","PASS"=>"Bl@derunner6")); 
	$string = str_replace("'", "\"", strval(execute_preprocessor($options))) ;
	$messages = json_decode($string,true);
	$index = 1;
	foreach ($messages as $message) {
		echo "<tr>";
		echo "<td>".str_replace(array("<",">"), array("&lt","&gt"), $message['Sender']) ."</td>";
		echo "<td>".str_replace(array("<",">"), array("&lt","&gt"),$message['Subject'])."</td>";
		echo "<td>".$message['Size']."</td>";
		echo "<td> <button onClick='deleteRow(".$index.")''> Delete Me </button> </td>";
		echo "</tr>";
		$index++;
	}
  ?>
</table>
</body>
</html>


<script type="text/javascript">
	function deleteRow(index){
		$.post("index.php", { deletionIndex: index}).done(function( data ) { alert((data)?("successfully deleted message "+index):("failed to delete message "+index)); location.reload();});
	}

</script>

<?php 
	function execute_preprocessor($options){
		if($options['INSTR']=="RETR"){
			$command_string = "python email_preprocessor.py 0 ".$options['PARA']['HOST']." ".$options['PARA']['PORT']." ".$options['PARA']['USER']." ".$options['PARA']['PASS'];
			return exec($command_string);
		}
		else if($options['INSTR']=="DELE"){
			$command_string = "python email_preprocessor.py 1 ".$options['PARA']['INDEX']." ".$options['PARA']['HOST']." ".$options['PARA']['PORT']." ".$options['PARA']['USER']." ".$options['PARA']['PASS'];
			return exec($command_string);
		}

		;
	}
?>