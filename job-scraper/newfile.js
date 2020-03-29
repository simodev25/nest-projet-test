const puppeteer = require('puppeteer');

(async () => {
   const browser = await puppeteer.launch({
      executablePath: process.env.CHROMIUM_PATH,
      args: ['--no-sandbox'], // This was important. Can't remember why
   });
   const page = await browser.newPage();
   await page.goto('https://example.com');
   await page.screenshot({path: 'example.png'});

   await browser.close();
})();
