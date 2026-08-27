const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

function findSystemExecutable() {
  const candidatePaths = [
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ].filter(Boolean);

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

async function exportPDF() {
  console.log('[1/4] Initializing Headless Browser Engine...');
  const executablePath = findSystemExecutable();
  
  const launchOptions = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files']
  };

  if (executablePath) {
    console.log(`Using browser executable: ${executablePath}`);
    launchOptions.executablePath = executablePath;
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    const htmlPath = path.resolve(__dirname, '../docs/PROJECT_REPORT.html');
    
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`Report HTML not found at: ${htmlPath}`);
    }

    console.log(`[2/4] Loading HTML Source: ${htmlPath}`);
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    const outputPath = path.resolve(__dirname, '../VERDICT_MASTER_PROJECT_REPORT.pdf');
    console.log(`[3/4] Rendering High-Definition A4 PDF to: ${outputPath}`);

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      }
    });

    console.log('[4/4] PDF Generated Successfully: VERDICT_MASTER_PROJECT_REPORT.pdf');
    console.log(`File location: ${outputPath}`);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

exportPDF();
