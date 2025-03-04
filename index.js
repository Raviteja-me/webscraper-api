const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        );

        // Wait for full page load
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        // Wait for at least some content to appear
        await page.waitForSelector("p, div", { timeout: 5000 }).catch(() => null);

        // Extract text from body and all iframes
        const pageContent = await page.evaluate(async () => {
            function getTextFromFrame(frame) {
                return frame.innerText.replace(/\n\s*\n/g, "\n").trim();
            }

            let content = getTextFromFrame(document.body);

            // Extract text from iframes
            const iframes = document.querySelectorAll("iframe");
            for (let iframe of iframes) {
                try {
                    const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (frameDoc) {
                        content += "\n\n" + getTextFromFrame(frameDoc.body);
                    }
                } catch (e) { /* Ignore cross-origin errors */ }
            }

            return content;
        });

        await browser.close();

        res.json({ content: pageContent || "No readable content found" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));