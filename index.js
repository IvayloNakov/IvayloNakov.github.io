const puppeteer = require('puppeteer');
const fs = require('fs/promises');

(async function() {
  //setting up the headless browsere
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://blog.apify.com/');
  
  //accepting cookies alert
  try {
    await page.waitForSelector("#onetrust-accept-btn-handler", {timeout: 5000});
    await page.click("#onetrust-accept-btn-handler")
  } catch (error) {
    if (error instanceof puppeteer.errors.TimeoutError) {
      console.log('no alert')
    }
  }
  
  // main loop loads all pages and then scrapes data
  while(true){
    try {
      //trying to load as many pages as possible
      await page.waitForFunction("!document.querySelector('.btn').className.includes(' is-loading')")
      await page.waitForSelector('.btn', {visible: true, timeout: 5000})
      await page.click('.btn')

    } catch (error) {
      //on error means it cannot load new pages, so the scraping begins
      cards = await page.$$eval(".post-card__content", nodes => {
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

  //saves the JSON data as a text file on the disk
  await fs.writeFile('AplifyBlog_scraped.txt', JSON.stringify(cards))

})();
