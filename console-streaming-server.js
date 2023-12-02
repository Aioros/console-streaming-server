const DnsServer = require("./dns-server.js");
const NodeMediaServer = require("node-media-server");
const { Client: RtmpClient } = require("rtmp-client");

class ConsoleStreamingServer {
    constructor(config) {
        this.mainIP = "";
        this.config = config;
        this.dnsRunning = false;
        this.rtmpRunning = false;
        this.streams = [];
        this.streamsUpdatedCallbacks = [];
    }

    getConfig() {
        return this.config;
    }

    setMainIP(ip) {
        this.mainIP = ip;
    }

    getMainIP() {
        return this.mainIP;
    }

    getRTMPServerBaseURL() {
        return "rtmp://"+ this.config.get("dns.sendTo") + ":" + this.config.get("rtmp.port");
    }

    getStreams() {
        return this.streams;
    }

    onStreamsUpdated(callback) {
        this.streamsUpdatedCallbacks.push(callback);
    }

    startDNS() {
        console.log("starting DNS server");
        
        if (this.dnsRunning) {
            this.dnsProxyServer.stop();
        }
        this.dnsConfig = { host: this.config.get("dns.host"), port: this.config.get("dns.port"), domains: Object.fromEntries(this.config.get("dns.domains").map(d => [d, this.config.get("dns.sendTo")]))};
        
        this.dnsProxyServer = new DnsServer(this.dnsConfig);
        try {
            this.dnsProxyServer.run();
            this.dnsRunning = true;
        } catch(ex) {
            throw ex;
        }
    }

    checkDNSStatus(callback) {
        if (!this.config.get("dns.active")) {
            callback("disabled");
        } else {
            const { Resolver } = require("node:dns");
            const resolver = new Resolver();
            resolver.setServers([this.mainIP]);
            resolver.resolve4(this.config.get("dns.domains")[0], (err, addresses) => {
                callback(!err && addresses[0] == this.config.get("dns.sendTo") ? "ok" : "ko");
            });
        }
    }

    startRTMP() {
        console.log("starting RTMP server");
        if (this.rtmpRunning) {
            this.nodeMediaServer.stop();
        }
        this.nmsConfig = {
            logType: 3,
            rtmp: {
                port: this.config.get("rtmp.port"),
                chunk_size: 60000,
                gop_cache: true,
                ping: 30,
                ping_timeout: 60
            }
        };
        if (this.config.get("rtmp.http.active")) {
            this.nmsConfig.http = {
                port: this.config.get("rtmp.http.port"),
                allow_origin: "*"
            }
        }
        this.nodeMediaServer = new NodeMediaServer(this.nmsConfig);
        this.nodeMediaServer.on("postPublish", (id, streamPath, args) => {
            console.log("Receiving stream", `id=${id} StreamPath=${streamPath} args=${JSON.stringify(args)}`);
            this.streams.push(streamPath);
            // stream path looks like: /app/live_157929848_DWzeddUhYx6ST73aXI0YE3yO1vdy50
            this.streamsUpdatedCallbacks.forEach(fn => {
                fn(this.streams);
            });
        });
        this.nodeMediaServer.on("donePublish", (id, streamPath, args) => {
            console.log("Done with stream", `id=${id} StreamPath=${streamPath} args=${JSON.stringify(args)}`);
            this.streams = this.streams.filter(s => s != streamPath);
            this.streamsUpdatedCallbacks.forEach(fn => {
                fn(this.streams);
            });
        });
      
        try {
            this.nodeMediaServer.run();
            this.rtmpRunning = true;
        } catch(ex) {
            throw ex;
        }
    }
      
    checkRTMPStatus(callback) {
        if (!this.config.get("rtmp.active")) {
            callback("disabled");
        } else {
            if (this.rc) {
                this.rc.close();
            }
            this.rc = new RtmpClient(this.mainIP, this.config.get("rtmp.port"));
            this.rc.connect()
                .then(() => {this.rc.close(); callback("ok");})
                .catch((err) => {callback("ko");});
        }
    }

    start() {
        this.stop();
        if (this.config.get("dns.active")) {
            try {
                this.startDNS();
            } catch(ex) {
                console.error(ex);
            }
        }
        if (this.config.get("rtmp.active")) {
            try {
                this.startRTMP();
            } catch(ex) {
                console.error(ex);
            }
        }
    }

    stop() {
        if (this.config.get("dns.active") && this.dnsRunning) {
            console.log("stopping DNS server");
            this.dnsProxyServer.stop();
            this.dnsRunning = false;
        }
        if (this.config.get("rtmp.active") && this.rtmpRunning) {
            console.log("stopping RTMP server");
            this.nodeMediaServer.stop();
            this.rtmpRunning = false;
        }
    }

    checkStatus(callback) {
        this.checkDNSStatus((dnsStatus) => {
            this.checkRTMPStatus((rtmpStatus) => {
                callback({dnsStatus, rtmpStatus});
            });
        });
    }

}

module.exports = ConsoleStreamingServer;