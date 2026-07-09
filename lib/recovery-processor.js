// Match recovery images to devices based on board name
export function matchRecoveryToDevice(recovery, deviceData) {
  const boardKeyLower = deviceData.mainBoard?.toLowerCase() || '';
  const recoveryFile = recovery.file?.toLowerCase() || '';
  const recoveryUrl = recovery.url?.toLowerCase() || '';

  // Match the delimited board token (chromeos_<version>_<board>_recovery_...)
  // so board "gru" does not match a "grunt" recovery image.
  const boardToken = `_${boardKeyLower}_recovery`;

  return boardKeyLower && (recoveryFile.includes(boardToken) || recoveryUrl.includes(boardToken));
}

// Initialize recovery collections for a device
function initializeRecoveries(deviceData, deviceKey) {
  const recoveries = {
    stable: [],
    beta: [],
    ltc: [],
    ltr: []
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

// Compare two ChromeOS platform version strings (e.g. "15437.42.0") for a
// descending (newest first) sort. Components are compared numerically one at a
// time; missing or non-numeric components count as 0. parseFloat is unsafe here
// because "15437.42.0" > "15437.8.0" only holds under component-wise ordering.
export function compareChromeOsVersionsDesc(a, b) {
  const aParts = String(a).split('.');
  const bParts = String(b).split('.');
  const length = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < length; i++) {
    const aPart = Number(aParts[i]) || 0;
    const bPart = Number(bParts[i]) || 0;
    if (aPart !== bPart) {
      return bPart - aPart;
    }
  }

  return 0;
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
  deduplicated.sort((a, b) => compareChromeOsVersionsDesc(a.version, b.version));

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

        if (channel === 'beta' || channel === 'ltc' || channel === 'ltr') {
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
