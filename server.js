const express = require('express');
const fetch = require('node-fetch');
//const fs = require('fs');
const app = express();
var http = require('http').Server(app);

/*else http = require('https').createServer({
    key: fs.readFileSync('privatekey.key'),
    cert: fs.readFileSync('certificate.crt')
}, app);*/
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json({ extended: true });

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromium = require('chromium');
const { By, Key, until, promise } = webdriver;
require('chromedriver');


app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/getAttributesFromSelectors', jsonParser, async function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    if (typeof req.body.url == 'string' && req.body.url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi)) {

        var arr = await chromiumGet(req.body.url, req.body.selector, req.body.attribute).catch(async function () {
            await driver.quit();
            await new webdriver.Builder()
                .forBrowser('chrome')
                .setChromeOptions(options)
                .build().then(function (result) { driver = result; });
            chromeIsBusy = false;
            return ['error'];
        });
        arr = arr.map(function(el) { return el.trim(); }).filter(function (el) { return el.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi); });
        res.end(JSON.stringify(arr));
    } else {
        res.end('["error"]');
    }
});

http.listen(process.env.PORT || 3000, function () { });



async function waitUntilChromeIsBusy() {
    return new Promise(function (resolve) {
        var interval = setInterval(function () {
            if (!chromeIsBusy) {
                clearInterval(interval);
                chromeIsBusy = true;
                resolve(true);
            }
        }, 300);
    });
}

var chromeIsBusy = false;

let options = new chrome.Options();
options.setChromeBinaryPath(chromium.path);
options.addArguments('--headless');
options.addArguments('--disable-gpu');
options.addArguments('--window-size=1280,960');
options.addArguments('--no-sandbox');
options.setUserPreferences({ 'profile.managed_default_content_settings.images': 2 });

var driver;
new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build().then(function (result) { driver = result; });


async function chromiumGet(url, selector, attribute) {
    waitUntilChromeIsBusy();

    await driver.get(url);

    var ret = new Array();
    await driver.findElements(By.css(selector)).then(async function (arr) { for (el of arr) { ret.push(await el.getAttribute(attribute)) } });

    let framesCounter = Number.parseInt(await driver.executeScript('return window.length'));
    console.log(framesCounter)
    for (let i = 0; i < framesCounter; i++) {
        await driver.switchTo().frame(i).catch(function(){});
        //let h = await driver.findElement(By.tagName('body')).getAttribute('innerHTML');
        //console.log(h.indexOf('video'));
        await driver.findElements(By.css(selector)).then(async function (arr) { for (el of arr) { ret.push(await el.getAttribute(attribute)) } });
        driver.switchTo().defaultContent();
        framesCounter = Number.parseInt(await driver.executeScript('return window.length'));
    }
    console.log(ret);
    chromeIsBusy = false;
    //await driver.quit();
    return ret;
}

/*async function fetchGet (url, selector, attribute) {
    var str =  await fetch(url)
    .then(async function(response) {
        return await response.text();
    });

    var dom = new JSDOM(str);
    var arr = dom.window.document.getElementsByTagName('video');
    for (let item of arr) {
        console.log('<>');
        console.log(item);
    }
}*/
