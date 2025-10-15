export function data() {
  return {
    permalink: "/devices-data.json",
  };
}

export function render(data) {
  const devices = {};
  
  Object.entries(data.crosBuilds.devices).forEach(([deviceKey, deviceData]) => {
    devices[deviceKey] = {
      key: deviceKey,
      brandNames: deviceData.brandNames,
      mainBoard: deviceData.mainBoard,
      isAue: deviceData.isAue || false,
      architecture: deviceData.brandNameToFormattedDeviceMap && 
                    Object.values(deviceData.brandNameToFormattedDeviceMap)[0]?.architecture,
      versions: {
        stable: {
          chromeVersion: deviceData.servingStable?.chromeVersion || null,
          platformVersion: deviceData.servingStable?.version || null
        },
        beta: {
          chromeVersion: deviceData.servingBeta?.chromeVersion || null,
          platformVersion: deviceData.servingBeta?.version || null
        },
        dev: {
          chromeVersion: deviceData.servingDev?.chromeVersion || null,
          platformVersion: deviceData.servingDev?.version || null
        },
        canary: {
          chromeVersion: deviceData.servingCanary?.chromeVersion || null,
          platformVersion: deviceData.servingCanary?.version || null
        }
      }
    };
  });
  
  return JSON.stringify(devices, null, 2);
}