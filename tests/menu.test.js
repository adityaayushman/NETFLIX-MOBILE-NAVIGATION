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
    expanded: document.querySelector('#more-btn').getAttribute('aria-expanded'),
    sheetInert: document.querySelector('#sheet').inert,
    contentInert: document.querySelector('.content').inert,
    activeId: document.activeElement.id,
  }))

// The sheet animates for 300ms
const settle = () => page.waitForTimeout(400)

test('sheet starts closed and unreachable', async () => {
  await load()
  const s = await state()
  assert.strictEqual(s.expanded, 'false')
  assert.strictEqual(s.sheetInert, true)
  assert.strictEqual(s.contentInert, false)
  await page.close()
})

test('More opens the sheet and moves focus inside', async () => {
  await load()
  await page.click('#more-btn')
  const s = await state()
  assert.strictEqual(s.expanded, 'true')
  assert.strictEqual(s.sheetInert, false)
  assert.strictEqual(s.contentInert, true)
  assert.strictEqual(s.activeId, 'sheet-close')
  await page.close()
})

test('close button closes the sheet and returns focus', async () => {
  await load()
  await page.click('#more-btn')
  await settle()
  await page.click('#sheet-close')
  const s = await state()
  assert.strictEqual(s.expanded, 'false')
  assert.strictEqual(s.sheetInert, true)
  assert.strictEqual(s.activeId, 'more-btn')
  await page.close()
})

test('Escape closes the sheet', async () => {
  await load()
  await page.click('#more-btn')
  await page.keyboard.press('Escape')
  const s = await state()
  assert.strictEqual(s.expanded, 'false')
  assert.strictEqual(s.activeId, 'more-btn')
  await page.close()
})

test('tapping the backdrop closes the sheet', async () => {
  await load()
  await page.click('#more-btn')
  await settle()
  await page.mouse.click(187, 40)
  const s = await state()
  assert.strictEqual(s.expanded, 'false')
  await page.close()
})

test('Tab stays inside the open sheet', async () => {
  await load()
  await page.click('#more-btn')
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab')
    const inside = await page.evaluate(() => !!document.activeElement.closest('#sheet'))
    assert.ok(inside, `focus escaped the sheet on Tab ${i + 1}`)
  }
  await page.close()
})

test('choosing a sheet link closes the sheet and navigates', async () => {
  await load()
  await page.click('#more-btn')
  await settle()
  await page.click('#sheet a[href="#help"]')
  const s = await state()
  assert.strictEqual(s.expanded, 'false')
  assert.strictEqual(await page.evaluate(() => location.hash), '#help')
  await page.close()
})

test('tab bar marks the current tab', async () => {
  await load()
  await page.click('.tab[href="#explore"]')
  const current = await page.evaluate(() =>
    [...document.querySelectorAll('.tab[aria-current="page"]')].map(t => t.getAttribute('href')))
  assert.deepStrictEqual(current, ['#explore'])
  await page.close()
})
