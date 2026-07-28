import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, '..', 'public', 'screenshots');
const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 375, height: 812 },
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function screenshot(page, name, { fullPage = false, viewport = VIEWPORTS.desktop, clip = null } = {}) {
  await page.setViewport(viewport);
  await sleep(1000);

  const filename = `${name}.png`;
  const filepath = join(SCREENSHOTS_DIR, filename);

  if (clip) {
    await page.screenshot({ path: filepath, clip });
  } else {
    await page.screenshot({ path: filepath, fullPage });
  }

  console.log(`  ✅ Captured: ${filename} (${viewport.width}x${viewport.height})`);
  return `/screenshots/${filename}`;
}

async function captureLanding(page) {
  console.log('\n📸 Capturing Landing Page...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(3000);

  // Hero section
  await screenshot(page, 'landing-hero', {
    clip: { x: 0, y: 0, width: 1440, height: 800 },
  });

  // Full page
  await screenshot(page, 'landing-fullpage', { fullPage: true });

  // Scroll to Features
  await page.evaluate(() => {
    const sections = document.querySelectorAll('section');
    for (const s of sections) {
      if (s.textContent?.toLowerCase().includes('feature')) {
        s.scrollIntoView({ behavior: 'instant', block: 'start' });
        break;
      }
    }
  });
  await sleep(2000);
  await screenshot(page, 'landing-features', {
    clip: { x: 0, y: 800, width: 1440, height: 800 },
  });

  // How it works
  await page.evaluate(() => {
    const sections = document.querySelectorAll('section');
    for (const s of sections) {
      const txt = s.textContent?.toLowerCase() || '';
      if (txt.includes('how it works') || txt.includes('how does it')) {
        s.scrollIntoView({ behavior: 'instant', block: 'start' });
        break;
      }
    }
  });
  await sleep(2000);
  await screenshot(page, 'landing-how-it-works', {
    clip: { x: 0, y: 1600, width: 1440, height: 800 },
  });

  // FAQ
  await page.evaluate(() => {
    const sections = document.querySelectorAll('section');
    for (const s of sections) {
      if (s.textContent?.includes('FAQ')) {
        s.scrollIntoView({ behavior: 'instant', block: 'start' });
        break;
      }
    }
  });
  await sleep(2000);
  await screenshot(page, 'landing-faq', {
    clip: { x: 0, y: 2400, width: 1440, height: 800 },
  });

  // Footer
  await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (footer) footer.scrollIntoView({ behavior: 'instant', block: 'end' });
  });
  await sleep(1000);
  await screenshot(page, 'landing-footer', {
    clip: { x: 0, y: 3200, width: 1440, height: 600 },
  });
}

async function captureMobile(page) {
  console.log('\n📸 Capturing Mobile Views...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(3000);

  // Mobile hero
  await screenshot(page, 'mobile-landing-hero', {
    viewport: VIEWPORTS.mobile,
    clip: { x: 0, y: 0, width: 375, height: 812 },
  });

  // Mobile full page
  await screenshot(page, 'mobile-landing-full', {
    viewport: VIEWPORTS.mobile,
    fullPage: true,
  });
}

async function captureAuth(page) {
  console.log('\n📸 Capturing Auth State...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2000);

  // Try clicking sign-in buttons
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.evaluate(el => el.textContent?.toLowerCase() || '');
    if (text.includes('sign in') || text.includes('get started')) {
      await btn.click();
      await sleep(3000);
      break;
    }
  }

  await screenshot(page, 'auth-login', {
    clip: { x: 0, y: 0, width: 1440, height: 800 },
  });

  // Take screenshot of the current URL state
  const url = page.url();
  console.log(`  Current URL: ${url}`);
}

async function main() {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  console.log(`📁 Screenshots → ${SCREENSHOTS_DIR}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000);

    await captureLanding(page);
    await captureMobile(page);
    await captureAuth(page);

    console.log('\n🎉 All screenshots captured successfully!');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
  }
}

main();
