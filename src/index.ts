import * as playwright from 'playwright';
import express from 'express';
import prompts = require('prompts');
import * as fs from 'fs';
import * as path from 'path';
import proc from 'process';
import json5 from 'json5';

let templateData = {
  url: "https://workload.astolfo.gay/bg.png",
  topText: "NexusPIPE",
  mainText: "Lorem Ipsum 🚀",
  font: "Cera Pro",
  bgColour: "#1a181844"
};

const hexColourRegex = /^#?([a-f0-9]{3}|[a-f0-9]{4}|[a-f0-9]{6}|[a-f0-9]{8})$/ui;
const outputArgIndex = proc.argv.indexOf('--output');
let outputPath = proc.env.DIR ? `${proc.env.DIR}/output.png` : 'output.png';  // default path

if (outputArgIndex !== -1 && proc.argv[outputArgIndex + 1]) {
  outputPath = path.resolve(proc.env.DIR ?? proc.cwd(), proc.argv[outputArgIndex + 1]);
}

const templ = (template?: string, title = 'NexusPIPE', value = 'Cybersecurity without compromises 🚀', image = 'https://workload.astolfo.gay/bg.png', font = 'Cera Pro', bgColour = '#1a181844') => (template ?? fs.readFileSync(__dirname + '/../template.html', 'utf-8'))
  .replace(/%URLENCODEDFONT%/gui, encodeURIComponent(font))
  .replace(/%FONT%/gui, font)
  .replace(/%TITLE%/gui, title)
  .replace(/%VALUE%/gui, value)
  .replace(/%IMAGE%/gui, image)
  .replace(/%BGCOLOUR%/gui, bgColour);

const templateArgIndex = proc.argv.indexOf('--template');

if (templateArgIndex !== -1 && proc.argv[templateArgIndex + 1]) {
  const templatePath = path.resolve(__dirname, '..', 'templates', proc.argv[templateArgIndex + 1]);

  try {
    const rawData = fs.readFileSync(templatePath, 'utf-8');
    const parsedData = json5.parse(rawData);

    templateData = {
      ...templateData,
      ...parsedData,
    };

  } catch (err) {
    console.warn(`Template retrieval error: ${err.message}. Using default values.`);
  }
}

(async () => {
  console.log(`\x1b[0;37mNote: The background image prompt is either an absolute URL or a relative path to the image file. If you are using a relative path, make sure the image file is relative to: ${proc.cwd()}\x1b[0m`);
  const open = (await import('open')).default;

  const { url, title, value, font, bgColour: _bgC } = await prompts(
    [
      {
        type: 'text',
        name: 'url',
        message: 'Enter the URL of the background image',
        initial: templateData.url,
      },
      {
        type: 'text',
        name: 'title',
        message: 'Enter the title of the page',
        initial: templateData.topText,
      },
      {
        type: 'text',
        name: 'value',
        message: 'Enter the value of the page',
        initial: templateData.mainText,
      },
      {
        type: 'text',
        name: 'font',
        message: 'Enter the CSS font family - this is loaded from NexusFonts',
        initial: templateData.font,
      },
      {
        type: 'text',
        name: 'bgColour',
        message: 'Enter the background color for the text',
        initial: templateData.bgColour
      }
    ],
    {
      onCancel: () => {
        console.log('\x1b[0;31mCancelled\x1b[0m');
        proc.exit(0)
      },
    },
  );
  let bgColour = _bgC;

  if (!hexColourRegex.test(bgColour)) {
    console.error("Invalid hex color format! Please ensure the hex format is correct (i.e. #1a181844) and try again");
    proc.exit(1);
  } else if (!bgColour.startsWith('#')) {
    bgColour = '#' + bgColour;
  }

  const saveTemplateArgIndex = proc.argv.indexOf('--save-template');

  if (saveTemplateArgIndex !== -1 && proc.argv[saveTemplateArgIndex + 1]) {
    const newTemplatePath = path.resolve(__dirname, '..', 'templates', proc.argv[saveTemplateArgIndex + 1]);

    const newTemplateData = {
      url,
      topText: title,
      mainText: value,
      font,
      bgColour,
    };

    try {
      fs.writeFileSync(newTemplatePath, json5.stringify(newTemplateData, null, 2));
      console.log(`Template saved to ${newTemplatePath}`);
    } catch (err) {
      console.warn(`Error saving template: ${err.message}`);
    }
  }

  const id = Math.random().toString(36).substring(7);
  fs.writeFileSync(`./${id}.html`, templ(fs.existsSync(proc.cwd() + '/template.html') ? fs.readFileSync(proc.cwd() + '/template.html', 'utf-8') : undefined, title, value, url, font));

  // local express server, statically hosting this dir
  const app = express();
  app.use(express.static(proc.cwd()));
  app.listen(11634, async () => {
    console.log('Server running on port 11634')
    const browser = await playwright[proc.env.USE_FIREFOX ? 'firefox' : 'chromium' /* default will be changed to firefox once it's screenshot tool has backdrop-blur working */].launch({
      headless: proc.env.DEBUG_HEADFUL ? false : true,
    });
    const page = await browser.newPage();

    await page.goto('http://127.0.0.1:11634/' + id + '.html', { waitUntil: 'networkidle' });

    // Set screen size
    const res = (proc.argv.find(v => v === '--res') ? proc.argv[proc.argv.findIndex(v => v === '--res') + 1] : null) || proc.env.RESOLUTION || '1280x640';
    await page.setViewportSize({ // 1280x640 is the recommended size for the screenshot
      width: parseInt(res.split('x')[0]),
      height: parseInt(res.split('x')[1]),
    });

    await new Promise((resolve) => setTimeout(resolve, Number((proc.argv.find(v => v === '--timeout') ? proc.argv[proc.argv.findIndex(v => v === '--timeout') + 1] : null) ?? proc.env.TIMEOUT ?? 1000)));

    if (outputArgIndex !== -1 && proc.argv[outputArgIndex + 1]) {
      outputPath = path.resolve(proc.argv[outputArgIndex + 1]);
      // Check if outputPath is a directory
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).isDirectory()) {
        outputPath = path.join(outputPath, 'output.png');  // append a default filename, woo!
      }

      // Ensure outputPath ends with a valid image extension
      const validExtensions = ['.png', '.jpeg', '.jpg', '.jfif', '.webp'];
      if (!validExtensions.some(ext => outputPath.toLowerCase().endsWith(ext))) {
        outputPath += '.png';
      }
    }

    await page.screenshot({ path: outputPath });
    console.log(`Image saved to ${outputPath}`);

    if (proc.argv.includes('--open')) {
      await open(outputPath);  // This will open the image
    }

    fs.unlinkSync(`./${id}.html`)
    if (!proc.env.DEBUG_HEADFUL) {
      await browser.close();

      setTimeout(() => {
        proc.exit(0)
      }, 1000);
    }
  })
})()