
	console.log(
		"======================================"+'\n'+
		"WELCOME TO THE pHOnEbooK"+'\n'+
		"======================================"
	);

	const fs = require('fs');
	const url = require('url');

	
	var port = 8081;

	//get a port
	const prompt = require('prompt-sync')();
	var validPort = false;
	while(!validPort){
		const inquestPort = prompt(
		'Please enter a port number to listen on'+'\n'+
		'[leave blank for default 8081] '+'\n'
		);
		port = (inquestPort=='')?port:inquestPort;	
		validPort = true;
		console.log("Connecting on port: "+port);	
	}

	const http = require('http');
	const WebSocketServer = require('websocket').server;
	const server = http.createServer((req,res) => {
		
		console.log('Server Created');

		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.write('YEEYEE');
	
	});
	server.listen(port);
	//server.on('close',function(){})


	function addEntry(entry){

	}

	function deleteEntry(entry){

	}

	function search(entry){
	}


	
	//socket
	
	/*
	const wsServer = new WebSocketServer({
		httpServer: server
	});
	wsServer.on('request', function(request) {
		
		var api = null;
		
		const connection = request.accept(null, request.origin);
		connection.on('message', function(message) {
			//receieves a message from client - deal with it
			//console.log('Received Message:', message.utf8Data);
			
			//if its a new socket being created
			if(message.utf8Data ==='login socket created'){
				numUsers++;
				//console.log('Client has connected.');
				connection.sendUTF('Welcome to Tune Room');
			}
			else if(message.utf8Data ==='admin socket created'){
				numUsers++;
				//console.log('Client has connected.');
				connection.sendUTF('Welcome, admin');
			}
			else if(message.utf8Data.includes('login')){

			}
			else if(message.utf8Data.includes('setTime')){
			}
			else if(message.utf8Data.includes('getTime')){

			}
			else if(message.utf8Data.includes('SVRQUIT')){
				connection.sendUTF('SERVER:CLOSING');
				connection.close();
				setTimeout(process.exit("Admin requested to quit"),5000);
			}
			else if(message.utf8Data.includes('SVRLIST')){
				connection.sendUTF('SERVER LOG'+'\n'
				+"Active Users: "+numUsers
				);
			}
		
		});
		connection.on('close', function(reasonCode, description) {
			//what to do when a client session terminates
		});
	});

	process.on("exit",function(reason){
		console.log(reason);
	});
	*/

