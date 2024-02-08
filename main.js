const CssGUI = require("./gui.js");
const ConsoleStreamingServer = require("./console-streaming-server.js");
const semver = require("semver");

async function getNetworkInfo() {
    try {
        const { internalIpV4 } = await import("internal-ip");
        const { gateway4async } = await import("default-gateway");
        const { contains } = await import("cidr-tools");
        const os = require("node:os");
        let internalIp = await internalIpV4();
        let defaultGateway = await gateway4async();
        let networkInterfaceName;
        for (let [name, addresses] of Object.entries(os.networkInterfaces())) {
            for (const {cidr} of addresses) {
                if (contains(cidr, defaultGateway.gateway)) {
                    networkInterfaceName = name;
                }
            }
        }
        return {internalIp, networkInterfaceName};
    } catch(ex) {
        return {internalIp: undefined, networkInterfaceName: undefined};
    }
}

async function main() {
    const { default: Conf } = await import("conf");
    let {internalIp, networkInterfaceName} = await getNetworkInfo();

    const defaultConfig = {
        dns: {
            active: true,
            host: "0.0.0.0",
            port: 53,
            domains: [
                "*.contribute.live-video.net",
                "live*.twitch.tv"
            ],
            sendTo: internalIp
        },
        rtmp: {
            active: true,
            port: 1935,
            http: {
                active: true,
                port: 8080
            }
        },
        devices: {}
    };

    const config = new Conf({projectName: "consolestreamingserver", defaults: defaultConfig});

    var server = new ConsoleStreamingServer(config);
    server.setMainIP(internalIp);
    server.setNetworkInterfaceName(networkInterfaceName);
    var gui = new CssGUI(server);
    let {version} = require('./package.json');
    server.setVersion(version);

    gui.start();

    try {
        let response = await fetch("https://api.github.com/repos/Aioros/console-streaming-server/releases/latest");
        let json = await response.json();
        let latestTag = json.tag_name.replace(/\w/, "");
        if (semver.gt(latestTag, version)) {
            gui.onUpdateAvailable(latestTag);
        }
    } catch(ex) {}

    setInterval(async () => {
        let newNetworkInfo = await getNetworkInfo();
        if (newNetworkInfo.internalIp && newNetworkInfo.internalIp != internalIp) {
            internalIp = newNetworkInfo.internalIp;
            networkInterfaceName = newNetworkInfo.networkInterfaceName;
            server.setMainIP(internalIp);
            server.setNetworkInterfaceName(networkInterfaceName);
            gui.onNetworkChange(newNetworkInfo);
        }
    }, 5000);
}

main();