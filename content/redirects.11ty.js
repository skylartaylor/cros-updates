export function data() {
  return {
    permalink: "/_redirects",
    eleventyExcludeFromCollections: true,
  };
}

export function render(data) {
  const redirects = [];

  // Generate redirects for single-device boards
  Object.entries(data.crosBuilds.singleDeviceBoards || {}).forEach(([boardKey, boardData]) => {
    const devices = Object.keys(boardData.devices || {});
    if (devices.length === 1) {
      const deviceKey = devices[0];
      redirects.push(`/board/${boardKey} /device/${deviceKey} 301`);
    }
  });

  return redirects.join('\n');
}
