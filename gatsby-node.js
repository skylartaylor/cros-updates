const axios = require('axios');
const path = require('path')

exports.createPages = async ({ actions }) => {
  const { createPage } = actions;
  const apiUrl = 'https://chromiumdash.appspot.com/cros/fetch_serving_builds';

  try {
    const response = await axios.get(apiUrl);
    const builds = response.data.builds;
    const generationTime = new Date().toISOString();

 // Create device pages
 Object.entries(builds).forEach(([codename, device], index) => {
  const hasSingleModelWithSameCodename =
    device.models &&
    Object.keys(device.models).length === 1 &&
    Object.keys(device.models)[0] === codename;

  if (!device.models || device.brandNames) {
    const model = device.models ? Object.values(device.models)[0] : undefined;
    const brandNames = device.brandNames ? device.brandNames : (model && model.brandNames ? model.brandNames : undefined);
    if (brandNames === undefined ) {
      console.log(device)
    }
    createPage({
      path: `/device/${codename}`,
      component: path.resolve('./src/templates/device.js'),
      context: {
        device: {
          codename: codename,
          generationTime: generationTime,
          ...device,
        },
      },
    });
  } else if ( hasSingleModelWithSameCodename ) {
    const model = device.models ? Object.values(device.models)[0] : undefined;
    const brandNames = device.brandNames ? device.brandNames : (model && model.brandNames ? model.brandNames : undefined);
    if (brandNames === undefined ) {
      console.log(device)
    }
    createPage({
      path: `/device/${codename}`,
      component: path.resolve('./src/templates/device.js'),
      context: {
        device: {
          codename: codename,
          generationTime: generationTime,
          ...model,
        },
      },
    });
  } else {
    // Create a mainboard page for devices with models
    createPage({
      path: `/board/${codename}`,
      component: path.resolve('./src/templates/board.js'),
      context: {
        device: {
          codename: codename,
          generationTime: generationTime,
          brandNames: [ "Board:" + codename ],
          ...device,
        },
      },
    });

    Object.entries(device.models).forEach((model) => {
      const modelCodename = model[0]
      const pathName = modelCodename

      createPage({
        path: `/device/${pathName}`,
        component: path.resolve('./src/templates/device.js'),
        context: {
          device: {
            codename: modelCodename,
            mainBoard: codename,
            generationTime: generationTime,
            ...model[1],
          },
        },
      });
    });
  }
});

    // Create the /table page
    createPage({
      path: `/table`,
      component: path.resolve('./src/templates/table.js'),
      context: {
        builds: Object.values(builds),
        generationTime,
      },
    });

  } catch (error) {
    console.error('Error fetching data:', error);
  }
};