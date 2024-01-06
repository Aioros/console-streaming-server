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

    start() {

        this.createMainWindow();
        
        const leftPane = new QT.QWidget();
        leftPane.setObjectName("left_pane");
        leftPane.setLayout(new QT.FlexLayout());

        const title = new QT.QLabel();
        title.setObjectName("title");
        title.setText("Console Streaming Server");
        leftPane.layout().addWidget(title);

        const tabs = new QT.QListWidget();
        tabs.setSpacing(20);
        const homeTab = new QT.QListWidgetItem("Home");
        homeTab.setIcon(new QT.QIcon("assets/icons/home.png"));
        tabs.addItem(homeTab);
        const instructionsTab = new QT.QListWidgetItem("Instructions")
        instructionsTab.setIcon(new QT.QIcon("assets/icons/instructions.png"));
        tabs.addItem(instructionsTab);
        const advancedTab = new QT.QListWidgetItem("Advanced");
        advancedTab.setIcon(new QT.QIcon("assets/icons/advanced.png"));
        tabs.addItem(advancedTab);
        leftPane.layout().addWidget(tabs);

        const rightPane = new QT.QWidget();
        rightPane.setObjectName("right_pane");
        rightPane.setLayout(new QT.FlexLayout());
        
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
        const homeText = new QT.QLabel();
        homeText.setObjectName("home_text");
        homeText.setText("Don't forget to set your console's primary DNS server as shown in the instructions tab!");

        const streamList = new QT.QWidget();
        streamList.setObjectName("stream_list");
        streamList.setLayout(new QT.FlexLayout());
        this.css.onStreamsUpdated((streams) => {
            if (streams.length == 0) {
                homeText.show();
            } else {
                homeText.hide();
            }
            streamList.children().filter(c => c.type == "widget").forEach(c => {
                streamList.layout().removeWidget(c);
            });
            streams.forEach((stream) => {
                let streamURL = this.css.getRTMPServerBaseURL() + stream;
                let streamLink = new QT.QLabel();
                streamLink.setTextFormat(QT.TextFormat.RichText);
                streamLink.setTextInteractionFlags(QT.TextInteractionFlag.TextBrowserInteraction);
                streamLink.setOpenExternalLinks(true);
                streamLink.setText("Active Stream: <a href=\"" + streamURL + "\">" + streamURL + "</a>");
                streamList.layout().addWidget(streamLink);
            });
        });

        homePage.layout().addWidget(serverStatus);
        homePage.layout().addWidget(serverStartButton);
        homePage.layout().addWidget(serverStopButton);
        homePage.layout().addWidget(homeText);
        homePage.layout().addWidget(streamList);

        const instructionsPage = new QT.QWidget();
        instructionsPage.setObjectName("instructions");
        instructionsPage.setLayout(new QT.FlexLayout());

        const tb = new QT.QTextBrowser();
        tb.setObjectName("instructions_html");
        tb.setOpenExternalLinks(true);
        tb.setHtml(`
            <h1>Standard Setup (recommended for most users)</h1>
            <p>In your console's network settings, change the Primary DNS to this device's IP address (${this.css.getMainIP()}).<br>
            Having a valid Secondary DNS is recommended to avoid connection issues when this server is offline; you could use the original Primary, or any other DNS server you might like (i.e. Google's 8.8.8.8 or Cloudflare's 1.1.1.1).</p>
            <p>For example, if you have a PS5:</p>
            <p><ul><li>From the home screen, go to "Settings" -> "Network" -> "Settings" -> "Set up internet connection"</li>
            <li>Move to your preferred connection and click the Option button to find the "Advanced settings" screen</li>
            <li>Change the Secondary DNS to your current Primary DNS or any other DNS you would like to use</li>
            <li>Change the Primary DNS to this server's address (${this.css.getMainIP()})</li></ul>
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
        `);

        const instructionsImageLabel = new QT.QLabel();
        const instructionsImage = new QT.QMovie();
        instructionsImage.setFileName("assets/images/instructions.gif");
        instructionsImage.start();
        instructionsImageLabel.setMovie(instructionsImage);
        instructionsPage.layout().addWidget(tb);
        
        const advancedPage = new QT.QWidget();
        advancedPage.setObjectName("advanced");
        advancedPage.setLayout(new QT.FlexLayout);
        const nodeMediaServerLink = new QT.QLabel();
        nodeMediaServerLink.setTextFormat(QT.TextFormat.RichText);
        nodeMediaServerLink.setTextInteractionFlags(QT.TextInteractionFlag.TextBrowserInteraction);
        nodeMediaServerLink.setOpenExternalLinks(true);
        nodeMediaServerLink.setText("<a href=\"http://" + this.css.getConfig().get("dns.sendTo") + ":" + this.css.getConfig().get("rtmp.http.port") + "/admin\">Open NodeMediaServer admin page</a>");
        if (!this.css.getConfig().get("rtmp.http")) {
            nodeMediaServerLink.setDisabled(true);
        }
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
        pages.addWidget(advancedPage);

        tabs.addEventListener("currentTextChanged", (tabName) => {
            switch (tabName) {
                case "Home":
                    pages.setCurrentIndex(0);
                    break;
                case "Instructions":
                    pages.setCurrentIndex(1);
                    break;
                case "Advanced":
                    pages.setCurrentIndex(2);
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

            #left_pane #title {
                font-size: 22pt;
                padding: 10px;
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
                margin: auto 30px;
            }
            #right_pane #home #server_status QLabel {
                font-size: 14pt;
            }

            #right_pane #home QPushButton {
                width: 200px;
                font-size: 14pt;
            }

            #right_pane #home #home_text {
                margin-top: 30px;
            }

            #right_pane #home #stream_list {
                margin-top: 30px;
            }
            
            #right_pane #instructions #instructions_html {
                flex: 1;
                border: none;
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