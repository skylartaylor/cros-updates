export function data() {
  return {
    layout: "base.njk",
    title: "All Devices - Chrome OS Updates",
    permalink: "/table/",
  };
}

export function render(data) {
  const crosBuilds = data.crosBuilds;

  // Helper function to get version shading class based on comparedToMostCommon value
  function getVersionClass(comparedValue) {
    if (comparedValue === undefined || comparedValue === null) return '';
    switch(comparedValue) {
      case 0: return 'version-most-common';     // Cyan
      case 1: return 'version-newer';           // Purple
      case 2: return 'version-older-minor';     // Yellow
      case 3: return 'version-older-major';     // Orange
      default: return '';
    }
  }

  // Helper function to format version with optional platform version
  function formatVersion(versionData) {
    if (!versionData || !versionData.chromeVersion) return "N/A";
    
    const chromeVersion = versionData.chromeVersion;
    const platformVersion = versionData.version;
    
    return `<div class="version-display">
      <div class="chrome-version">${chromeVersion}</div>
      <div class="platform-version" style="display: none;">${platformVersion || 'N/A'}</div>
    </div>`;
  }

  return `
    <div class="tableHeaderContainer">
      <div class="tableHeader">
        <h1>All Devices</h1>
        <!-- Version shading legend -->
        <div class="version-legend">
          <span class="version-legend-title">Version Status:</span>
          <div class="version-legend-item">
            <div class="version-legend-color legend-newer"></div>
            <span>Newer than most</span>
          </div>
          <div class="version-legend-item">
            <div class="version-legend-color legend-most-common"></div>
            <span>Most common</span>
          </div>
          <div class="version-legend-item">
            <div class="version-legend-color legend-older-minor"></div>
            <span>Older minor version</span>
          </div>
          <div class="version-legend-item">
            <div class="version-legend-color legend-older-major"></div>
            <span>Older major version</span>
          </div>
        </div>
        <button id="toggleColumnsButton" class="editColumnsBtn">Display Options</button>
      </div>
    </div>

    <!-- Modal for column selection -->
    <div id="columnsModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Display Options</h2>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="column-options">
              <label class="column-option">
                <input type="checkbox" id="toggle-stableVersion" class="column-checkbox" checked>
                <span>Stable</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-betaVersion" class="column-checkbox" checked>
                <span>Beta</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-devVersion" class="column-checkbox" checked>
                <span>Dev</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-canaryVersion" class="column-checkbox" checked>
                <span>Canary</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-ltsVersion" class="column-checkbox">
                <span>LTS</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-ltcVersion" class="column-checkbox">
                <span>LTC</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-brandNames" class="column-checkbox" checked>
                <span>Device Names</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-releaseVersion" class="column-checkbox">
                <span>First Release</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-androidVersion" class="column-checkbox">
                <span>Android Version</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-kernelVersion" class="column-checkbox">
                <span>Kernel Version</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-architecture" class="column-checkbox">
                <span>Architecture</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-recovery" class="column-checkbox">
                <span>Recovery</span>
              </label>
            </div>
            <hr style="margin: var(--spacing-4) 0; border: none; border-top: 1px solid var(--color-background-contrast);">
            <div class="filter-options">
              <label class="column-option">
                <input type="checkbox" id="toggle-showEol" class="filter-checkbox" checked>
                <span>Show EOL Devices</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-versionShading" class="filter-checkbox">
                <span>Show Version Shading</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-platformVersions" class="filter-checkbox">
                <span>Show Platform Versions</span>
              </label>
              <label class="column-option">
                <input type="checkbox" id="toggle-popupDeviceNames" class="filter-checkbox">
                <span>Popup Device Names</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <div class="modal-footer-left">
              <button id="showAllColumns" class="modal-show-all" style="display: none;">Show All</button>
              <button id="resetDefaults" class="modal-reset">Reset to Default</button>
            </div>
            <div class="modal-actions">
              <button id="cancelColumns" class="modal-cancel">Cancel</button>
              <button id="applyColumns" class="modal-apply">Apply</button>
            </div>
          </div>
        </div>
      </div>

    <!-- Modal for device names popup -->
    <div id="deviceNamesModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Device Names</h2>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div id="deviceNamesContent" class="device-names-list">
              <!-- Device names will be populated here -->
            </div>
          </div>
          <div class="modal-footer">
            <div class="modal-actions">
              <button id="closeDeviceNames" class="modal-cancel">Close</button>
            </div>
          </div>
        </div>
      </div>

    <!-- Modal for recovery images -->
    <div id="recoveryModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Recovery Images</h2>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div id="recoveryContent" class="recovery-list">
              <!-- Recovery images will be populated here -->
            </div>
          </div>
          <div class="modal-footer">
            <div class="modal-actions">
              <button id="closeRecovery" class="modal-cancel">Close</button>
            </div>
          </div>
        </div>
      </div>

    <div class="tablePageWrapper">
      <Section class="tablePage">

      <table>
        <thead>
          <tr>
            <th class="boardDevice">Board / Device</th>
            <th class="stableVersion">Stable</th>
            <th class="betaVersion">Beta</th>
            <th class="devVersion">Dev</th>
            <th class="canaryVersion">Canary</th>
            <th class="ltsVersion">LTS</th>
            <th class="ltcVersion">LTC</th>
            <th class="brandNames">Device Names</th>
            <th class="releaseVersion">First Release</th>
            <th class="androidVersion">Android Version</th>
            <th class="kernelVersion">Kernel Version</th>
            <th class="architecture">Architecture</th>
            <th class="recovery">Recovery</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(crosBuilds.boards)
            .map(
              ([boardKey, boardData]) => `
                  <tr class="boardHeader">
                      <th colspan="13"><a href="/board/${boardKey}">${boardKey} <span>Board</span></a></th>
                  </tr>
                  ${Object.entries(boardData.devices)
                    .map(
                      ([deviceKey, deviceData]) => `
                          <tr class="${deviceData.isAue ? "eol-device" : ""}">
                              <td class="boardDevice">
                                ${deviceKey ? `<a href="/device/${deviceKey}">${deviceKey}</a>` : "N/A"}
                                ${deviceData.isAue ? '<span class="eol-tag">EOL</span>' : ""}
                              </td>
                              <td class="stableVersion ${getVersionClass(deviceData.servingStable?.comparedToMostCommon)}">${formatVersion(deviceData.servingStable)}</td>
                              <td class="betaVersion ${getVersionClass(deviceData.servingBeta?.comparedToMostCommon)}">${formatVersion(deviceData.servingBeta)}</td>
                              <td class="devVersion ${getVersionClass(deviceData.servingDev?.comparedToMostCommon)}">${formatVersion(deviceData.servingDev)}</td>
                              <td class="canaryVersion ${getVersionClass(deviceData.servingCanary?.comparedToMostCommon)}">${formatVersion(deviceData.servingCanary)}</td>
                              <td class="ltsVersion ${getVersionClass(deviceData.servingLtr?.comparedToMostCommon)}">${formatVersion(deviceData.servingLtr)}</td>
                              <td class="ltcVersion ${getVersionClass(deviceData.servingLtc?.comparedToMostCommon)}">${formatVersion(deviceData.servingLtc)}</td>
                              <td class="brandNames" data-device-names='${JSON.stringify(deviceData.brandNames || []).replace(/'/g, "&apos;")}'>
                                <span class="brand-names-full">${deviceData.brandNames?.join(", ") || "N/A"}</span>
                                <button class="brand-names-view-btn" style="display: none;" data-device-key="${deviceKey}">
                                  View
                                </button>
                              </td>
                              <td class="releaseVersion">${deviceData.fsiMilestoneNumber || "N/A"}</td>
                              <td class="androidVersion">${(() => {
                                const boardName = deviceData.mainBoard || deviceKey;
                                const enhancedData = data.enhancedDevices?.[boardName] || {};
                                const androidVersion = enhancedData.android_version || "N/A";
                                return androidVersion === "N/A" ? androidVersion : androidVersion.replace(/^Android\s+/i, "");
                              })()}</td>
                              <td class="kernelVersion">${(() => {
                                const boardName = deviceData.mainBoard || deviceKey;
                                const enhancedData = data.enhancedDevices?.[boardName] || {};
                                return enhancedData.kernel_version || "N/A";
                              })()}</td>
                              <td class="architecture">${Object.values(deviceData.brandNameToFormattedDeviceMap)[0]?.architecture || "N/A"}</td>
                              <td class="recovery">
                                ${(() => {
                                  const hasRecoveries = deviceData.recoveries && (
                                    (deviceData.recoveries.stable && deviceData.recoveries.stable.length > 0) ||
                                    (deviceData.recoveries.beta && deviceData.recoveries.beta.length > 0) ||
                                    (deviceData.recoveries.ltc && deviceData.recoveries.ltc.length > 0) ||
                                    (deviceData.recoveries.ltr && deviceData.recoveries.ltr.length > 0)
                                  );
                                  
                                  if (hasRecoveries) {
                                    return `<button class="recovery-view-btn" data-device-key="${deviceKey}" data-recoveries='${JSON.stringify(deviceData.recoveries || {}).replace(/'/g, "&apos;")}'>View</button>`;
                                  } else {
                                    return "N/A";
                                  }
                                })()}
                              </td>
                          </tr>
                      `,
                    )
                    .join("")}
              `,
            )
            .join("")}
        </tbody>
      </table>

      <script src="/public/js/app.js"></script>
      </Section>
    </div>
  `;
}
