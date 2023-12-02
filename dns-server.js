const DnsProxyServer = require("@aiorosdev/dns-proxy-lib");
const sudo = require('sudo-prompt');
const { io } = require("socket.io-client");

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
    	console.log("Couldn't run DNS server. Root/administrator permissions might be needed, trying to request them for a child process DNS server.");
	    this.inProcess = false;
	    sudo.exec("node ./dns-server-child.js --config " + Buffer.from(JSON.stringify(this.config)).toString("base64"), {name: "Console Streaming Server"}, (error, stdout, stderr) => {
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