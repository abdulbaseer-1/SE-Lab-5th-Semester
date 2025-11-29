// import { chromium } from 'playwright';

// export async function loadWebsite(url) {
//   const browser = await chromium.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'domcontentloaded' });

//   // Example: get HTML snapshot
//   const content = await page.content();

//   // Optional: take screenshot
//   await page.screenshot({ path: 'page.png', fullPage: true });

//   await browser.close();
//   return content;
// }
import colors from 'colors';

const logger = (req, res, next) => {
    const methodColors = {
        GET: 'green',
        POST: 'yellow',
        PUT: 'blue',
        DELETE: 'red'
    };
    const color = methodColors[req.method] || 'white';

    console.log(`${req.method} ${req.protocol} : ${req.get('host')} ${req.originalUrl}`[color])
    next();
}

export default logger;