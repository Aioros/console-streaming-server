const DnsServer = require("./dns-server.js");
const NodeMediaServer = require("node-media-server");
const { Client: RtmpClient } = require("rtmp-client");
const Arpping = require("arpping");

class ConsoleStreamingServer {
    constructor(config) {
        this.mainIP = "";
        this.networkInterfaceName = "";
        this.config = config;
        this.arpping = null;
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

    setNetworkInterfaceName(interfaceName) {
        this.networkInterfaceName = interfaceName;
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

    async findMAC(ip) {
        let mac;
        //let devices = this.config.get("devices") || {};
        let existingIP = Object.entries(this.config.get("devices") || {}).find(e => e[1].ip == ip);

        if (existingIP && (Date.now() - existingIP[1].lastARP) < 60 * 1000) {
            mac = existingIP[0];
        } else {
            // temporary device to avoid other scans while we find this MAC
            this.config.set(`devices.temp_${ip.replace(/\./g, "")}`, {ip, lastARP: Date.now()});

            let {hosts} = await this.arpping.ping([ip]).then(({hosts}) => {
                return this.arpping.arp(hosts);
            });
            if (hosts[0]?.mac) {
                mac = hosts[0]?.mac;
                if (this.config.get(`devices.${mac}`)) {
                    this.config.set(`devices.${mac}.ip`, ip);
                } else {
                    this.config.set(`devices.${mac}`, {ip});
                    let type = "generic";
                    try {
                        let ouiResponse = await fetch("https://www.macvendorlookup.com/api/v2/" + mac.replace(/-/g, ""));
                        let { company } = (await ouiResponse.json())[0];
                        if (company.toLowerCase().includes("sony")) {
                            type = "playstation";
                        } else if (company.toLowerCase().includes("microsoft")) {
                            type = "xbox";
                        }
                    } catch (ex) {}

                    this.config.set(`devices.${mac}.type`, type);
                    if (type == "generic") {
                        this.config.set(`devices.${mac}.title`, "Unknown Device");
                    } else if (type == "playstation") {
                        this.config.set(`devices.${mac}.title`, "Playstation (auto-detected)");
                    } else if (type == "playstation") {
                        this.config.set(`devices.${mac}.title`, "Xbox (auto-detected)");
                    }
                }
                this.config.set(`devices.${mac}.lastARP`, Date.now());
                this.config.delete(`devices.temp_${ip.replace(/\./g, "")}`);
            }

        }

        this.config.set(`devices.${mac}.lastMessageReceived`, Date.now());
        return mac;
    
    }

    startDNS() {
        console.log("starting DNS server");
        
        if (this.dnsRunning) {
            this.dnsProxyServer.stop();
        }
        this.dnsConfig = { host: this.config.get("dns.host"), port: this.config.get("dns.port"), domains: Object.fromEntries(this.config.get("dns.domains").map(d => [d, this.config.get("dns.sendTo")]))};
        
        this.dnsProxyServer = new DnsServer(this.dnsConfig);
        
        try {
            this.dnsProxyServer.onMessageReceived((message, rinfo) => {
                if (rinfo.address != this.mainIP) {
                    console.log("DNS request from: " + rinfo.address);
                    let mac = this.findMAC(rinfo.address).then((mac) => {
                        console.log("MAC: " + mac);
                    });
                }
            });
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
            if (!this.streams.includes(streamPath)) {
                this.streams.push(streamPath);
            }
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

        this.arpping = new Arpping({
            interfaceFilters: {
                interface: [this.networkInterfaceName],
                internal: [false],
                family: ["IPv4"]
            }
        });

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
            this.streams = [];
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