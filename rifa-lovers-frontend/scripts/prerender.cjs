/**
 * Post-build prerender script for RifaLovers
 * Generates static HTML for public routes using Puppeteer.
 * Run after `vite build`.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const ROUTES = [
  '/',
  '/impacto',
  '/nosotros',
  '/contacto',
  '/bases-legales',
  '/terminos',
  '/privacidad',
];

const DIST_DIR = path.resolve(__dirname, '../dist');
const PORT = 4321;

async function main() {
  // Create a simple static file server
  const server = http.createServer((req, res) => {
    let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }
    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    const mime = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.woff2': 'font/woff2',
    }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  });

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Static server running on http://localhost:${PORT}`);

  // Launch Puppeteer
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    console.error('Puppeteer not available. Install with: pnpm add -D puppeteer');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    const url = `http://localhost:${PORT}${route}`;
    console.log(`Prerendering ${route} ...`);

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for React to mount and helmet to inject meta tags
    await page.waitForTimeout(1000);

    const html = await page.content();

    // Determine output path
    const outputDir = route === '/' ? DIST_DIR : path.join(DIST_DIR, route);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputFile = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputFile, html);
    console.log(`  → ${path.relative(process.cwd(), outputFile)}`);

    await page.close();
  }

  await browser.close();
  server.close();
  console.log('\nPrerender complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
