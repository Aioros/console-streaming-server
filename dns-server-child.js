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
    socket.on("requestStart", () => {
        console.log("requestStart received");
        dnsProxyServer.run();
    });
    socket.on("requestStop", () => {
        console.log("requestStop received");
        dnsProxyServer.stop();
        io.close();
    });
});
io.listen(3000);
