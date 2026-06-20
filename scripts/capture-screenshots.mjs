import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'screenshots');
const BASE = 'http://localhost:3000';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// Hero section
const hero = await context.newPage();
await hero.goto(BASE, { waitUntil: 'networkidle' });
await hero.waitForTimeout(1500);
await hero.screenshot({ path: path.join(OUT, 'hero.png') });
console.log('hero.png');

// Features section
const features = await context.newPage();
await features.goto(`${BASE}/#features`, { waitUntil: 'networkidle' });
await features.locator('#features').scrollIntoViewIfNeeded();
await features.waitForTimeout(1000);
await features.screenshot({ path: path.join(OUT, 'features.png') });
console.log('features.png');

// Auth login (existing vault)
const authLogin = await context.newPage();
await authLogin.goto(`${BASE}/auth`, { waitUntil: 'networkidle' });
await authLogin.evaluate(() => {
  localStorage.setItem('zv_salt', 'dGVzdC1zYWx0LWRlbW8=');
  localStorage.setItem('zv_hash', 'mock-verifier-hash');
});
await authLogin.reload({ waitUntil: 'networkidle' });
await authLogin.waitForTimeout(1000);
await authLogin.screenshot({ path: path.join(OUT, 'auth-login.png') });
console.log('auth-login.png');

// Extension popup
const extPath = `file:///${path.join(ROOT, 'extension', 'index.html').replace(/\\/g, '/')}`;
const ext = await context.newPage();
await ext.setViewportSize({ width: 320, height: 280 });
await ext.goto(extPath, { waitUntil: 'load' });
await ext.waitForTimeout(500);
await ext.screenshot({ path: path.join(OUT, 'extension-popup.png') });
console.log('extension-popup.png');

await browser.close();
console.log('Done');
