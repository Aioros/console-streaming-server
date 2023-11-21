const NodeMediaServer = require("node-media-server");
const DnsProxyServer = require("dns-proxy-lib");

let domains = [
    "*.contribute.live-video.net",
    "live*.twitch.tv"
];

class ConsoleStreamingServer {
    constructor(config) {
        this.mainIP = "";
        this.config = config;
        this.dnsRunning = false;
        this.rtmpRunning = false;
    }

    setMainIP(ip) {
        this.mainIP = ip;
    }

    startDNS() {
        console.log("starting DNS server");
        if (this.dnsRunning) {
            this.dnsProxyServer.stop();
        }
        this.dnsConfig = { host: this.mainIP, domains: Object.fromEntries(domains.map(d => [d, this.mainIP])) };
        this.dnsProxyServer = new DnsProxyServer(this.dnsConfig);
        try {
            this.dnsProxyServer.run();
            this.dnsRunning = true;
        } catch(ex) {
            throw ex;
        }
    }

    restartDNS() {
        if (this.dnsRunning) {
            this.dnsProxyServer.stop();
            this.dnsConfig = { domains: Object.fromEntries(domains.map(d => [d, mainIP])) };
            this.dnsProxyServer = new DnsProxyServer(this.dnsConfig);
            this.startDNS();
        }
    }

    checkDNSStatus(callback) {
        const { Resolver } = require("node:dns");
        const resolver = new Resolver();
        resolver.setServers([this.mainIP]);
        resolver.resolve4(domains[0], (err, addresses) => {
            callback(!err);
        });
    }

    startRTMP() {
        console.log("starting RTMP server");
        if (this.rtmpRunning) {
            this.nodeMediaServer.stop();
        }
        this.nmsConfig = {
            logType: 3,
            rtmp: {
                port: 1935,
                chunk_size: 60000,
                gop_cache: true,
                ping: 30,
                ping_timeout: 60
            },
            http: {
                port: 8080,
                allow_origin: "*"
            }
        };
        this.nodeMediaServer = new NodeMediaServer(this.nmsConfig);
        this.nodeMediaServer.on("postPublish", (id, streamPath, args) => {
            console.log("Receiving stream", `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
            // stream path looks like: /app/live_157929848_DWzeddUhYx6ST73aXI0YE3yO1vdy50
        });
      
        try {
            this.nodeMediaServer.run();
            this.rtmpRunning = true;
        } catch(ex) {
            throw ex;
        }
    }
      
    checkRTMPStatus(callback) {
        const NodeRtmpClient = require("./node_modules/node-media-server/src/node_rtmp_client");
        let rc = new NodeRtmpClient("rtmp://"+this.mainIP+"/app/fakestream");
        rc.onSocketError = () => callback(false);
        rc.onSocketData = () => callback(true);
        rc._start();
        rc.stop();
    }

    start() {
        this.stop();
        this.startDNS();
        this.startRTMP();
    }

    stop() {
        if (this.dnsRunning) {
            console.log('stopping DNS server');
            this.dnsProxyServer.stop();
            this.dnsRunning = false;
        }
        if (this.rtmpRunning) {
            console.log('stopping RTMP server');
            this.nodeMediaServer.stop();
            this.rtmpRunning = false;
        }
    }

    checkStatus(callback) {
        this.checkDNSStatus((isDnsOk) => {
            this.checkRTMPStatus((isRtmpOk) => {
                callback(isDnsOk && isRtmpOk);
            });
        });
    }

}

module.exports = ConsoleStreamingServer;