const lib_net = require("net");
const lib_chalk = require("chalk");
const fs = require('fs');

var clients = {};
var sessionId = -1;
const phonebook = 'phonebook.txt';
const port = 8023;

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
}

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
	fs.writeFile(phonebook, content, { flag: 'a+' }, err => {
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

function validNumber(input){
	return (input.length == 10 || input[0] == "0");
}

function formattedString(string, formatFunction = lib_chalk.white){
	return formatFunction(string);
}

function clearScreen(lines){
	return "\r\n".repeat(lines || 40);
}

function draw(display) {
	var output = "";
	for (var i=0; i<display.length; i++) {
		output += "\r\n" + display[i].join("");
	}
	return output;
}

function socketHandler(socket) {
	sessionId++;
	clients[sessionId] = {socket: socket};
	var id = sessionId;
	var mode = "title";
	var display = [];

	var inputBuffer = [];

	//create a display
	for (var i=0; i<20; i++) {
		display[i] = [];
		for (var j=0; j<80; j++) {
			display[i][j] = " ";
		}
	}

    display = [ "+------------------------------------------------------------------------------+".split(""),
                "|                                                                              |".split(""),
                "|    +=============================+          Server: The Phonebook            |".split(""),
                "|    |        The Phonebook        |          Client: XXX.XXX.XXX.XXX          |".split(""),
                "|    +=============================+          Timestamp: hh:mm:ss DD/MM/YYYY   |".split(""),
                "|                                                                              |".split(""),
                "| Welcome to the Phonebook lookup server, which keeps track of phone           |".split(""),
                "| numbers in a simple text-file based manner. Operations on data can be        |".split(""),
                "| performed by the operations:                                                 |".split(""),
                "|    - add \<name\> \<number\>                                                     |".split(""),
                "|    - search \<name\>                                                           |".split(""),
                "|    - delete \<name\>                                                           |".split(""),
                "|                                                                              |".split(""),
				"+------------------------------------------------------------------------------+".split(""),
                "| phonebook \>                                                                  |".split(""),
                "+------------------------------------------------------------------------------+".split("")
              ];

    var now = new Date();
    var formatedNow = (now.getHours()).toString().length === 1 ? "0" + (now.getHours()) : (now.getHours()).toString();
    formatedNow += ":" + ((now.getMinutes()).toString().length === 1 ? "0" + (now.getMinutes()) : (now.getMinutes()).toString());
    formatedNow += ":" + ((now.getSeconds()).toString().length === 1 ? "0" + (now.getSeconds()) : (now.getSeconds()).toString());
    formatedNow += " " + ((now.getDate()).toString().length === 1 ? "0" + (now.getDate()) : (now.getDate()).toString());
    formatedNow += "/" + ((now.getMonth() + 1).toString().length === 1 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1).toString());
    formatedNow += "/" + (now.getFullYear());

    // Client address
    for (var i=0; i<15; i++) {
      display[3][54 + i] = socket.remoteAddress.toString()[i] || " ";
    }

    // Timestamp
    for (var i=0; i<19; i++) {
      display[4][57 + i] = formatedNow[i] || " ";
    }


    socket.write(draw(display));
	socket.write(String.fromCharCode(27));
	socket.write("[16;15H");

	socket.on("data", function(data) {

		var char = new Buffer(data).toString();
		inputBuffer.push(char);
		//console.log(inputBuffer.join(''));

		if(char==="\r\n") {
			//the activation char
			var argumentArray = inputBuffer.join('').trim().split(" ");
			//clear the buffer
			inputBuffer = [];

			if(argumentArray.length!==0){
				if(argumentArray[0]==="add" && argumentArray.length===3 && validNumber(argumentArray[2])){
					var name = argumentArray[1].toUpperCase();
					var number = argumentArray[2];
					addEntry(name,number);
				}
				else if(argumentArray[0]==="delete" && argumentArray.length===2){
					var name = argumentArray[1].toUpperCase();
					search(name,(res)=>{
						deleteEntry(name);
						socket.write(formattedString("Deleted ["+name+","+res+"]\r\n",lib_chalk.green));
					}, ()=>{
						socket.write(formattedString("Could not find ["+name+"]\r\n",lib_chalk.red));
					});
				}
				else if(argumentArray[0]==="search" && argumentArray.length===2){
					var name = argumentArray[1].toUpperCase();
					search(name,(res)=>{
						socket.write(formattedString("Found ["+name+","+res+"]\r\n",lib_chalk.green));
					}, ()=>{
						socket.write(formattedString("Could not find ["+name+"]\r\n",lib_chalk.red));
					});
				}
			}

		}

	});

	socket.on("end", function() {
		clients[id].socket.end();
		delete clients[id];
	});
}

var server = lib_net.createServer(socketHandler);
server.listen(port);