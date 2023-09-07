import * as puppeteer from 'puppeteer';
import express from 'express';
import prompts = require('prompts');
import * as fs from 'fs';
import * as path from 'path';

let open;
(async () => {
  open = (await import('open')).default;
})();

let templateData = {
  url: "https://workload.astolfo.gay/bg.png",
  top_text: "NexusPIPE",
  main_text: "Lorem Ipsum 🚀",
  font: "Cera Pro",
  bg_color: "#1a181844"
};

const outputArgIndex = process.argv.indexOf('--output');
let outputPath = 'output.png';  // default path

if (outputArgIndex !== -1 && process.argv[outputArgIndex + 1]) {
  outputPath = path.resolve(process.argv[outputArgIndex + 1]);
}

const templ = (template?: string, title = 'NexusPIPE', value = 'Cybersecurity without compromises 🚀', image = 'https://workload.astolfo.gay/bg.png', font = 'Cera Pro', bgColor = 'rgba(0, 0, 0, 0.5)') => (template ?? fs.readFileSync(__dirname + '/../template.html', 'utf-8'))
  .replace(/%URLENCODEDFONT%/gui, encodeURIComponent(font))
  .replace(/%FONT%/gui, font)
  .replace(/%TITLE%/gui, title)
  .replace(/%VALUE%/gui, value)
  .replace(/%IMAGE%/gui, image)
  .replace(/%BGCOLOR%/gui, bgColor);


  const templateArgIndex = process.argv.indexOf('--template');

  if (templateArgIndex !== -1 && process.argv[templateArgIndex + 1]) {
    const templatePath = path.resolve(__dirname, '..', 'templates', process.argv[templateArgIndex + 1]);
  
    try {
      const rawData = fs.readFileSync(templatePath, 'utf-8');
      const parsedData = JSON.parse(rawData);
      
      if (parsedData.url && parsedData.top_text && parsedData.main_text && parsedData.font) {
        templateData = parsedData;

      } else {
        console.warn("Some template fields are missing in the JSON file. Using default values.");
      }

    } catch (err) {
  console.warn(`Template retrieval error: ${err.message}. Using default values.`);
    }
  }

(async () => {
  console.log('\x1b[0;37mNote: The background image prompt is either an absolute URL or a relative path to the image file. If you are using a relative path, make sure the image file is relative to: ' + process.cwd() + '\x1b[0m');

  const { url, title, value, font, bgColor } = await prompts(
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
        initial: templateData.top_text,
      },
      {
        type: 'text',
        name: 'value',
        message: 'Enter the value of the page',
        initial: templateData.main_text,
      },
      {
        type: 'text',
        name: 'font',
        message: 'Enter the CSS font family - this is loaded from NexusFonts',
        initial: templateData.font,
      },
      {
        type: 'text',
        name: 'bgColor',
        message: 'Enter the background color for the text (e.g., #1a181844)',
        initial: templateData.bg_color  
      }
    ],
    {
      onCancel: () => {
        console.log('\x1b[0;31mCancelled\x1b[0m');
        process.exit(0)
      },
    },
  );

  const hexColorRegex = /^#([a-f0-9]{6}|[a-f0-9]{8})$/iu;

  if (!hexColorRegex.test(bgColor)) {
      console.error("Invalid hex color format! Please ensure the hex format is correct (i.e. #1a181844) and try again");
      process.exit(1);
  }  

  const saveTemplateArgIndex = process.argv.indexOf('--savetemplate');

  if (saveTemplateArgIndex !== -1 && process.argv[saveTemplateArgIndex + 1]) {
    const newTemplatePath = path.resolve(__dirname, '..', 'templates', process.argv[saveTemplateArgIndex + 1]);
    
    const newTemplateData = {
        url: url,
        top_text: title,
        main_text: value,
        font: font
    };
    
    try {
        fs.writeFileSync(newTemplatePath, JSON.stringify(newTemplateData, null, 2));
        console.log(`Template saved to ${newTemplatePath}`);

    } catch (err) {
        console.warn(`Error saving template: ${err.message}`);
    }
  }

  const id = Math.random().toString(36).substring(7);
  fs.writeFileSync(`./${id}.html`, templ(fs.existsSync(process.cwd() + '/template.html') ? fs.readFileSync(process.cwd() + '/template.html', 'utf-8') : undefined, title, value, url, font));
  // local express server, statically hosting this dir

  // test print for html mod
  /*
  const generatedHTML = templ(fs.existsSync(process.cwd() + '/template.html') ? fs.readFileSync(process.cwd() + '/template.html', 'utf-8') : undefined, title, value, url, font, bgColor);
  console.log(generatedHTML);
  fs.writeFileSync(`./${id}.html`, generatedHTML);
  */  

  const app = express();
  app.use(express.static(process.cwd()));
  app.listen(11634, async () => {
    console.log('Server running on port 11634')
    const browser = await puppeteer.launch({
      headless: 'new',
    });
    const page = await browser.newPage();

    await page.goto('http://127.0.0.1:11634/' + id + '.html', { waitUntil: 'networkidle2' });

    await new Promise((resolve) => setTimeout(resolve, Number((process.argv.find(v => v === '--timeout') ? process.argv[process.argv.findIndex(v => v === '--timeout') + 1] : null) ?? process.env.TIMEOUT ?? 1000)));

    // Set screen size
    const res = (process.argv.find(v => v === '--res') ? process.argv[process.argv.findIndex(v => v === '--res') + 1] : null) || process.env.RESOLUTION || '1280x640';
    await page.setViewport({
      width: parseInt(res.split('x')[0]),
      height: parseInt(res.split('x')[1]),
    }); // 1280x640 is the recommended size for the screenshot

    if (outputArgIndex !== -1 && process.argv[outputArgIndex + 1]) {
      outputPath = path.resolve(process.argv[outputArgIndex + 1]);
      // Check if outputPath is a directory
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).isDirectory()) {
          outputPath = path.join(outputPath, 'output.png');  // append a default filename, woo!
      }
  
      // Ensure outputPath ends with a valid image extension
      const validExtensions = ['.png', '.jpeg', '.jpg', '.webp'];
      if (!validExtensions.some(ext => outputPath.toLowerCase().endsWith(ext))) {
          outputPath += '.png';
      }
  }

    await page.screenshot({ path: outputPath });
    console.log(`Image saved to ${outputPath}`);

    if (process.argv.includes('--open')) {
      await open(outputPath);  // This will open the image
    }

    fs.unlinkSync(`./${id}.html`)
    await browser.close();

    setTimeout(() => {
      process.exit(0)
    }, 1000);
  })
})()