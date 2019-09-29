var tabletojson = require("tabletojson")
const fs = require("fs")
const { Parser } = require("json2csv")
const stripHtml = require("string-strip-html")

var url = "https://cros-updates-serving.appspot.com/"

tabletojson.convertUrl(url, { stripHtmlFromCells: false }, function(
  tablesAsJson
) {
  var data = tablesAsJson[0].map(item => {
    item.Codename = stripHtml(item.Codename)
    return item
  })

  var json = JSON.stringify(data, null, 4)

  fs.writeFile("./src/data/cros-updates.json", json, err => {
    if (err) throw err
  })

  const json2csvParser = new Parser()
  const csv = json2csvParser.parse(data)

  fs.writeFile("./src/data/cros-updates.csv", csv, err => {
    if (err) throw err
  })
})
