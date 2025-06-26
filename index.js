const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cors = require('cors');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 8080;

// Allow only your frontend domain and local development
app.use(cors({
  origin: [
    'https://lazyjobseeker.com',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.get("/scrape", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL is required" });

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-gpu",
                "--disable-blink-features=AutomationControlled"
            ],
            defaultViewport: null
        });

        const page = await browser.newPage();
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        );

        // Add a small random delay before navigating (fixed waitForTimeout issue)
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 5000) + 2000));

        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        await page.waitForSelector("p, div", { timeout: 5000 }).catch(() => null);

        const pageContent = await page.evaluate(() => {
            return document.body.innerText;
        });

        res.json({ content: pageContent || "No readable content found" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));