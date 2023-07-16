import * as puppeteer from 'puppeteer';
import express from 'express';
import prompts = require('prompts');
import * as fs from 'fs';

const templ = (template?: string, title = 'NexusPIPE', value = 'Cybersecurity without compromises 🚀', image = 'https://workload.astolfo.gay/bg.png', font = 'Cera Pro') => (template ?? fs.readFileSync(__dirname + '/../template.html', 'utf-8'))
  .replace(/%URLENCODEDFONT%/gui, encodeURIComponent(font))
  .replace(/%FONT%/gui, font)
  .replace(/%TITLE%/gui, title)
  .replace(/%VALUE%/gui, value)
  .replace(/%IMAGE%/gui, image);

(async () => {
  console.log('\x1b[0;2;30mNote: The background image prompt is either an absolute URL or a relative path to the image file. If you are using a relative path, make sure the image file is relative to: ' + process.cwd() + '\x1b[0m');

  const { url, title, value, font } = await prompts(
    [
      {
        type: 'text',
        name: 'url',
        message: 'Enter the URL of the background image',
        initial: 'https://workload.astolfo.gay/bg.png',
      },
      {
        type: 'text',
        name: 'title',
        message: 'Enter the title of the page',
        initial: 'NexusPIPE',
      },
      {
        type: 'text',
        name: 'value',
        message: 'Enter the value of the page',
        initial: 'Lorem Ipsum 🚀',
      },
      {
        type: 'text',
        name: 'font',
        message: 'Enter the CSS font family - this is loaded from NexusFonts',
        initial: 'Cera Pro',
      },
    ],
    {
      onCancel: () => {
        console.log('\x1b[0;31mCancelled\x1b[0m');
        process.exit(0)
      },
    },
  );
  const id = Math.random().toString(36).substring(7);
  fs.writeFileSync(`./${id}.html`, templ(fs.existsSync(process.cwd() + '/template.html') ? fs.readFileSync(process.cwd() + '/template.html', 'utf-8') : undefined, title, value, url, font));
  // local express server, statically hosting this dir
  const app = express();
  app.use(express.static(process.cwd()));
  app.listen(11634, async () => {
    console.log('Server running on port 11634')
    const browser = await puppeteer.launch({
      headless: 'new',
    });
    const page = await browser.newPage();

    await page.goto('http://127.0.0.1:11634/' + id + '.html', { waitUntil: 'networkidle2' });

    await new Promise((resolve) => setTimeout(resolve, 200));

    // Set screen size
    const res = (process.env.RESOLUTION || process.argv.find(v => v === '--res') ? process.argv[process.argv.findIndex(v => v === '--res') + 1] : null) || '1280x640';
    await page.setViewport({
      width: parseInt(res.split('x')[0]),
      height: parseInt(res.split('x')[1]),
    }); // 1280x640 is the recommended size for the screenshot

    await page.screenshot({ path: 'output.png' })
    console.log('Image saved to output.png');
    fs.unlinkSync(`./${id}.html`)

    await browser.close();
    setTimeout(() => {
      process.exit(0)
    }, 1000);
  })
})()