const ora = require('ora')
const { mkdir, downloadImg, runner, ORA_OPTIONS } = require('../utils')

async function getPictures(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' })

  const name = await page.evaluate(_ => document.querySelector('.wrap h1').textContent)
  mkdir(name)

  const issues = await page.evaluate(_ => {
    const listEles = document.querySelectorAll('.wrap .middleright .cartoon_online_border a');
    return [...listEles].map(ele => ({
      issueUrl: ele.href,
      issueName: ele.textContent,
    }))
  })

  for (const { issueUrl, issueName } of issues) {
    const spinner = ora(ORA_OPTIONS);
    spinner.start(`Downloading ${name}: ${issueName}...`)

    mkdir(`${name}/${issueName}`)

    await page.goto(`${issueUrl}#@page=1`)

    // get total page number
    const pageNumber = await page.evaluate(_ => document.querySelector('#page_select').length)

    for (let i = 1; i <= pageNumber; i++) {
      spinner.text = `Downloading ${name}: ${issueName} page ${i}...`
      await page.goto(`${issueUrl}#@page=${i}`)
      const src = await page.evaluate(_ => document.querySelector('#center_box img').src)
      await downloadImg(page, src, `${name}/${issueName}/${i}.png`)
    }
    spinner.succeed(`Finished downloading ${name}: ${issueName}`)
  }

  ora().succeed(`Finished downloading ${name}\n`)
}

module.exports = runner(getPictures)
