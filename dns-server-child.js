#!/usr/bin/env node

const DnsProxyServer = require("@aiorosdev/dns-proxy-lib");
const io = require('socket.io')();

let config;

try {
    config = JSON.parse(Buffer.from(process.argv[3], "base64").toString("ascii"));
} catch(ex) {
    config = {};
}
console.log(config);

let dnsProxyServer = new DnsProxyServer(config);

io.on("connection", socket => {
    socket.on("request", (request, callback) => {
        if (request.command == "start") {
            dnsProxyServer.run();
            callback({status: "ok"});
        } else if (request.command == "stop") {
            dnsProxyServer.stop();
            io.close();
            callback({status: "ok"});
            process.exit();
        }
    });
});
io.listen(3000);
