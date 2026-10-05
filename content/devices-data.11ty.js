import { osVersion } from '../lib/googlebook.js';

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
      platform: 'chromeos',
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

  for (const device of data.googlebooks || []) {
    devices[device.id] = {
      key: device.id, platform: device.platform, name: device.name,
      codename: device.codename, url: device.url,
      recovery: {
        build: device.latestRecovery.build, version: osVersion(device.latestRecovery.build),
        channel: device.latestRecovery.channel,
        url: device.latestRecovery.url,
      },
    };
  }
  
  return JSON.stringify(devices, null, 2);
}
