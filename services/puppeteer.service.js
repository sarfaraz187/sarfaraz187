const puppeteer = require("puppeteer");
class PuppeteerService {
  browser;
  page;

  async init() {
    this.browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--window-position=0,0",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        "--incognito",
        "--proxy-server=http=194.67.37.90:3128",
        // '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"', //
      ],
      // headless: false,
    });
  }

  /**
   *
   * @param {string} url
   */
  async goToPage(url) {
    if (!this.browser) {
      await this.init();
    }
    this.page = await this.browser.newPage();

    await this.page.setExtraHTTPHeaders({
      "Accept-Language": "en-US",
    });

    await this.page.goto(url, {
      waitUntil: `networkidle0`,
    });
  }

  async close() {
    await this.page.close();
    await this.browser.close();
  }

  /**
   *
   * @param {string} acc Account to crawl
   * @param {number} n Qty of image to fetch
   */
  async getLatestInstagramPostsFromAccount(acc, n) {
    try {
      const page = `https://www.picuki.com/profile/${acc}`;
      console.log("🚀 ~ PuppeteerService ~ page:", page);
      await this.goToPage(page);
      let previousHeight;

      previousHeight = await this.page.evaluate(`document.body.scrollHeight`);
      await this.page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
      // 🔽 Doesn't seem to be needed
      // await this.page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await this.page.waitFor(1000);

      // console.log("Document :", await this.page.evaluate("document"));
      const nodes = await this.page.evaluate(() => {
        const images = document.querySelectorAll(`.post-image`);
        console.log({ images });
        return [].map.call(images, (img) => img.src);
      });

      console.log("nodes", nodes);
      return nodes.slice(0, 3);
    } catch (error) {
      console.log("Error", error);
      process.exit();
    }
  }
}

const puppeteerService = new PuppeteerService();

module.exports = puppeteerService;
