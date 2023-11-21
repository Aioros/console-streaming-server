const CssGUI = require("./gui.js");
const ConsoleStreamingServer = require("./console-streaming-server.js");


var server = new ConsoleStreamingServer();
var gui = new CssGUI(server);

gui.start();