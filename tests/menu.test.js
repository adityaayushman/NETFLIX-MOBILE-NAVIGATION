const { test, before, after } = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { chromium } = require('playwright')

let browser, page

before(async () => {
  browser = await chromium.launch()
})

after(async () => {
  await browser.close()
})

async function load() {
  page = await browser.newPage({ viewport: { width: 375, height: 700 } })
  await page.goto(pathToFileURL(path.join(__dirname, '..', 'index.html')).href)
}

const state = () =>
  page.evaluate(() => ({
    expanded: document.querySelector('.open-btn').getAttribute('aria-expanded'),
    menuInert: document.querySelector('#menu').inert,
    pageInert: document.querySelector('.open-btn').inert,
    active: document.activeElement.className,
  }))

test('menu starts closed and unreachable', async () => {
  await load()
  const s = await state()
  assert.strictEqual(s.expanded, 'false')
  assert.strictEqual(s.menuInert, true)
  assert.strictEqual(s.pageInert, false)
  await page.close()
})

test('open button opens the menu and moves focus inside', async () => {
  await load()
  await page.click('.open-btn')
  const s = await state()
  assert.strictEqual(s.expanded, 'true')
  assert.strictEqual(s.menuInert, false)
  assert.strictEqual(s.pageInert, true)
  assert.match(s.active, /close-btn/)
  await page.close()
})

test('close button closes the menu and returns focus', async () => {
  await load()
  await page.click('.open-btn')
  await page.click('.close-btn')
  const s = await state()
  assert.strictEqual(s.expanded, 'false')
  assert.strictEqual(s.menuInert, true)
  assert.match(s.active, /open-btn/)
  await page.close()
})

test('Escape closes the menu', async () => {
  await load()
  await page.click('.open-btn')
  await page.keyboard.press('Escape')
  const s = await state()
  assert.strictEqual(s.expanded, 'false')
  assert.strictEqual(s.menuInert, true)
  assert.match(s.active, /open-btn/)
  await page.close()
})

test('Tab stays inside the open menu', async () => {
  await load()
  await page.click('.open-btn')
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    const inside = await page.evaluate(() => !!document.activeElement.closest('#menu'))
    assert.ok(inside, `focus escaped the menu on Tab ${i + 1}`)
  }
  await page.close()
})
