const puppeteer = require('puppeteer');
const fs = require('fs/promises');


const url = 'https://blog.apify.com/';
var cards

const selector = ".post-card__content";

(async function() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    try {
        await page.waitForSelector("#onetrust-accept-btn-handler", {
            timeout: 5000
        });
        await page.click("#onetrust-accept-btn-handler")
    } catch (e) {
        if (e instanceof puppeteer.errors.TimeoutError) {
            console.log('no alert')
        }
    }
    c = 1
    while (true) {
        try {
            console.log(c++);
            await page.waitForFunction("!document.querySelector('.btn').className.includes(' is-loading')")
            await page.waitForSelector('.btn', { visible: true, timeout: 5000 })
            await page.click('.btn')


        } catch (error) {
            console.log("collecting cards");
            cards = await page.$$eval(selector, nodes => {
                return nodes.map(node => {
                    const tags = node.querySelector(".post-card__hdr").innerText.split("\n").join();
                    const title = node.querySelector('h2').innerText;
                    const authors = node.querySelector('.post-card__author').innerText.split("\n").join();
                    const discription = node.querySelector('.post-card__exc').innerText;
                    const date = node.querySelector('time').dateTime;
                    const url = node.querySelector('h2 a').href;

                    return {
                        tags,
                        title,
                        authors,
                        discription,
                        date,
                        url
                    }
                })
            });
            break
        }
    }
    await browser.close();

    await fs.writeFile('C_A_R_D_S.txt', JSON.stringify(cards))

})();