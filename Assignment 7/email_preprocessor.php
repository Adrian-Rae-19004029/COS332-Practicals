<?php 
	

	$host = $_POST['host'];
	$port = $_POST['port'];
	$user = $_POST['username'];
	$pass = $_POST['password'];

	if(isset($_POST['deletionIndex'])){
		$index= intval($_POST['deletionIndex']);
		$options = array("INSTR"=>"DELE","PARA"=>array("INDEX"=>$index,"HOST"=>$host,"PORT"=>$port, "USER"=>$user,"PASS"=>$pass)); 
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
<h1>Basic POP3 Email Pre-Processor</h1>
<button onclick="reloadPage()">Refresh</button>
<h4>Logged in as: <?php echo $user;?> [<?php echo $host;?> | <?php echo $port;?>]</h4>

<table>
  <tr>
    <th>Sender</th>
    <th>Subject</th>
    <th>Message Size (bytes)</th>
    <th>Delete</th>
  </tr>
  <?php 
  $options = array("INSTR"=>"RETR","PARA"=>array("HOST"=>$host,"PORT"=>$port, "USER"=>$user,"PASS"=>$pass)); 
	$string = str_replace("'", "\"", strval(execute_preprocessor($options))) ;
	$messages = json_decode($string,true);
	$index = 1;
	if($messages === false) echo "<tr><td colspan = 4>Unable to connect to this pop3 server.</td></tr>";
 	else if(count($messages)==0) echo "<tr><td colspan = 4>No mail present at this server.</td></tr>";
 	else foreach ($messages as $message) {
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
		var hostName = "<?php echo $host;?>";
		var portNumber = "<?php echo $port;?>";
		var user = "<?php echo $user;?>";
		var pass = "<?php echo $pass;?>";

		$.post("email_preprocessor.php", { deletionIndex: index, host:hostName, port:portNumber,username:user,password:pass}).done(function( data ) {alert((data)?("successfully deleted message "+index):("failed to delete message "+index)); location.reload();});
	}
	function reloadPage(){location.reload();}

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