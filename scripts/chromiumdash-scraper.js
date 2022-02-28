const puppeteer = require("puppeteer")

;(async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://chromiumdash.appspot.com/serving-builds?deviceCategory=Chrome%20OS")
    await page.waitForSelector(".grid-row")
    
    const data = await page.evaluate(() => {
        const list = []
        const items = document.querySelectorAll("div.grid-row")

        for (const item of items) {
            list.push({
                "Codename": item.querySelector("div.serving-build-board-name > span").innerHTML,
            })
        }
        return list
    })

    console.log(data)
    await browser.close()

})()