// Match recovery images to devices based on board name
function matchRecoveryToDevice(recovery, deviceData) {
  const boardKeyLower = deviceData.mainBoard?.toLowerCase() || '';
  const recoveryFile = recovery.file?.toLowerCase() || '';
  const recoveryUrl = recovery.url?.toLowerCase() || '';

  return boardKeyLower && (recoveryFile.includes(boardKeyLower) || recoveryUrl.includes(boardKeyLower));
}

// Initialize recovery collections for a device
function initializeRecoveries(deviceData, deviceKey) {
  const recoveries = {
    stable: [],
    beta: [],
    ltc: [],
    lts: []
  };

  // Move existing pushRecoveries to stable channel
  if (deviceData.pushRecoveries) {
    recoveries.stable = Object.entries(deviceData.pushRecoveries)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([version, url]) => ({
        version,
        url,
        channel: 'stable',
        name: `${deviceKey} Recovery`,
        chromeVersion: version
      }));
  }

  return recoveries;
}

// Create a recovery entry from raw recovery data
function createRecoveryEntry(recovery, channel) {
  return {
    version: recovery.version,
    chromeVersion: recovery.chrome_version,
    url: recovery.url,
    channel: channel,
    name: recovery.name,
    manufacturer: recovery.manufacturer,
    model: recovery.model,
    filesize: recovery.filesize,
    zipfilesize: recovery.zipfilesize,
    md5: recovery.md5,
    sha1: recovery.sha1
  };
}

// Deduplicate and sort recoveries by version
function deduplicateAndSort(recoveries) {
  const seen = new Set();
  const deduplicated = recoveries.filter(recovery => {
    const key = `${recovery.chromeVersion || recovery.version}-${recovery.url}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  // Sort by version (highest first)
  deduplicated.sort((a, b) => {
    const aVersion = parseFloat(a.version) || 0;
    const bVersion = parseFloat(b.version) || 0;
    return bVersion - aVersion;
  });

  return deduplicated;
}

// Add recovery data to devices
export function processRecoveryData(devices, recoveryData) {
  Object.keys(devices).forEach(deviceKey => {
    const deviceData = devices[deviceKey];

    // Initialize recovery collections
    if (!deviceData.recoveries) {
      deviceData.recoveries = initializeRecoveries(deviceData, deviceKey);
    }

    // Find matching recoveries from recovery2.json
    recoveryData.forEach(recovery => {
      if (matchRecoveryToDevice(recovery, deviceData)) {
        const channel = recovery.channel?.toLowerCase() || 'unknown';

        if (channel === 'beta' || channel === 'ltc' || channel === 'lts') {
          const recoveryEntry = createRecoveryEntry(recovery, channel);

          if (deviceData.recoveries[channel]) {
            deviceData.recoveries[channel].push(recoveryEntry);
          }
        }
      }
    });

    // Deduplicate and sort each channel
    Object.keys(deviceData.recoveries).forEach(channel => {
      deviceData.recoveries[channel] = deduplicateAndSort(deviceData.recoveries[channel]);
    });
  });

  return devices;
}
