import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

/* NEW: force the Lambda‑optimised Chromium binary and headless mode */
chromium.setHeadlessMode(true);
chromium.setGraphicsMode(false);

export default async function handler(req, res) {
  const { userMsg = '' } = req.body || {};

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.goto(process.env.CHAT_URL, { waitUntil: 'networkidle0' });

  // Type the incoming message into the chatbot
  await page.type('#home-page-composer', userMsg);
  // Click the send button
  await page.click('button.flex.size-8.rounded-full.bg-primary');

  // Wait for the bot’s reply and capture it
  const selector = process.env.REPLY_SELECTOR || '.message:last-child .text';
  await page.waitForSelector(selector, { timeout: 30000 });
  const reply = await page.$eval(selector, (el) => el.textContent.trim());

  await browser.close();
  res.status(200).json({ reply });
}