const path = require('path')
const fs = require('fs')
const ora = require('ora')
const dmzj = require('./src/dmzj')
const manhuagui = require('./src/manhuagui')
const dongman = require('./src/dongman')
const { dmzjUrls, manhuaguiUrls, dongmanUrls } = require('./urls')

const downloadFolderPath = path.resolve(__dirname, '../downloads')
if (!fs.existsSync(downloadFolderPath)) {
  fs.mkdirSync(downloadFolderPath)
}

async function download() {
  await dmzj(dmzjUrls)
  await manhuagui(manhuaguiUrls)
  await dongman(dongmanUrls)

  ora().succeed('Download finished!')
  process.exit(0)
}

download();
