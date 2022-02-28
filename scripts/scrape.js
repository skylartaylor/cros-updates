var tabletojson = require("tabletojson").Tabletojson
const fs = require("fs")
const { Parser } = require("json2csv")
const stripHtml = require("string-strip-html")

var url = "https://chromiumdash.appspot.com/serving-builds?deviceCategory=Chrome%20OS"

tabletojson.convertUrl(url, { stripHtmlFromCells: false }, function(
  tablesAsJson
) {
  var data = tablesAsJson[0].map(item => {
    item.Codename = stripHtml(item.Codename)
    return item
  })

  var json = JSON.stringify(data, null, 4)

  fs.writeFile("./src/data/cros-updates-new.json", json, err => {
    if (err) throw err
  })

  const csvdata = data.map(item => {
    Object.keys(item).forEach(function(key) {
      item[key] = item[key].replace("<br>", "\\n")
    })
    return item
  })

  const json2csvParser = new Parser()
  const csv = json2csvParser.parse(csvdata)

  fs.writeFile("./src/data/cros-updates-new.csv", csv, err => {
    if (err) throw err
  })
})
