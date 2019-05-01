const ora = require('ora')
const { mkdir, screenshotImg, runner, ORA_OPTIONS } = require('../utils')

async function getPictures(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' })

  const name = await page.evaluate(_ => document.querySelector('.book-title h1').textContent)
  mkdir(name)

  const issues = await page.evaluate(_ => {
    const listEles = document.querySelectorAll('.chapter-list a');
    return [...listEles].map(ele => ({
      issueUrl: ele.href,
      issueName: ele.textContent,
    }))
  })

  for (const { issueUrl, issueName } of issues) {
    const spinner = ora(ORA_OPTIONS);
    spinner.start(`Downloading ${name}: ${issueName}...`)

    mkdir(`${name}/${issueName}`)

    await page.goto(issueUrl)

    // get total page number
    const pageNumber = await page.evaluate(_ => document.querySelector('#pageSelect').length)

    for (let i = 1; i <= pageNumber; i++) {
      spinner.text = `Downloading ${name}: ${issueName} page ${i}...`
      await page.goto(issueUrl, { waitUntil: 'domcontentloaded' })
      await page.evaluate(i => {
        const selectEle = document.querySelector('#pageSelect')
        selectEle.value = `${i}`
        selectEle.dispatchEvent(new Event('change'))
      }, i)

      let loaded = false, size = null;
      while (!loaded) {
        ({ loaded, size } = await page.evaluate(_ => {
          const imgEle = document.querySelector('#mangaFile')
          if (imgEle && imgEle.complete) {
            [...document.body.childNodes].forEach(e => e.remove())
            document.body.appendChild(imgEle);
            const { width, height } = getComputedStyle(imgEle);
            return { loaded: true, size: { width: Number.parseInt(width), height: Number.parseInt(height) } };
          } else {
            return { loaded: false, size: null }
          }
        }))
      }
      await screenshotImg(page, size, `./${name}/${issueName}/${i}.png`)
    }
    spinner.succeed(`Finished downloading ${name}: ${issueName}`)
  }

  ora().succeed(`Finished downloading ${name}\n`)
}

module.exports = runner(getPictures)
