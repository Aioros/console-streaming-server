const QT = require("@nodegui/nodegui");

class CssGUI {
    constructor(css) {
        this.css = css;
    }

    createMainWindow() {
        this.win = new QT.QMainWindow();
        this.win.setWindowTitle("Console Streaming Server");

        const rootLayout = new QT.FlexLayout();

        this.centralWidget = new QT.QWidget();
        this.centralWidget.setObjectName("main");
        this.centralWidget.setLayout(rootLayout);

        this.win.setCentralWidget(this.centralWidget);
        /*this.win.setStyleSheet(
        `
            #main {
            background-color: #009688;
            height: '100%';
            align-items: 'center';
            justify-content: 'center';
            }
            #mylabel {
            font-size: 16px;
            font-weight: bold;
            padding: 1;
            }
        `
        );*/

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
        title.setText("Console Streaming Server");
        leftPane.layout().addWidget(title);

        const tabs = new QT.QListWidget();
        const homeTab = new QT.QListWidgetItem("Home");
        tabs.addItem(homeTab);
        tabs.addItem(new QT.QListWidgetItem("Instructions"));
        tabs.addItem(new QT.QListWidgetItem("Advanced"));
        leftPane.layout().addWidget(tabs);

        const rightPane = new QT.QWidget();
        rightPane.setObjectName("right_pane");
        rightPane.setLayout(new QT.FlexLayout());
        
        const pages = new QT.QStackedWidget();

        const homePage = new QT.QWidget();
        homePage.setLayout(new QT.FlexLayout());
        const serverStatus = new QT.QWidget();
        serverStatus.setObjectName("server_status");
        serverStatus.setLayout(new QT.FlexLayout());
        const serverCheckLabelImage = new QT.QLabel();
        const serverCheckImage = new QT.QPixmap();
        serverCheckImage.load("red-circle-icon.png");
        serverCheckLabelImage.setPixmap(serverCheckImage);
        serverCheckLabelImage.setScaledContents(true);
        serverCheckLabelImage.setInlineStyle("width: 16px; height: 16px");
        const serverCheckLabel = new QT.QLabel();
        serverCheckLabel.setText("Server Offline");
        serverStatus.layout().addWidget(serverCheckLabelImage);
        serverStatus.layout().addWidget(serverCheckLabel);
        this.serverCheckInterval = setInterval(() => {
            this.css.checkStatus((status) => {
                if (status.dnsStatus != "ko" && status.rtmpStatus != "ko" ) {
                    serverCheckImage.load("green-circle-icon.png");
                    serverCheckLabel.setText("Server Online");
                    serverStartButton.setDisabled(true);
                    serverStopButton.setDisabled(false);
                } else {
                    serverCheckImage.load("red-circle-icon.png");
                    serverCheckLabel.setText("Server Offline");
                    serverStartButton.setDisabled(false);
                    serverStopButton.setDisabled(true);
                }
                serverCheckLabelImage.setPixmap(serverCheckImage);
            });
        }, 5000);
        const serverStartButton = new QT.QPushButton();
        serverStartButton.setText("Start");
        serverStartButton.addEventListener("clicked", this.css.start.bind(this.css));
        const serverStopButton = new QT.QPushButton();
        serverStopButton.setText("Stop");
        serverStopButton.setDisabled(true);
        serverStopButton.addEventListener("clicked", this.css.stop.bind(this.css));
        const homeText = new QT.QLabel();
        homeText.setText("Don't forget to set your console's primary DNS server as shown in the instructions tab!");
        homePage.layout().addWidget(serverStatus);
        homePage.layout().addWidget(serverStartButton);
        homePage.layout().addWidget(serverStopButton);
        homePage.layout().addWidget(homeText);

        const instructionsPage = new QT.QWidget();
        instructionsPage.setLayout(new QT.FlexLayout());
        const instructionsImageLabel = new QT.QLabel();
        const instructionsImage = new QT.QMovie();
        instructionsImage.setFileName("instructions.gif");
        instructionsImage.start();
        instructionsImageLabel.setMovie(instructionsImage);
        instructionsPage.layout().addWidget(instructionsImageLabel);
        
        const advancedPage = new QT.QWidget();
        advancedPage.setLayout(new QT.FlexLayout);
        const nodeMediaServerLink = new QT.QPushButton();
        nodeMediaServerLink.setText("Open NodeMediaServer admin page");
        nodeMediaServerLink.addEventListener("clicked", () => {
            var open = import("open").then((open) => {open.default("http://localhost:8080/admin")});
        });
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
        const serverRestartButton = new QT.QPushButton();
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
                width: 800px;
                height: 600px;
                flex: 1;
                flex-direction: row;
                background-color: white;
            }
            #left_pane {
                flex: 1;
                border-right: 1px solid grey;
                background: green;
            }

            #left_pane QListWidget {
                flex: 1;
                background: grey;
            }

            #right_pane {
                flex: 2;
            }

            #right_pane .advanced-form-field {
                flex-direction: row;
            }

            #right_pane .advanced-form-field QLabel {
                width: 200px;
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