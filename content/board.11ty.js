export function data() {
  // Reference global data directly
  // Note: crosBuilds.boards only contains multi-device boards
  // Single-device boards are in crosBuilds.singleDeviceBoards
  return {
    pagination: {
      data: "crosBuilds.boards",
      size: 1,
      alias: "board",
    },
    layout: "base.njk",
    permalink: (data) => `/board/${data.board}/`,
    eleventyComputed: {
      title: (data) => `${data.board} - Chrome OS Updates`,
    },
  };
}
export function render(data) {
  const boardKey = data.board;
  const boardData = data.crosBuilds.boards[boardKey];

  // Get recovery data from the first device (all devices on same board share recoveries)
  const firstDevice = Object.values(boardData.devices)[0];

  // Get the latest recovery from any channel, or show "No Recoveries"
  let latestRecoveryVersion, latestRecoveryURL, hasAnyRecoveries = false;

  if (firstDevice.recoveries) {
    // Check all channels for any recoveries
    const allRecoveries = [
      ...(firstDevice.recoveries.stable || []),
      ...(firstDevice.recoveries.beta || []),
      ...(firstDevice.recoveries.ltc || []),
      ...(firstDevice.recoveries.ltr || [])
    ];

    if (allRecoveries.length > 0) {
      hasAnyRecoveries = true;
      // Prefer stable, but fallback to any channel
      const latestRecovery = firstDevice.recoveries.stable?.[0] || allRecoveries[0];
      latestRecoveryVersion = latestRecovery.chromeVersion || latestRecovery.version;
      latestRecoveryURL = latestRecovery.url;
    }
  }

  // Fallback to pushRecoveries if no new recoveries
  if (!hasAnyRecoveries && firstDevice.pushRecoveries) {
    const pushRecoveryKeys = Object.keys(firstDevice.pushRecoveries);
    if (pushRecoveryKeys.length > 0) {
      hasAnyRecoveries = true;
      latestRecoveryVersion = Math.max(
        ...pushRecoveryKeys.map(Number),
      );
      latestRecoveryURL = firstDevice.pushRecoveries[latestRecoveryVersion];
    }
  }

  if (!hasAnyRecoveries) {
    latestRecoveryVersion = null;
    latestRecoveryURL = null;
  }

  // Generate the device list markup
  const deviceList = Object.entries(boardData.devices)
    .map(
      ([deviceKey, deviceData]) => `
      <div class="board-device-card">
          <a href="/device/${deviceKey}">
              <h3>${deviceKey}</h3>
              <div class="version-list">
                  <div class="version-row">
                      <span class="channel-name stable">STABLE</span>
                      <span class="version-number">${deviceData.servingStable?.chromeVersion || "N/A"}</span>
                  </div>
                  <div class="version-row">
                      <span class="channel-name beta">BETA</span>
                      <span class="version-number">${deviceData.servingBeta?.chromeVersion || "N/A"}</span>
                  </div>
                  <div class="version-row">
                      <span class="channel-name dev">DEV</span>
                      <span class="version-number">${deviceData.servingDev?.chromeVersion || "N/A"}</span>
                  </div>
                  <div class="version-row">
                      <span class="channel-name canary">CANARY</span>
                      <span class="version-number">${deviceData.servingCanary?.chromeVersion || "N/A"}</span>
                  </div>
              </div>
          </a>
      </div>
    `,
    )
    .join("");

  return `
    <Section class="boardPage">
      <Header>
        <div class="boardInfo">
          <div>
            <h1>${boardKey}</h1>
            <h2 class="mainBoard">Board</h2>
          </div>
        </div>
        <div class="recoveryLink">
          <div class="recoveryDropdown">
              <div class="recoveryWrapper${hasAnyRecoveries ? '' : ' no-recoveries'}">
                ${hasAnyRecoveries
                  ? `<a class="recoveryBtn deviceHeaderBtn" href="${latestRecoveryURL}">&#x2B07; Recovery (${latestRecoveryVersion})</a>`
                  : `<span class="recoveryBtn deviceHeaderBtn disabled">No Recoveries</span>`
                }
                <button class="dropdownToggleBtn" aria-label="Show older recovery versions">▼</button>
              </div>
                <div class="dropdownContent">
                  ${(() => {
                    if (!hasAnyRecoveries) {
                      return `<div class="no-recoveries-message">No recovery images available for this board.</div>`;
                    }

                    const recoveries = firstDevice.recoveries;
                    if (!recoveries) {
                      // Fallback to original pushRecoveries format
                      return Object.entries(firstDevice.pushRecoveries || {})
                        .sort((a, b) => Number(b[0]) - Number(a[0]))
                        .map(([version, url]) => `<a href="${url}">Chrome OS ${version}</a>`)
                        .join("");
                    }

                    let dropdownHTML = '';

                    // Define channel order and labels
                    const channels = [
                      { key: 'stable', label: 'Stable', class: 'stable' },
                      { key: 'beta', label: 'Beta', class: 'beta' },
                      { key: 'ltc', label: 'LTC', class: 'ltc' },
                      { key: 'ltr', label: 'LTR', class: 'ltr' }
                    ];

                    channels.forEach(channel => {
                      const channelRecoveries = recoveries[channel.key] || [];
                      if (channelRecoveries.length > 0) {
                        dropdownHTML += `<div class="recovery-channel-section">`;
                        dropdownHTML += `<div class="recovery-channel-header ${channel.class}">${channel.label}</div>`;

                        channelRecoveries.forEach(recovery => {
                          const version = recovery.chromeVersion || recovery.version;
                          const displayName = `Chrome OS <strong>${version}</strong>`;
                          dropdownHTML += `<a href="${recovery.url}" class="recovery-link ${channel.class}">${displayName}</a>`;
                        });

                        dropdownHTML += `</div>`;
                      }
                    });

                    return dropdownHTML;
                  })()}
                </div>
              </div>
        </div>
      </Header>
      <div class="boardPageBody">
        <div class="board-devices-grid">
          ${deviceList}
        </div>
      </div>
    </Section>
    <script src="/public/js/app.js"></script>
  `;
}
