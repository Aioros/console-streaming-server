const checker = require("license-checker");
const fs = require("fs-extra");

const file = "./dist/ModuleLicenses.txt";

var licenses = [];
checker.init(
    {
        start: "./",
        production: true
    },
    function (err, json) {
        if (err) {
            console.log(err);
        } else {
            copyLicenseToText(json);
        }
    }
);

async function copyLicenseToText(json) {
    Object.keys(json).forEach(function (key) {
        if (!key.startsWith("console-streaming-server@")) {
            let obj = json[key];
            obj.module = key;
            obj.isMarkDown = isMarkDown(obj.licenseFile);
            licenses.push(obj);
        }
    });
    licenses = licenses.filter(item => !item.isMarkDown);
    licenses = groupBy(licenses, l => l.licenses);
    await fs.outputFile(file, "");
    await printLicenseSummary();
    await printLicenseDetails();
}

async function printLicenseSummary() {
    for (let key of Object.keys(licenses)) {
        let licenseCategory = licenses[key];
        await fs.appendFile(file, "\n\n--------------------\n");
        await fs.appendFile(file, `${key} - License Summary\n`);
        await fs.appendFile(file, "--------------------\n\n");
        for (let license of licenseCategory) {
            await fs.appendFile(file, `${license.module} \n`);
        }
    }
}

async function printLicenseDetails() {
    for (let key of Object.keys(licenses)) {
        let licenseCategory = licenses[key];
        await fs.appendFile(file, "\n\n------------------------\n");
        await fs.appendFile(file, `${key} - License Details \n`);
        await fs.appendFile(file, "------------------------\n \n");
        for (let license of licenseCategory) {
            await copyLicense(license);
        }
    }
}

function groupBy(xs, f) {
    return xs.reduce(
        (r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r),
        {}
    );
}

async function copyLicense(item) {
    if (item.licenseFile && !isMarkDown(item.licenseFile)) {
        let licenseFile = fs.readFileSync(`${item.licenseFile}`, "utf8");
        await fs.appendFile(file, "\n\n-----------------------\n");
        await fs.appendFile(file, `${item.module} - `);
        await fs.appendFile(file, `${item.licenses} \n`);
        await fs.appendFile(file, "-----------------------\n \n");
        await fs.appendFile(file, licenseFile);
    }
}

function isMarkDown(filename) {
    if (filename) {
        var pathArray = filename.split("\\");
        if (pathArray.length) {
            let lastName = pathArray[pathArray.length - 1];
            if (
                (lastName && lastName.toUpperCase() == "README.MD") ||
                (lastName && lastName.toUpperCase() == "README.MARKDOWN")
            ) {
                return true;
            }
        }
    }
    return false;
}