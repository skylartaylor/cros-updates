const path = require('path')
const data = require('./src/data/cros-updates.json')

exports.createPages = ({ actions }) => {
    const { createPage } = actions
    const template = path.resolve('./src/components/DevicePageStatic.js')

    data.forEach(device => {
        var path = "/device/" + device.Codename
        if (device.Stable !== undefined) {
            createPage({
                path,
                component: template,
                context: device,
            })
        }
    })
}