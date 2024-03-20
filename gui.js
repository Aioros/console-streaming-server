const QT = require("@nodegui/nodegui");

class CssGUI {
    constructor(css) {
        this.css = css;
    }

    createMainWindow() {
        this.win = new QT.QMainWindow();
        this.win.setWindowTitle("Console Streaming Server");
        this.win.setWindowIcon(new QT.QIcon("assets/icons/console-streaming-server.png"));

        const rootLayout = new QT.FlexLayout();

        this.centralWidget = new QT.QWidget();
        this.centralWidget.setObjectName("main");
        this.centralWidget.setLayout(rootLayout);

        this.win.setCentralWidget(this.centralWidget);

        this.win.addEventListener(QT.WidgetEventTypes.Close, () => {
            this.css.stop();
            if (this.serverCheckInterval) {
                clearInterval(this.serverCheckInterval);
            }
        });
    }

    createDeviceDialog(deviceObj, show = false) {
        if (!this.deviceDialog) {
            this.deviceDialog = new QT.QDialog();
            this.deviceDialog.setObjectName("device_dialog");
            this.deviceDialog.setParent(this.win);
            this.deviceDialog.setWindowFlag(QT.WindowType.Dialog, true);
            this.deviceDialog.setWindowTitle("Edit Device");
            this.deviceDialog.setModal(true);
            this.deviceDialog.setLayout(new QT.FlexLayout());

            this.deviceDialog.deviceIcon = new QT.QLabel();
            this.deviceDialog.deviceIcon.setObjectName("device_icon_label");
            this.deviceDialog.deviceIcon.pixMap = new QT.QPixmap();
            this.deviceDialog.deviceIcon.pixMap.load(`assets/icons/device-type-generic.png`);
            this.deviceDialog.deviceIcon.setPixmap(this.deviceDialog.deviceIcon.pixMap);
            this.deviceDialog.deviceIcon.setScaledContents(true);

            this.deviceDialog.deviceTitleLabel = new QT.QLabel();
            this.deviceDialog.deviceTitleLabel.setText("Title");
            this.deviceDialog.deviceTitle = new QT.QLineEdit();
            this.deviceDialog.deviceTitleField = new QT.QWidget();
            this.deviceDialog.deviceTitleField.setLayout(new QT.FlexLayout());
            this.deviceDialog.deviceTitleField.setProperty("class", "dialog-field");
            this.deviceDialog.deviceTitleField.layout().addWidget(this.deviceDialog.deviceTitleLabel);
            this.deviceDialog.deviceTitleField.layout().addWidget(this.deviceDialog.deviceTitle);

            this.deviceDialog.deviceTypeLabel = new QT.QLabel();
            this.deviceDialog.deviceTypeLabel.setText("Type");
            this.deviceDialog.deviceType = new QT.QComboBox();
            this.deviceDialog.deviceType.addItem(undefined, "Generic", new QT.QVariant("generic"));
            this.deviceDialog.deviceType.addItem(undefined, "PlayStation", new QT.QVariant("playstation"));
            this.deviceDialog.deviceType.addItem(undefined, "Xbox", new QT.QVariant("xbox"));
            this.deviceDialog.deviceType.addEventListener("currentIndexChanged", (index) => {
                this.deviceDialog.deviceIcon.pixMap.load(`assets/icons/device-type-${this.deviceDialog.deviceType.itemData(index).toString()}.png`);
                this.deviceDialog.deviceIcon.setPixmap(this.deviceDialog.deviceIcon.pixMap);
            });
            this.deviceDialog.deviceTypeField = new QT.QWidget();
            this.deviceDialog.deviceTypeField.setLayout(new QT.FlexLayout());
            this.deviceDialog.deviceTypeField.setProperty("class", "dialog-field");
            this.deviceDialog.deviceTypeField.layout().addWidget(this.deviceDialog.deviceTypeLabel);
            this.deviceDialog.deviceTypeField.layout().addWidget(this.deviceDialog.deviceType);

            this.deviceDialog.deviceMAC = new QT.QLabel();
            this.deviceDialog.deviceIP = new QT.QLabel();

            this.deviceDialog.okButton = new QT.QPushButton();
            this.deviceDialog.okButton.setText("Ok");
            this.deviceDialog.okButton.addEventListener("clicked", () => {
                if (this.deviceDialog.deviceId) {
                    this.css.config.set({
                        [`devices.${this.deviceDialog.deviceId}.title`]: this.deviceDialog.deviceTitle.text(),
                        [`devices.${this.deviceDialog.deviceId}.type`]: this.deviceDialog.deviceType.itemData(this.deviceDialog.deviceType.currentIndex()).toString()
                    });
                }
                this.deviceDialog.accept();
            });
            this.deviceDialog.okButton.setDefault(true);
            this.deviceDialog.cancelButton = new QT.QPushButton();
            this.deviceDialog.cancelButton.setText("Cancel");
            this.deviceDialog.cancelButton.setAutoDefault(false);
            this.deviceDialog.cancelButton.addEventListener("clicked", () => {this.deviceDialog.reject();});
            this.deviceDialog.buttonsRow = new QT.QWidget();
            this.deviceDialog.buttonsRow.setLayout(new QT.FlexLayout());
            this.deviceDialog.buttonsRow.setProperty("class", "buttons-row");
            this.deviceDialog.buttonsRow.layout().addWidget(this.deviceDialog.okButton);
            this.deviceDialog.buttonsRow.layout().addWidget(this.deviceDialog.cancelButton);

            this.deviceDialog.layout().addWidget(this.deviceDialog.deviceIcon);
            this.deviceDialog.layout().addWidget(this.deviceDialog.deviceTitleField);
            this.deviceDialog.layout().addWidget(this.deviceDialog.deviceTypeField);
            this.deviceDialog.layout().addWidget(this.deviceDialog.deviceMAC);
            this.deviceDialog.layout().addWidget(this.deviceDialog.deviceIP);
            this.deviceDialog.layout().addWidget(this.deviceDialog.buttonsRow);

            this.deviceDialog.setStyleSheet(
                `
                #device_dialog {
                    padding: 10px;
                    width: 300px;
                    height: 250px;
                }
                #device_icon_label {
                    width: 140px;
                    height: 100px;
                    margin-left: 40px;
                }
                .dialog-field {
                    flex-direction: row;
                    margin-bottom: 4px;
                }
                .dialog-field QLabel {
                    width: 50px;
                }
                .dialog-field QLineEdit {
                    width: 200px;
                }
                .buttons-row {
                    margin-top: 20px;
                    flex-direction: row;
                }
                `
            );
        }
        if (deviceObj) {
            let device = Object.values(deviceObj)[0];
            device.mac = Object.keys(deviceObj)[0];
            this.deviceDialog.deviceId = device.mac;
            this.deviceDialog.deviceIcon.pixMap.load(`assets/icons/device-type-${device.type}.png`);
            this.deviceDialog.deviceTitle.setText(device.title);
            for (let i=0; i<this.deviceDialog.deviceType.count(); i++) {
                if (this.deviceDialog.deviceType.itemData(i).toString() == device.type) {
                    this.deviceDialog.deviceType.setCurrentIndex(i);
                    break;
                }
            }
            this.deviceDialog.deviceType.setCurrentText(device.type);
            this.deviceDialog.deviceMAC.setText("MAC Address: " + device.mac);
            this.deviceDialog.deviceIP.setText("IP: " + device.ip);
        }
        
        if (show) {
            this.deviceDialog.show();
        }
    }

    refreshDevices(devices, deviceList) {
        deviceList.children().filter(c => c.type == "widget").forEach(c => {
            deviceList.layout().removeWidget(c);
            c.setParent(null);
        });
        for (let mac in devices) {
            let deviceItem = new QT.QWidget();
            deviceItem.setLayout(new QT.FlexLayout());
            deviceItem.setProperty("class", "device-item");
            let deviceLabels = new QT.QWidget();
            deviceLabels.setLayout(new QT.FlexLayout());
            deviceLabels.setProperty("class", "device-labels");
            let deviceTitle = new QT.QLabel();
            deviceTitle.setText(devices[mac].title);
            deviceTitle.setProperty("class", "device-title");
            let deviceMAC = new QT.QLabel();
            deviceMAC.setText("MAC address: " + mac);
            let deviceIP = new QT.QLabel();
            deviceIP.setText("IP: " + devices[mac].ip);
            let deviceLastSeen = new QT.QLabel();
            deviceLastSeen.setText("Last seen on: " + new Date(devices[mac].lastMessageReceived).toString());
            let deviceType = new QT.QPushButton();
            deviceType.setIcon(new QT.QIcon(`assets/icons/device-type-${devices[mac].type}.png`));
            deviceType.setIconSize(new QT.QSize(48, 48));
            deviceType.addEventListener("clicked", () => {
                this.createDeviceDialog({[mac]: devices[mac]}, true);
            });
            deviceItem.layout().addWidget(deviceType);
            deviceLabels.layout().addWidget(deviceTitle);
            deviceLabels.layout().addWidget(deviceMAC);
            deviceLabels.layout().addWidget(deviceIP);
            deviceLabels.layout().addWidget(deviceLastSeen);
            deviceItem.layout().addWidget(deviceLabels);

            deviceList.layout().addWidget(deviceItem);
        }
    }

    refreshStreams(streams, streamList) {
        if (streams.length == 0) {
            this.homeText.show();
        } else {
            this.homeText.hide();
        }
        streamList.children().filter(c => c.type == "widget").forEach(c => {
            c.hide();
            streamList.layout().removeWidget(c);
            c.setParent(null);
        });
        let streamsTitle = new QT.QLabel();
        streamsTitle.setObjectName("streams_title");
        streamsTitle.setText("Active Streams");
        streams.forEach((stream) => {
            let streamURL = this.css.getRTMPServerBaseURL() + stream.streamPath;
            let device = this.css.config.get(`devices.${stream.mac}`);

            let streamItem = new QT.QWidget();
            streamItem.setProperty("class", "stream-item");
            streamItem.setLayout(new QT.FlexLayout());
            let streamDeviceIcon = new QT.QPushButton();
            streamDeviceIcon.setProperty("class", "device-icon");
            streamDeviceIcon.setIcon(new QT.QIcon(`assets/icons/device-type-${device ? device.type : "generic"}.png`));
            streamDeviceIcon.setIconSize(new QT.QSize(64, 64));
            if (device) {
                streamDeviceIcon.addEventListener("clicked", () => {
                    this.createDeviceDialog({[stream.mac]: device}, true);
                });
            }
            
            let streamLines = new QT.QWidget();
            streamLines.setLayout(new QT.FlexLayout());
            streamLines.setProperty("class", "device-lines");
            let streamDeviceTitle = new QT.QLabel();
            streamDeviceTitle.setText(device ? device.title : "Getting device information...");
            streamDeviceTitle.setProperty("class", "device-title");
            let streamLink = new QT.QLabel();
            streamLink.setTextFormat(QT.TextFormat.RichText);
            streamLink.setTextInteractionFlags(QT.TextInteractionFlag.TextBrowserInteraction);
            streamLink.setOpenExternalLinks(true);
            streamLink.setText("URL: <a href=\"" + streamURL + "\">" + streamURL + "</a>");
            let streamPreviewLink = new QT.QLabel();
            streamPreviewLink.setTextFormat(QT.TextFormat.RichText);
            streamPreviewLink.setTextInteractionFlags(QT.TextInteractionFlag.TextBrowserInteraction);
            streamPreviewLink.setOpenExternalLinks(true);
            let httpBaseURL = "http://" + this.css.getConfig().get("dns.sendTo") + ":" + this.css.getConfig().get("rtmp.http.port");
            streamPreviewLink.setText("<a href=\"" + httpBaseURL + "/player.html?streamURL=" + stream.streamPath + ".flv\">View in browser</a>");

            streamLines.layout().addWidget(streamDeviceTitle);
            streamLines.layout().addWidget(streamLink);
            if (this.css.getConfig().get("rtmp.http")) {
                streamLines.layout().addWidget(streamPreviewLink);
            }

            streamItem.layout().addWidget(streamDeviceIcon);
            streamItem.layout().addWidget(streamLines);
            streamList.layout().addWidget(streamsTitle);
            streamList.layout().addWidget(streamItem);
        });
    }

    onUpdateAvailable(latestVersion) {
        this.updateAlert.setText(`There's a <a href="https://github.com/Aioros/console-streaming-server/releases/latest/download/ConsoleStreamingServer.zip" style="color: white">new version</a> of Console Streaming Server available (v${latestVersion}).`);
        this.updateAlert.show();
    }

    onNetworkChange(networkInfo) {
        const networkChangeDialog = new QT.QMessageBox();
        networkChangeDialog.setWindowTitle("Network change detected");
        networkChangeDialog.setText("There was a change in your network setup. The server will restart.");
        let text = "";
        if (this.css.config.get("dns.active") && this.css.config.get("rtmp.active")) {
            text += "<p>Do you want to automatically update internal settings to the new IP (" + networkInfo.internalIp + ")?</p>";
            text += "<p>You will still need to update your console's DNS and the stream URL in your other applications like OBS.</p>";
        } else if (this.css.config.get("dns.active") ) {
            text += "<p>You will need to change your console's primary DNS to the new IP (" + networkInfo.internalIp + ").</p>";
        } else if (this.css.config.get("rtmp.active")) {
            text += "<p>Make sure to send your broadcasts to the new IP (" + networkInfo.internalIp + ").</p>";
        }
        networkChangeDialog.setInformativeText(text);
        if (this.css.config.get("dns.active") && this.css.config.get("rtmp.active")) {
            const cancel = new QT.QPushButton();
            cancel.setText("No, keep my settings");
            networkChangeDialog.addButton(cancel, QT.ButtonRole.RejectRole);
        }
        const accept = new QT.QPushButton();
        if (this.css.config.get("dns.active") && this.css.config.get("rtmp.active")) {
            accept.setText("Autoupdate settings");
        } else {
            accept.setText("Ok");
        }
        networkChangeDialog.addButton(accept, QT.ButtonRole.AcceptRole);
        let answer = networkChangeDialog.exec();
        switch (answer) {
            case QT.DialogCode.Rejected:
                break;
            case QT.DialogCode.Accepted:
                if (this.css.config.get("dns.active") && this.css.config.get("rtmp.active")) {
                    this.css.config.set("dns.sendTo", networkInfo.internalIp)
                }
                break;
        }

        this.instructionsBrowser.setHtml(this.getInstructionsHTML(this.css.getMainIP()));

        if (this.css.dnsRunning || this.css.rtmpRunning) {
            this.css.start();
        }
    }

    getInstructionsHTML(mainIP) {
        return `
            <h1>Standard Setup (recommended for most users)</h1>
            <p>In your console's network settings, change the Primary DNS to this device's IP address (${mainIP}).<br>
            Having a valid Secondary DNS is recommended to avoid connection issues when this server is offline; you could use the original Primary, or any other DNS server you might like (i.e. Google's 8.8.8.8 or Cloudflare's 1.1.1.1).</p>
            <p>For example, if you have a PS5:</p>
            <p><ul><li>From the home screen, go to "Settings" -> "Network" -> "Settings" -> "Set up internet connection"</li>
            <li>Move to your preferred connection and click the Option button to find the "Advanced settings" screen</li>
            <li>Change the Secondary DNS to your current Primary DNS or any other DNS you would like to use</li>
            <li>Change the Primary DNS to this server's address (${mainIP})</li></ul>
            <p>Now you can just start the server; when you start a stream to Twitch from your console, the stream will actually be sent and published to this device.</p>
            <p>From there, you're free to do whatever you want with your stream. If you use OBS, for example, you can copy the stream URL from the home page and add it to your scene as a Media Source (see below for <a href="#obs">OBS-specific instructions</a>).
            You can then alter your scene to your liking, add your favorite overlays, and restream to Twitch or anywhere you want.</p>
            <h1>How it works</h1>
            <p>Console Streaming Server is made of two core parts: a DNS server and an RTMP server. When a console tries to stream to Twitch, it tries to connect to what is called an RTMP ingest server and send it an RTMP stream.</p>
            <p>In order to do that, it makes a DNS request to get the IP address of the ingest server. By changing the primary DNS of the console, this request gets processed by a small, custom DNS server that replaces that IP with your own.</p>
            <p>The stream from the console is then received by the custom RTMP server, and is available in your network for any kind of processing.</p>
            <p>You can also choose to run only the DNS part or the RTMP part (see <a href="#advanced">Advanced Setup</a> below). This can be useful if you already have a DNS or RTMP server, or if you want to run them in separate machines.</p>
            <h1 id="advanced">Advanced Setup</h1>
            <p>In the "Advanced" tab, you can choose one of three modes: "Standard" is the default one, with both servers active on the same machine. But you can also decide, for example, that you want the DNS server on one device and the RTMP server on a more performant one.<br>
            In that case, you would run the application on both machines, selecting "DNS Server Only" on the former, and "RTMP Server Only" on the latter. When you choose "DNS Only", make sure to also indicate the IP address of the separate RTMP server.<br>
            The network setup on the console would not change: you would still only need to point the Primary DNS to wherever the DNS server is running.</p>
            <h1 id="obs">OBS Instructions</h1>
            <p>Once everything is setup and Console Streaming Server receives a stream, you will see a link in the home page. If you want to add the stream to a scene in OBS, you can create a new Media Source with the following settings:</p>
            <ul><li>Local File: Off</li>
            <li>Input: the stream link from the server's home page (it will be something like <i>rtmp://&lt;youripaddress&gt;/app/&lt;yourstreamkey&gt;</i>)</li>
            <li>Input Format: rtmp</li></ul>
            <h1>FAQ</h1>
            <h2>What about every other service beside Twitch?</h2>
            <p>At the moment, Twitch is the only supported streaming service, since it's easily the most used. But this doesn't mean that you can only use Console Streaming Server to stream to Twitch! Instead, it means that the "trick" only works
            if you choose Twitch when you start streaming from the console, but once it's captured you can use your tools to restream it wherever you want (but other built-in console integrations, like chat messages and viewers count, will not work).</p>
        `
    }

    start() {

        this.createMainWindow();
        
        const leftPane = new QT.QWidget();
        leftPane.setObjectName("left_pane");
        leftPane.setLayout(new QT.FlexLayout());

        const title = new QT.QLabel();
        title.setObjectName("title");
        title.setText("Console Streaming Server");
        leftPane.layout().addWidget(title);

        const version = new QT.QLabel();
        version.setObjectName("version");
        version.setText("v" + this.css.getVersion());
        version.setAlignment(QT.AlignmentFlag.AlignRight);
        leftPane.layout().addWidget(version);

        const tabs = new QT.QListWidget();
        tabs.setSpacing(20);
        const homeTab = new QT.QListWidgetItem("Home");
        homeTab.setIcon(new QT.QIcon("assets/icons/home.png"));
        tabs.addItem(homeTab);
        const instructionsTab = new QT.QListWidgetItem("Instructions")
        instructionsTab.setIcon(new QT.QIcon("assets/icons/instructions.png"));
        tabs.addItem(instructionsTab);
        const devicesTab = new QT.QListWidgetItem("Devices")
        devicesTab.setIcon(new QT.QIcon("assets/icons/device-type-generic.png"));
        tabs.addItem(devicesTab);
        const advancedTab = new QT.QListWidgetItem("Advanced");
        advancedTab.setIcon(new QT.QIcon("assets/icons/advanced.png"));
        tabs.addItem(advancedTab);
        leftPane.layout().addWidget(tabs);

        const rightPane = new QT.QWidget();
        rightPane.setObjectName("right_pane");
        rightPane.setLayout(new QT.FlexLayout());

        this.updateAlert = new QT.QLabel();
        this.updateAlert.setObjectName("update_alert");
        this.updateAlert.setTextFormat(QT.TextFormat.RichText);
        this.updateAlert.setTextInteractionFlags(QT.TextInteractionFlag.TextBrowserInteraction);
        this.updateAlert.setOpenExternalLinks(true);
        this.updateAlert.hide();

        rightPane.layout().addWidget(this.updateAlert);
        
        const pages = new QT.QStackedWidget();
        pages.setObjectName("pages");

        const homePage = new QT.QWidget();
        homePage.setObjectName("home");
        homePage.setLayout(new QT.FlexLayout());
        homePage.setInlineStyle('align-items:"center";');
        const serverStatus = new QT.QWidget();
        serverStatus.setObjectName("server_status");
        serverStatus.setLayout(new QT.FlexLayout());
        const serverCheckLabelImage = new QT.QLabel();
        const serverCheckImage = new QT.QPixmap();
        serverCheckImage.load("assets/icons/status-ko.png");
        serverCheckLabelImage.setPixmap(serverCheckImage);
        serverCheckLabelImage.setScaledContents(true);
        serverCheckLabelImage.setInlineStyle("width: 48px; height: 48px;");
        const serverCheckLabel = new QT.QLabel();
        serverCheckLabel.setText("Server Offline");
        serverCheckLabel.setInlineStyle("margin-left: 8px;");
        serverStatus.layout().addWidget(serverCheckLabelImage);
        serverStatus.layout().addWidget(serverCheckLabel);
        this.serverCheckInterval = setInterval(() => {
            this.css.checkStatus((status) => {
                if (status.dnsStatus != "ko" && status.rtmpStatus != "ko" ) {
                    serverCheckImage.load("assets/icons/status-ok.png");
                    serverCheckLabel.setText("Server Online");
                    serverStartButton.setDisabled(true);
                    serverStopButton.setDisabled(false);
                    loadingStartMovie.stop();
                    serverStartButton.setIcon(new QT.QIcon("assets/icons/start.png"));
                } else {
                    serverCheckImage.load("assets/icons/status-ko.png");
                    serverCheckLabel.setText("Server Offline");
                    serverStartButton.setDisabled(false);
                    serverStopButton.setDisabled(true);
                    loadingStopMovie.stop();
                    serverStopButton.setIcon(new QT.QIcon("assets/icons/stop.png"));
                }
                serverCheckLabelImage.setPixmap(serverCheckImage);
            });
        }, 5000);
        const serverStartButton = new QT.QPushButton();
        serverStartButton.setText("   Start");
        serverStartButton.setIcon(new QT.QIcon("assets/icons/start.png"));
        let loadingStartMovie = new QT.QMovie();
        loadingStartMovie.setFileName("assets/icons/loading.gif");
        loadingStartMovie.addEventListener("frameChanged", () => {
            serverStartButton.setIcon(new QT.QIcon(loadingStartMovie.currentPixmap()));
        });
        serverStartButton.addEventListener("clicked", () => {
            this.css.start();
            serverStartButton.setDisabled(true);
            loadingStartMovie.start();
        });
        const serverStopButton = new QT.QPushButton();
        serverStopButton.setText("   Stop");
        serverStopButton.setIcon(new QT.QIcon("assets/icons/stop.png"));
        let loadingStopMovie = new QT.QMovie();
        loadingStopMovie.setFileName("assets/icons/loading.gif");
        loadingStopMovie.addEventListener("frameChanged", () => {
            serverStopButton.setIcon(new QT.QIcon(loadingStopMovie.currentPixmap()));
        });
        serverStopButton.setDisabled(true);
        serverStopButton.addEventListener("clicked", () => {
            this.css.stop();
            serverStopButton.setDisabled(true);
            loadingStopMovie.start();
        });
        this.homeText = new QT.QLabel();
        this.homeText.setObjectName("home_text");
        this.homeText.setText("Don't forget to set your console's primary DNS server as shown in the instructions tab!");

        const streamList = new QT.QWidget();
        streamList.setObjectName("stream_list");
        streamList.setLayout(new QT.FlexLayout());
        this.css.onStreamsUpdated((streams) => {
            this.refreshStreams(streams, streamList);
        });

        homePage.layout().addWidget(serverStatus);
        homePage.layout().addWidget(serverStartButton);
        homePage.layout().addWidget(serverStopButton);
        homePage.layout().addWidget(this.homeText);
        homePage.layout().addWidget(streamList);

        const instructionsPage = new QT.QWidget();
        instructionsPage.setObjectName("instructions");
        instructionsPage.setLayout(new QT.FlexLayout());

        this.instructionsBrowser = new QT.QTextBrowser();
        this.instructionsBrowser.setObjectName("instructions_html");
        this.instructionsBrowser.setOpenExternalLinks(true);
        this.instructionsBrowser.setHtml(this.getInstructionsHTML(this.css.getMainIP()));

        const instructionsImageLabel = new QT.QLabel();
        const instructionsImage = new QT.QMovie();
        instructionsImage.setFileName("assets/images/instructions.gif");
        instructionsImage.start();
        instructionsImageLabel.setMovie(instructionsImage);
        instructionsPage.layout().addWidget(this.instructionsBrowser);

        const devicesPage = new QT.QWidget();
        devicesPage.setObjectName("devices");
        devicesPage.setLayout(new QT.FlexLayout());
        const deviceList = new QT.QWidget();
        deviceList.setObjectName("device_list");
        deviceList.setLayout(new QT.FlexLayout());
        this.refreshDevices(this.css.config.get("devices"), deviceList);
        this.css.config.onDidChange("devices", (devices) => {
            this.refreshDevices(devices, deviceList);
            this.refreshStreams(this.css.getStreams(), streamList);
        });
        devicesPage.layout().addWidget(deviceList);
        
        const advancedPage = new QT.QWidget();
        advancedPage.setObjectName("advanced");
        advancedPage.setLayout(new QT.FlexLayout());
        const nodeMediaServerLink = new QT.QLabel();
        nodeMediaServerLink.setTextFormat(QT.TextFormat.RichText);
        nodeMediaServerLink.setTextInteractionFlags(QT.TextInteractionFlag.TextBrowserInteraction);
        nodeMediaServerLink.setOpenExternalLinks(true);
        nodeMediaServerLink.setText("<a href=\"http://" + this.css.getConfig().get("dns.sendTo") + ":" + this.css.getConfig().get("rtmp.http.port") + "/admin\">Open NodeMediaServer admin page</a>");
        if (!this.css.getConfig().get("rtmp.http")) {
            nodeMediaServerLink.setDisabled(true);
        }
        this.css.config.onDidChange("dns.sendTo", (sendTo) => {
            nodeMediaServerLink.setText("<a href=\"http://" + sendTo + ":" + this.css.getConfig().get("rtmp.http.port") + "/admin\">Open NodeMediaServer admin page</a>");
        });
        const modeField = new QT.QWidget();
        modeField.setLayout(new QT.FlexLayout());
        modeField.setProperty("class", "advanced-form-field");
        const modeLabel = new QT.QLabel();
        modeLabel.setText("Mode");
        const modeSelector = new QT.QComboBox();
        modeSelector.addItem(undefined, "Standard (DNS + RTMP server)", new QT.QVariant("standard"));
        modeSelector.addItem(undefined, "DNS server only", new QT.QVariant("dnsonly"));
        modeSelector.addItem(undefined, "RTMP server only", new QT.QVariant("rtmponly"));
        modeSelector.addEventListener("currentIndexChanged", (index) => {
            let config = this.css.getConfig();
            if (modeSelector.itemData(index).toString() == "standard") {
                config.set("dns.active", true);
                config.set("rtmp.active", true);
            } else if (modeSelector.itemData(index).toString() == "dnsonly") {
                config.set("dns.active", true);
                config.set("rtmp.active", false);
            } else if (modeSelector.itemData(index).toString() == "rtmponly") {
                config.set("dns.active", false);
                config.set("rtmp.active", true);
            }
        });
        modeField.layout().addWidget(modeLabel);
        modeField.layout().addWidget(modeSelector);
        const dnsPortField = new QT.QWidget();
        dnsPortField.setLayout(new QT.FlexLayout());
        dnsPortField.setProperty("class", "advanced-form-field");
        const dnsPortLabel = new QT.QLabel();
        dnsPortLabel.setText("DNS Port");
        const dnsPortInput = new QT.QLineEdit();
        dnsPortInput.setInputMask("99000");
        dnsPortInput.setText(this.css.config.get("dns.port"));
        dnsPortInput.addEventListener("textEdited", (newText) => {
            this.css.getConfig().set("dns.port", parseInt(newText));
        });
        dnsPortField.layout().addWidget(dnsPortLabel);
        dnsPortField.layout().addWidget(dnsPortInput);
        const dnsSendToField = new QT.QWidget();
        dnsSendToField.setLayout(new QT.FlexLayout());
        dnsSendToField.setProperty("class", "advanced-form-field");
        const dnsSendToLabel = new QT.QLabel();
        dnsSendToLabel.setText("RTMP Server Location");
        const dnsSendToInput = new QT.QLineEdit();
        dnsSendToInput.setText(this.css.config.get("dns.sendTo"));
        dnsSendToInput.addEventListener("textEdited", (newText) => {
            this.css.getConfig().set("dns.sendTo", newText);
        });
        this.css.config.onDidChange("dns.sendTo", (sendTo) => {
            dnsSendToInput.setText(sendTo);
        });
        dnsSendToField.layout().addWidget(dnsSendToLabel);
        dnsSendToField.layout().addWidget(dnsSendToInput);
        const rtmpPortField = new QT.QWidget();
        rtmpPortField.setLayout(new QT.FlexLayout());
        rtmpPortField.setProperty("class", "advanced-form-field");
        const rtmpPortLabel = new QT.QLabel();
        rtmpPortLabel.setText("RTMP Port");
        const rtmpPortInput = new QT.QLineEdit();
        rtmpPortInput.setInputMask("99000");
        rtmpPortInput.setText(this.css.config.get("rtmp.port"));
        rtmpPortInput.addEventListener("textEdited", (newText) => {
            this.css.getConfig().set("rtmp.port", parseInt(newText));
        });
        rtmpPortField.layout().addWidget(rtmpPortLabel);
        rtmpPortField.layout().addWidget(rtmpPortInput);
        const rtmpHttpField = new QT.QWidget();
        rtmpHttpField.setLayout(new QT.FlexLayout());
        rtmpHttpField.setProperty("class", "advanced-form-field");
        const rtmpHttpLabel = new QT.QLabel();
        rtmpHttpLabel.setText("Include RTMP/HTTP Server");
        const rtmpHttpInput = new QT.QCheckBox();
        rtmpHttpInput.setChecked(this.css.config.get("rtmp.http.active"));
        rtmpHttpInput.addEventListener("stateChanged", (newState) => {
            this.css.getConfig().set("rtmp.http.active", !!newState);
        });
        rtmpHttpField.layout().addWidget(rtmpHttpLabel);
        rtmpHttpField.layout().addWidget(rtmpHttpInput);
        const rtmpHttpPortField = new QT.QWidget();
        rtmpHttpPortField.setLayout(new QT.FlexLayout());
        rtmpHttpPortField.setProperty("class", "advanced-form-field");
        const rtmpHttpPortLabel = new QT.QLabel();
        rtmpHttpPortLabel.setText("HTTP Port");
        const rtmpHttpPortInput = new QT.QLineEdit();
        rtmpHttpPortInput.setInputMask("99000");
        rtmpHttpPortInput.setText(this.css.config.get("rtmp.http.port"));
        rtmpHttpPortInput.addEventListener("textEdited", (newText) => {
            this.css.getConfig().set("rtmp.http.port", parseInt(newText));
        });
        rtmpHttpPortField.layout().addWidget(rtmpHttpPortLabel);
        rtmpHttpPortField.layout().addWidget(rtmpHttpPortInput);
        const serverRestartButton = new QT.QPushButton();
        serverRestartButton.setText("Restart Server");
        serverRestartButton.addEventListener("clicked", this.css.start.bind(this.css));
        advancedPage.layout().addWidget(modeField);
        advancedPage.layout().addWidget(dnsPortField);
        advancedPage.layout().addWidget(dnsSendToField);
        advancedPage.layout().addWidget(rtmpPortField);
        advancedPage.layout().addWidget(rtmpHttpField);
        advancedPage.layout().addWidget(rtmpHttpPortField);
        advancedPage.layout().addWidget(serverRestartButton);
        advancedPage.layout().addWidget(nodeMediaServerLink);

        pages.addWidget(homePage);
        pages.addWidget(instructionsPage);
        pages.addWidget(devicesPage);
        pages.addWidget(advancedPage);

        tabs.addEventListener("currentTextChanged", (tabName) => {
            switch (tabName) {
                case "Home":
                    pages.setCurrentIndex(0);
                    break;
                case "Instructions":
                    pages.setCurrentIndex(1);
                    break;
                case "Devices":
                    pages.setCurrentIndex(2);
                    break;
                case "Advanced":
                    pages.setCurrentIndex(3);
                    break;
            }
        });

        rightPane.layout().addWidget(pages);

        this.centralWidget.layout().addWidget(leftPane);
        this.centralWidget.layout().addWidget(rightPane);

        this.centralWidget.setStyleSheet(`
            #main {
                width: 1280px;
                height: 720px;
                flex: 1;
                flex-direction: row;
                background-color: white;
            }
            #left_pane {
                flex: 0 0 min-content;
                border-right: 1px solid #ddd;
            }

            #update_alert {
                background-color: rgb(107,190,102);
                color: white;
                font-weight: bold;
                margin: 10px;
                padding: 4px;
                border-radius: 4px;
            }

            #update_alert a {
                color: white;
            }

            #left_pane #title {
                font-size: 22pt;
                padding: 10px 10px 0;
            }

            #left_pane #version {
                font-size: 14pt;
                padding: 0 10px 10px;
            }

            #left_pane QListWidget {
                flex: 1;
                font-size: 14pt;
                border: none;
            }

            #left_pane QListWidget::item {
                
            }
            #left_pane QListWidget::item:selected {
                
            }

            #right_pane {
                flex: 2;
                padding: 20px;
            }

            #right_pane #pages {
                flex: 1;
            }

            #right_pane #home #server_status {
                margin: 20px auto 20px;
            }
            #right_pane #home #server_status QLabel {
                font-size: 14pt;
            }

            #right_pane #home QPushButton {
                width: 200px;
                font-size: 14pt;
            }

            #right_pane #home #home_text {
                margin-top: 20px;
            }

            #right_pane #home #streams_title {
                font-weight: bold;
                font-size: 14pt;
                margin-bottom: 10px;
            }

            #right_pane .stream-item {
                flex-direction: row;
            }

            #right_pane .stream-item .device-icon {
                max-width: 90px;
                height: 80px;
                margin-right: 10px;
            }

            #right_pane .stream-item .device-title {
                font-weight: bold;
            }

            #right_pane .stream-item .device-lines {
                height: 80px;
                padding-top: 20px;
            }
            
            #right_pane #instructions #instructions_html {
                flex: 1;
                border: none;
            }

            #right_pane #device_list .device-item {
                flex-direction: row;
                margin-bottom: 10px;
            }

            #right_pane #device_list .device-item QPushButton {
                height: 72px;
                width: 80px;
                margin-right: 8px;
            }

            #right_pane #device_list .device-item .device-title {
                font-weight: bold;
                font-size: 14pt;
            }

            #right_pane .advanced-form-field {
                flex-direction: row;
            }

            #right_pane .advanced-form-field QLabel {
                width: 200px;
            }

            #right_pane #advanced QPushButton {
                width: 160px;
                height: 60px;
                margin: 10px;
            }

            #server_status {
                flex-direction: row;
            }
        `);
        
        this.win.show();
        global.win = this.win;
    }
}

module.exports = CssGUI;