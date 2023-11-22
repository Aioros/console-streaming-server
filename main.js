const CssGUI = require("./gui.js");
const ConsoleStreamingServer = require("./console-streaming-server.js");

async function main() {
    const { default: Conf } = await import("conf");
    const { internalIpV4 } = await import("internal-ip");
    let internalIp = await internalIpV4();

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
        }
    };

    const config = new Conf({projectName: "consolestreamingserver", defaults: defaultConfig});

    var server = new ConsoleStreamingServer(config);
    server.setMainIP(internalIp);
    var gui = new CssGUI(server);

    gui.start();
}

main();