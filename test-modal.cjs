const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:3000/?app=manager', {waitUntil: 'networkidle0'});
  
  // Bypass login
  const loginButtons = await page.$$('button');
  for (let btn of loginButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Bypass') || text.includes('Accès Agent')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 1000));
      break;
    }
  }

  
  const buttons = await page.$$('button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('New Announcement') || text.includes('Nouvelle Annonce')) {
      console.log('Found button:', text);
      await btn.click();
      console.log('Clicked button.');
    }
  }
  
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({path: 'screenshot.png', fullPage: true});
  
  const modal = await page.$('.fixed.inset-0');

  if (modal) {
    console.log('Modal is present in DOM');
    const isVisible = await page.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }, modal);
    console.log('Modal is visible:', isVisible);
    const html = await page.evaluate(el => el.outerHTML, modal);
    console.log('Modal HTML snippet:', html.substring(0, 200));
  } else {
    console.log('Modal is NOT in DOM');
  }
  
  await browser.close();
})();
