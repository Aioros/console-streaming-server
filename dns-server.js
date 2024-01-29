const DnsProxyServer = require("@aiorosdev/dns-proxy-lib");
const sudo = require("sudo-prompt");
const { io } = require("socket.io-client");
const fs = require("fs");
const path = require("path");

class DnsServer {
    constructor(config) {
        this.config = config;
        this.inProcess = true;
        this.inProcessDNSServer = new DnsProxyServer(config);
        this.socket = null;
    }

    getSocket() {
        if (!this.socket) {
            this.socket = io("http://127.0.0.1:3000");
        }
        return this.socket;
    }

    runSeparateProcess() {
    	console.log("Couldn't run DNS server. Root/administrator permissions might be needed, trying to request them for a child process DNS server.");
        // Find executable if available, otherwise run the node script
        let executable = process.execPath + " " + path.resolve(__dirname, "dns-server-child.js");
        if (process.platform == "win32" && fs.existsSync("./dns-server-child.exe")) {
            executable = path.resolve(__dirname, "dns-server-child.exe");
        } else if (fs.existsSync("./dns-server-child")) {
            executable = path.resolve(__dirname, "dns-server-child");
        }
        if (process.platform == "win32") {
            executable = executable.replace(/\//g, "\\");
        }
        let command = executable + " --config " + Buffer.from(JSON.stringify(this.config)).toString("base64");
	    this.inProcess = false;
	    sudo.exec(command, {name: "Console Streaming Server"}, (error, stdout, stderr) => {
            if (error) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                throw error;
            }
	    });
	    setTimeout(() => {
		    this.getSocket()?.emit("request", {command: "start"}, (response) => {console.log("response: ", response)});
	    }, 1000);
    }

    run() {
        try {
            this.inProcessDNSServer.run();
            this.inProcessDNSServer.socket.on("error", (err) => {this.runSeparateProcess();});
        } catch(ex) {
            this.runSeparateProcess();
        }
    }

    stop() {
        if (this.inProcess) {
            this.inProcessDNSServer.stop();
        } else {
            this.getSocket()?.emit("request", {command: "stop"}, (response) => {
                this.getSocket()?.disconnect();
            });
        }
    }
}

module.exports = DnsServer;