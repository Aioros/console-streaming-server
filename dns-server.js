const DnsProxyServer = require("@aiorosdev/dns-proxy-lib");
const sudo = require("sudo-prompt");
const { io } = require("socket.io-client");
const fs = require("fs");

function getSocket() {
    return io("http://127.0.0.1:3000");
}

class DnsServer {
    constructor(config) {
        this.config = config;
        this.inProcess = true;
        this.inProcessDNSServer = new DnsProxyServer(config);
    }

    runSeparateProcess() {
        console.log("exe exists: " + fs.existsSync("./dns-server-child.exe"));
    	console.log("Couldn't run DNS server. Root/administrator permissions might be needed, trying to request them for a child process DNS server.");
        // Find executable if available, otherwise run the node script
        let executable = "node ./dns-server-child.js";
        if (process.platform == "win32" && fs.existsSync("./dns-server-child.exe")) {
            executable = "./dns-server-child.exe";
        } else if (fs.existsSync("./dns-server-child")) {
            executable = "./dns-server-child";
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
		    getSocket()?.emit("requestStart");
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
            getSocket()?.emit("requestStop");
        }
    }
}

module.exports = DnsServer;