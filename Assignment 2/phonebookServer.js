
	console.log(
		"======================================"+'\n'+
		"WELCOME TO THE pHOnEbooK"+'\n'+
		"======================================"
	);

	const fs = require('fs');
	const url = require('url');
	const phonebook = 'phonebook.txt';

	
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
		
		console.log('Server Created')
		search("Claudio");

		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.write('YEEYEE');
		
	
	});
	server.listen(port);
	//server.on('close',function(){})


	function addEntry(name,number){
		writeFile(name.toUpperCase()+','+number);
	}

	function deleteEntry(name){
		readFile((res)=>{
			var writelist = [];
			var list = res.split('\n'); 
			for(var i=0; i<list.length; i++){
				if(list[i]!="" && list[i].split(",")[0]!=name){
					writelist.push(list[i]);
				}	
			}
			clear("");
			for(var i=0; i<writelist.length; i++){
				addEntry(writelist[i].split(",")[0],writelist[i].split(",")[1]);	
			}
		})
	}

	
	function search(entry){
        fs.readFile(phonebook, 'utf8' , (err, data) => {
            if (err) {
                onError(err);
                return
            }
            if(data.includes(entry)){//if(data.indexOf(entry) >= 0){
                console.log(data)
            }

        })
    }

    /*
    function search(entry, onFound = (res)=>{console.log("Found ["+entry+","+res+"] in phonebook");}, onNotFound = ()=>{console.error("Could not find ["+entry+"] in phonebook");}){
        fs.readFile(phonebook, 'utf8' , (err, data) => {
            if (err) {
                onError(err);
                return
            }
            if(data.includes(entry.toUpperCase())){//if(data.indexOf(entry) >= 0){
                var array = data.split('\n');
                for(var i=0; i<array.length; i++){
					if(array[i]!="" && array[i].split(",")[0]==entry){
						var number = array[i].split(",")[1];
						onFound(number);
						return;
					}	
				}
            }
            onNotFound();

        })
    }*/

		
	function readFile(onReceive,onError = function(e){console.error(e);}){
		//onRecieve is a function which handles your data in the file
		fs.readFile(phonebook, 'utf8' , (err, data) => {
		  if (err) {
		    onError(err);
		    return
		  }
		  onReceive(data);
		})
	}

	function writeFile(content,onError = (e)=>{console.error(e);}){
		fs.writeFile(phonebook, content+'\n', { flag: 'a+' }, err => {
		  if (err) {
		    onError(err);
		    return
		  }
		})
	}

	function clear(onError = (e)=>{console.error(e);}){
		fs.writeFile(phonebook, "", err => {
		  if (err) {
		    onError(err);
		    return
		  }
		})
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

