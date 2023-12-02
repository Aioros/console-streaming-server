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

    run() {
        try {
            this.inProcessDNSServer.run();
        } catch(ex) {
            console.log("Couldn't run DNS server. Root/administrator permissions might be needed, trying to request them for a child process DNS server.");
            this.inProcess = false;
            sudo.exec("node ./dns-server-child.js --config " + JSON.stringify(this.config).replace(/\"/g, "\\\""), {name: "Console Streaming Server"}, (error, stdout, stderr) => {
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