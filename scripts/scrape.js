var tabletojson = require("tabletojson")
const fs = require("fs")
const { Parser } = require("json2csv")
var url = "https://cros-updates-serving.appspot.com/"
tabletojson.convertUrl(url, function(tablesAsJson) {
  var datamap = {}
  tablesAsJson[0].forEach(element => {
    datamap[element.Codename] = element
  })
  fs.writeFile(
    "./src/data/cros-updates.json",
    JSON.stringify(tablesAsJson[0], null, 4),
    err => {
      // throws an error, you could also catch it here
      if (err) throw err
    }
  )
  const json2csvParser = new Parser()
  const csv = json2csvParser.parse(tablesAsJson[0])
  fs.writeFile("./src/data/cros-updates.csv", csv, err => {
    if (err) throw err
  })
})
