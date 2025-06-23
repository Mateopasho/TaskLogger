import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  const { userMsg = '' } = req.body || {};

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.goto(process.env.CHAT_URL, { waitUntil: 'networkidle0' });

  await page.type('#home-page-composer', userMsg);
  await page.click('button.flex.size-8.rounded-full.bg-primary');

  const selector = process.env.REPLY_SELECTOR || '.message:last-child .text';
  await page.waitForSelector(selector, { timeout: 30000 });
  const reply = await page.$eval(selector, (el) => el.textContent.trim());

  await browser.close();
  res.status(200).json({ reply });
}