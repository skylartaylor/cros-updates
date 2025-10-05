const fetch = require("node-fetch")
const fs = require("fs")
const { Parser } = require("json2csv")

let url = "https://chromiumdash.appspot.com/cros/fetch_serving_builds"
let settings = { method: "Get" }

fetch(url, settings)
    .then(res => res.json())
    .then((json) => {

        let data=json.builds
        let crosUpdatesData = []

        function formatVersionString(version) {
            if (version === undefined) {
                return "No Update"
            } else {
                return version.version + "<br>" + version.chromeVersion
            }
        }

        function formatBoardObject(board, name) {

            let boardObject = {
                "Codename": name,
                "Stable": formatVersionString(board.servingStable),
                "Beta": formatVersionString(board.servingBeta),
                "Dev": formatVersionString(board.servingDev),
                "Canary": formatVersionString(board.servingCanary),
                "Recovery": board.pushRecoveries,
                "Brand names": board.brandNames.sort().join(', '),
                "isAue": board.isAue,
            }
            return boardObject
        }

        Object.keys(data).forEach(boardName => {
            let board = data[boardName]

            //checking for codename with sub-boards (no channel info on main device obj)
            if (board.servingStable === undefined) {
                // grab version data from first sub-board and mainboard, push to array
                let mainBoardVersions = Object.values(board.models)[0]
                mainBoardVersions.pushRecoveries = board.pushRecoveries
                mainBoardVersions.subboard = false
                crosUpdatesData.push(formatBoardObject(mainBoardVersions, boardName))

                //iterate over sub-boards and push to array
                Object.keys(board.models).forEach(modelName => {
                    model = board.models[modelName]
                    model.pushRecoveries = board.pushRecoveries
                    model.subboard = true
                    //don't push if sub-board and mainboard name are the same
                    if (modelName !== boardName) {
                        crosUpdatesData.push(formatBoardObject(model, modelName))
                            }
                        })
                    } else {
                        //(hopefully) temporary fix for issue with bob board
                        if (boardName === "bob") {
                            board.servingBeta = board.models.bob.servingBeta
                            board.servingDev = board.models.bob.servingDev
                            board.servingCanary = board.models.bob.servingCanary
                            console.log("hi i'm bob" + JSON.stringify(board))
                        }
                        //for boards with no sub-boards, just push data to array
                        board.subboard = false
                        crosUpdatesData.push(formatBoardObject(board, boardName))
                    }

                })
                //write JSON to file
                fs.writeFile('./src/data/cros-updates.json', JSON.stringify(crosUpdatesData, null, 2), err => {
                    if (err) {
                        console.error(err)
                        return
                    }
                })
                //convert data to CSV format for Discord Bot
                const legacycsv = []

                crosUpdatesData.map( item => {
                    let csvDevice = {
                        "Codename": item.Codename,
                        "Pinned 93": "NA",
                        "Pinned 94": "NA",
                        "Pinned 96": "NA",
                        "Pinned 97": "NA",
                        "Pinned 98": "NA",
                        "Stable": item.Stable.replace('<br>', "\\n"),
                        "Beta": item.Beta.replace('<br>', "\\n"),
                        "Dev": item.Dev.replace('<br>', "\\n"),
                        "Canary": item.Canary.replace('<br>', "\\n"),
                        "Recovery": "NA",
                        "Brand names": item['Brand names']
                    }
                    legacycsv.push(csvDevice)
                })

                const json2csvParser = new Parser()
                const csv = json2csvParser.parse(legacycsv)

                //write CSV to file
                fs.writeFile("./src/data/cros-updates.csv", csv, err => {
                if (err) throw err
                })

    })
