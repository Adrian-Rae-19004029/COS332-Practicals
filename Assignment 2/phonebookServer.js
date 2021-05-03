//const variables required for the phonebook to run
const lib_net = require("net");
const lib_chalk = require("chalk");
const fs = require('fs');

//other variables for use in the prac 3
var clients = {};
var sessionId = -1;
const phonebook = 'phonebook.txt';
const port = 8023;



/******************************************************************/ //THREE MAIN FUNCTIONS BELOW

//adds a name to the textfile
function addEntry(name,number){
	readFile((res)=>{
		var contactList = JSON.parse(res);
		var contact = {"name":name,"number":number};
		contactList.push(contact);
		writeFile(contactList);
	});

}

//deletes a name from the textfile
function deleteEntry(name){
	readFile((res)=>{
		var writelist = [];
		var contactList = JSON.parse(res);
		contactList.forEach((item,index)=>{
			if(item.name.toUpperCase()!==name.toUpperCase()) writelist.push(item);
		})
		writeFile(writelist);
	})
}

//searches a textfile for a name
function search(entry, onFound = (res)=>{console.log("Found ["+entry+","+res+"] in phonebook");}, onNotFound = ()=>{console.error("Could not find ["+entry+"] in phonebook");},field="name"){

	readFile((res)=>{
		var found = false;
		var contactList = JSON.parse(res);
		contactList.forEach((item,index)=>{
			//console.log("Comparing "+item.name.toUpperCase()+" to "+entry.toUpperCase());
			if(field==="name" && item.name.toUpperCase()===entry.toUpperCase()){
				onFound(item);
				found = true;
			}
			else if(field==="number" && item.number===entry){
				onFound(item);
				found = true;
			}
		});
		if(found===false) onNotFound();
	});
}
/******************************************************************/ //SUB FUNCTIONS USED BY ABOVE MAIN ONES

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
	//content is a JSON Array
	fs.writeFile(phonebook, JSON.stringify(content), err => {
		if (err) {
			onError(err);
			return
		}
	})
}
/******************************************************************/ //Verification and task handeling

function validNumber(input){
	return (input.length == 10 || input[0] == "0");
}

function formattedString(string, formatFunction = lib_chalk.white){
	return formatFunction(string);
}

function clearScreen(lines){
	return "\r\n".repeat(lines || 40);
}

function moveToInput(socket){
	socket.write(String.fromCharCode(27));
	socket.write("[16;2H phonebook \>                                                                  ");
	socket.write(String.fromCharCode(27));
	socket.write("[16;3H")
	socket.write(formattedString("phonebook \> ",lib_chalk.yellow));
}

function displayResponse(socket,phrase,error=false){
	//go to the position and write out a blank line
	socket.write(String.fromCharCode(27));
	socket.write("[18;2H                                                                            ");
	socket.write(String.fromCharCode(27));
	socket.write("[18;2H");
	if(!error) socket.write(formattedString(" + "+phrase,lib_chalk.green));
	else socket.write(formattedString(" + "+phrase,lib_chalk.red));
	moveToInput(socket);
}

function draw(display) {
	var output = "";
	for (var i=0; i<display.length; i++) {
		output += "\r\n" + display[i].join("");
	}
	return output;
}

function validArguments(array){
	var valid = true;
	array.forEach((item,index)=>{
		if(item.trim()=="") valid = false;
	});
	return valid;
}

function socketHandler(socket) {
	sessionId++;
	clients[sessionId] = {socket: socket};
	var id = sessionId;
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
                "|    - search \<entry\> \<field = name | number \>                                 |".split(""),
                "|    - delete \<name\>                                                           |".split(""),
                "|                                                                              |".split(""),
				"+------------------------------------------------------------------------------+".split(""),
                "| phonebook \>                                                                  |".split(""),
                "+------------------------------------------------------------------------------+".split(""),
				"|                                                                              |".split(""),
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


    socket.write(formattedString(draw(display),lib_chalk.white));
	moveToInput(socket);

	socket.on("data", function(data) {

		var char = new Buffer(data).toString();
		inputBuffer.push(char);
		//console.log(inputBuffer.join(''));

		if(char==="\r\n") {
			//the activation char
			var argumentArray = inputBuffer.join('').trim().split(" ");
			if(argumentArray.length!==0){

				//adding entry
				if(argumentArray[0]==="add" && argumentArray.length===3 && validArguments(argumentArray)){
					var name = argumentArray[1];
					var number = argumentArray[2];
					if(!validNumber(number)){
						displayResponse(socket,"Invalid Phone Number format");
					}
					else{
						addEntry(name,number);
						displayResponse(socket,"Successfully added ("+name+","+number+")");
					}


				}
				//deleting entry
				else if(argumentArray[0]==="delete" && argumentArray.length===2 && validArguments(argumentArray)){
					var name = argumentArray[1];
					search(name,(res)=>{
						deleteEntry(name);
						displayResponse(socket,"Deleted ("+res.name+","+res.number+")");
					}, ()=>{
						displayResponse(socket,"Could not find ("+name+")",true);
					});
				}
				//search based on name
				else if(argumentArray[0]==="search" && argumentArray.length===2 && validArguments(argumentArray)){
					var name = argumentArray[1];
					search(name,(res)=>{
						displayResponse(socket,"Found result: ("+res.name+","+res.number+")");
					}, ()=>{
						displayResponse(socket,"Could not find ("+name+")",true);
					});
				}
				//search based on specific field
				else if(argumentArray[0]==="search" && argumentArray.length===3 && validArguments(argumentArray)){
					var name = argumentArray[1];
					var field = argumentArray[2];
					search(name,(res)=>{
						displayResponse(socket,"Found result: ("+res.name+","+res.number+")");
					}, ()=>{
						displayResponse(socket,"Could not find ("+name+")",true);
					},field);
				}
				//argh
				else displayResponse(socket,"Invalid Query",true);

			}
			else displayResponse(socket,"Invalid Query",true);
			//clear the buffer
			inputBuffer = [];

		}

	});

	socket.on("end", function() {
		clients[id].socket.end();
		delete clients[id];
	});
}

var server = lib_net.createServer(socketHandler);
server.listen(port);