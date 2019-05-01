const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')

exports.mkdir = function(dirName) {
  const absolutePath = path.resolve(__dirname, '../downloads', dirName)
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath)
  } else {
    console.warn(`\n${absolutePath} exists!`)
    process.exit(1)
  }
}

exports.downloadImg = async function(page, src, filePath) {
  const viewSource = await page.goto(src)
  const data = await viewSource.buffer()
  fs.writeFileSync(path.resolve(__dirname, '../downloads', filePath), data)
}

exports.screenshotImg = async function(page, size, filePath) {
  page.setViewport({ width: size.width + 30, height: size.height + 30 })
  await page.screenshot({
    path: path.resolve(__dirname, '../downloads', filePath),
    clip: Object.assign(size, { x: 0, y: 0 })
  })
}

exports.runner = function(getPictures) {
  return async function(urls) {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setDefaultTimeout(0)

    for (const url of urls) {
      await getPictures(page, url)
    }
  }
}

exports.ORA_OPTIONS = {
  spinner: 'dots'
}
