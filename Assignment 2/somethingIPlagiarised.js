const lib_net = require("net");
const lib_chalk = require("chalk");

var clients = {};
var lastId = -1;

function cleanInput(data) {
  return data.toString().replace(/(\r\n|\n|\r)/gm,"");
}

function clipText(text, seperator, delimiter) {
  var output = "";
  for (var i=0; i<text.length; i+=seperator) {
    output += text.substring(i, i + seperator) + delimiter;
  }
  output = output.substring(0, output.length - delimiter.length);
  return output;
}

function redraw(display) {
  var output = "";
  for (var i=0; i<display.length; i++) {
    output += "\r\n" + display[i].join("");
  }
  return output;
}

function clear(lines) {
  return "\r\n".repeat(lines || 40);
}

function socketHandler(socket) {
  // Figure out how to stop linemode & echo by default.

  lastId++;
  clients[lastId] = {socket: socket};
  var id = lastId;
  var mode = "title";
  var display = [];

  for (var i=0; i<20; i++) {
    display[i] = [];
    for (var j=0; j<80; j++) {
      display[i][j] = " ";
    }
  }

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  ___ _ _     ___ ___ ___                                                     ║
║ | _ |_) |_  | _ ) _ ) __|                   Server: Bit BBS                  ║
║ | _ \ |  _| | _ \ _ \__ \                   Client: XXX.XXX.XXX.XXX          ║
║ |___/_|\__| |___/___/___/                   Timestamp: hh:mm:ss DD/MM/YYYY   ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║ Welcome to the Bit BBS server! Do note that your client should be in         ║
║ character mode, that is where keystrokes are sent to the server directly. If ║
║ your client is not in this mode, do try `mode character` in your client's    ║
║ terminal with the escape character, or if you are using a client with a GUI, ║
║ try looking in the connection configuration. A color enabled terminal is     ║
║ also required to use the board. Type / for the command menu at any time.     ║
║                                                                              ║
║ Press any key to continue...                                                 ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/
  display = [ "╔══════════════════════════════════════════════════════════════════════════════╗".split(""),
              "║  ___ _ _     ___ ___ ___                                                     ║".split(""),
              "║ | _ |_) |_  | _ ) _ ) __|                   Server: Bit BBS                  ║".split(""),
              "║ | _ \\ |  _| | _ \\ _ \\__ \\                   Client: XXX.XXX.XXX.XXX          ║".split(""),
              "║ |___/_|\\__| |___/___/___/                   Timestamp: hh:mm:ss DD/MM/YYYY   ║".split(""),
              "║                                                                              ║".split(""),
              "║                                                                              ║".split(""),
              "║                                                                              ║".split(""),
              "║                                                                              ║".split(""),
              "║                                                                              ║".split(""),
              "║ Welcome to the Bit BBS server! Do note that your client should be in         ║".split(""),
              "║ character mode, that is where keystrokes are sent to the server directly. If ║".split(""),
              "║ your client is not in this mode, do try `mode character` in your client's    ║".split(""),
              "║ terminal with the escape character, or if you are using a client with a GUI, ║".split(""),
              "║ try looking in the connection configuration. A color enabled terminal is     ║".split(""),
              "║ also required to use the board. Type / for the command menu at any time.     ║".split(""),
              "║                                                                              ║".split(""),
              "║ Press any key to continue...                                                 ║".split(""),
              "║                                                                              ║".split(""),
              "╚══════════════════════════════════════════════════════════════════════════════╝".split("")
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

  socket.write(clear());
  socket.write(redraw(display));
  mode = "title_continue";
  var typing = "";

  function switchMode(mode) {
    switch (mode) {
      case "slash":
/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  Bit BBS  //  Guest            //  XXX.XXX.XXX.XXX  //  hh:mm:ss DD/MM/YYYY  ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║ Slash > /                                                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/
        display[18] = "║ Slash > /                                                                    ║".split("");

        // Color
        for (var i=0; i<78; i++) {
          display[18][i + 1] = lib_chalk.bgRed(display[18][i + 1]);
        }

        socket.write(clear());
        socket.write(redraw(display));

        break;
      case "main":
/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  Bit BBS  //  Guest            //  XXX.XXX.XXX.XXX  //  hh:mm:ss DD/MM/YYYY  ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/
        display = [ "╔══════════════════════════════════════════════════════════════════════════════╗".split(""),
                    "║  Bit BBS  //  Guest            //  XXX.XXX.XXX.XXX  //  hh:mm:ss DD/MM/YYYY  ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "║                                                                              ║".split(""),
                    "╚══════════════════════════════════════════════════════════════════════════════╝".split("")
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
          display[1][37 + i] = socket.remoteAddress.toString()[i] || " ";
        }

        // Timestamp
        for (var i=0; i<19; i++) {
          display[1][58 + i] = formatedNow[i] || " ";
        }

        // Color
        for (var i=0; i<78; i++) {
          display[1][i + 1] = lib_chalk.bgGreen(display[1][i + 1]);
        }

        socket.write(clear());
        socket.write(redraw(display));
        break;
    }
  }

  socket.on("data", function(data) {
    var char = new Buffer(data).toString("base64");
    console.log( data + " || " + (new Buffer(data).toString().charCodeAt(0)) + " (" + data.length + ") @ " + mode + " ==> " + char );

    if (char === "//0D//0B") {
      return;
    }

    if (char === "Lw==" && (mode !== "title" && mode !== "title_continue" && mode !== "slash")) {
      mode = "slash";
      switchMode("slash");
      return;
    }

    switch (mode) {
      case "slash":
        if (char === "Gw==" || char === "Lw==") {
          mode = "main";
          switchMode("main");
          break;
        }

        break;
      case "title_continue":
        mode = "main";
        switchMode("main");
        break;
      case "main":
        switchMode("main");
        break;
    }
  });

  socket.on("end", function() {
    clients[id].socket.end();
    delete clients[id];
  });
}


var server = lib_net.createServer(socketHandler);
console.log("Yipeeeeeee");
server.listen(8023);