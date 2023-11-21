const QT = require("@nodegui/nodegui");
const { networkInterfaces } = require('os');

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
        homeTab.setData
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
            this.css.checkStatus((isStatusOk) => {
                if (isStatusOk) {
                    serverCheckImage.load("green-circle-icon.png");
                    serverCheckLabel.setText("Server Online");
                } else {
                    serverCheckImage.load("red-circle-icon.png");
                    serverCheckLabel.setText("Server Offline");
                }
                serverCheckLabelImage.setPixmap(serverCheckImage);
            });
        }, 5000);
        const interfaceSelector = new QT.QComboBox();
        const nets = networkInterfaces();
        const results = Object.create(null);
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }
        for (let name in results) {
            interfaceSelector.addItem(undefined, name + " (" + results[name] + ")", new QT.QVariant(results[name]));
        }
        this.css.setMainIP(interfaceSelector.itemData(interfaceSelector.currentIndex()).toString());
        interfaceSelector.addEventListener("currentIndexChanged", (index) => {
            this.css.setMainIP(interfaceSelector.itemData(index).toString());
            this.css.restartDNS();
        });
        const serverStartButton = new QT.QPushButton();
        serverStartButton.setText("Start");
        serverStartButton.addEventListener("clicked", this.css.start.bind(this.css));
        const serverStopButton = new QT.QPushButton();
        serverStopButton.setText("Stop");
        serverStopButton.addEventListener("clicked", this.css.stop.bind(this.css));
        homePage.layout().addWidget(serverStatus);
        homePage.layout().addWidget(interfaceSelector);
        homePage.layout().addWidget(serverStartButton);
        homePage.layout().addWidget(serverStopButton);

        const instructionsPage = new QT.QWidget();
        instructionsPage.setLayout(new QT.FlexLayout());
        const instructionsImageLabel = new QT.QLabel();
        const instructionsImage = new QT.QMovie();
        instructionsImage.setFileName("instructions.gif");
        instructionsImage.start();
        instructionsImageLabel.setMovie(instructionsImage);
        instructionsPage.layout().addWidget(instructionsImageLabel);
        
        const advancedPage = new QT.QLabel();
        advancedPage.setText("advanced");
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

            #left_pane QListWidget QListWidgetItem {
                background: red;
            }

            #right_pane {
                flex: 2;
            }

            #server_status {
                flex-direction: row;
            }
        `);
        
        /*const label = new QT.QLabel();
        label.setObjectName("mylabel");
        label.setText("RTMP Server Status");
        label.setInlineStyle("color: blue; text-decoration: underline");
        label.addEventListener("clicked", () => {console.log("use open module")});

        const dnsServerStartButton = new QT.QPushButton();
        dnsServerStartButton.setText("Start DNS server");
        const rtmpServerStartButton = new QT.QPushButton();
        rtmpServerStartButton.setText("Start RTMP server");

        const interfaceSelector = new QT.QComboBox();
        const nets = networkInterfaces();
        const results = Object.create(null); // Or just '{}', an empty object
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }
        for (let name in results) {
            interfaceSelector.addItem(undefined, name + " (" + results[name] + ")", new QT.QVariant(results[name]));
        }
        this.css.setMainIP(interfaceSelector.itemData(interfaceSelector.currentIndex()).toString());
        interfaceSelector.addEventListener('currentIndexChanged', (index) => {
            this.css.setMainIP(interfaceSelector.itemData(index).toString());
            this.css.restartDNS();
        });

        const tabWidget = new QT.QTabWidget();

        const instructionsLayout = new QT.FlexLayout();
        const instructionsTab = new QT.QWidget();
        instructionsTab.setObjectName("instructions_tab");
        instructionsTab.setLayout(instructionsLayout);
        const instructionsImageLabel = new QT.QLabel();
        const instructionsImage = new QT.QMovie();
        instructionsImage.setFileName("instructions.gif");
        instructionsImage.start();
        instructionsImageLabel.setMovie(instructionsImage);

        instructionsLayout.addWidget(instructionsImageLabel);

        tabWidget.addTab(instructionsTab, new QT.QIcon(), "Instructions");

        const checkStatusLayout = new QT.FlexLayout();
        const checkStatusTab = new QT.QWidget();
        checkStatusTab.setObjectName("checkstatus_tab");
        checkStatusTab.setLayout(checkStatusLayout);
        const dnsServerCheckButton = new QT.QPushButton();
        dnsServerCheckButton.setText("Check DNS server status");
        dnsServerCheckButton.addEventListener("clicked", () => {
            this.css.checkDNSStatus((statusOk) => {
                if (statusOk) {
                    dnsServerCheckImage.load("green-circle-icon.png");
                } else {
                    dnsServerCheckImage.load("red-circle-icon.png");
                }
                dnsServerCheckLabel.setPixmap(dnsServerCheckImage);
            });
        });
        const dnsServerCheckLabel = new QT.QLabel();
        const dnsServerCheckImage = new QT.QPixmap();
        dnsServerCheckImage.load("red-circle-icon.png");
        dnsServerCheckLabel.setPixmap(dnsServerCheckImage);
        dnsServerCheckLabel.setScaledContents(true);
        dnsServerCheckLabel.setInlineStyle("width: 16px; height: 16px");

        const rtmpServerCheckButton = new QT.QPushButton();
        rtmpServerCheckButton.setText("Check RTMP server status");
        rtmpServerCheckButton.addEventListener("clicked", () => {
            this.css.checkRTMPStatus((statusOk) => {
                if (statusOk) {
                    rtmpServerCheckImage.load("green-circle-icon.png");
                } else {
                    rtmpServerCheckImage.load("red-circle-icon.png");
                }
                rtmpServerCheckLabel.setPixmap(rtmpServerCheckImage);
            });
        });
        const rtmpServerCheckLabel = new QT.QLabel();
        const rtmpServerCheckImage = new QT.QPixmap();
        rtmpServerCheckImage.load("red-circle-icon.png");
        rtmpServerCheckLabel.setPixmap(rtmpServerCheckImage);
        rtmpServerCheckLabel.setScaledContents(true);
        rtmpServerCheckLabel.setInlineStyle("width: 16px; height: 16px");

        checkStatusLayout.addWidget(dnsServerCheckButton);
        checkStatusLayout.addWidget(dnsServerCheckLabel);
        checkStatusLayout.addWidget(rtmpServerCheckButton);
        checkStatusLayout.addWidget(rtmpServerCheckLabel);

        tabWidget.addTab(checkStatusTab, new QT.QIcon(), "Server Status");

        this.rootLayout.addWidget(label);
        this.rootLayout.addWidget(interfaceSelector);
        this.rootLayout.addWidget(dnsServerStartButton);
        this.rootLayout.addWidget(rtmpServerStartButton);
        this.rootLayout.addWidget(tabWidget);

        dnsServerStartButton.addEventListener("clicked", this.css.startDNS.bind(this.css));
        rtmpServerStartButton.addEventListener("clicked", this.css.startRTMP.bind(this.css));

        */
        this.win.show();
        global.win = this.win;
    }
}

module.exports = CssGUI;