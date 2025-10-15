module.exports = class {
  data() {
    return {
      permalink: '/search.json',
      eleventyExcludeFromCollections: true,
    };
  }

  render({ crosBuilds }) {
    const searchIndex = [];

    // Process devices
    for (const [deviceKey, deviceData] of Object.entries(crosBuilds.devices)) {
      searchIndex.push({
        type: 'device',
        key: deviceKey,
        brandNames: deviceData.brandNames,
        mainBoard: deviceData.mainBoard,
        isAue: deviceData.isAue,
        // Add other relevant fields as needed
      });
    }

    // Process boards
    for (const [boardKey, boardData] of Object.entries(crosBuilds.boards)) {
      searchIndex.push({
        type: 'board',
        key: boardKey,
        // Add other relevant fields as needed
      });
    }

    return JSON.stringify(searchIndex);
  }
};