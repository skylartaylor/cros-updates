export function data() {
  return {
    layout: "base.njk",
    permalink: "/flex/",
    eleventyComputed: {
      title: () => "Chrome OS Flex - Chrome OS Updates",
    },
  };
}

export function render(data) {
  const flexData = data.flexData || {};
  const versionData = flexData.versions || {};
  const recoveryData = flexData.recoveries || [];
  
  // Get reven board data from Flex version data
  const revenData = versionData.builds?.reven || {};
  
  // Function to format version strings with underscore suffixes
  function formatVersion(version) {
    if (!version) return version;
    const parts = version.split("_");
    if (parts.length > 1) {
      return `${parts[0]}<span class="version-suffix">_${parts.slice(1).join("_")}</span>`;
    }
    return version;
  }

  // Get latest recovery for downloads
  function getLatestRecovery(recoveries) {
    if (!Array.isArray(recoveries) || recoveries.length === 0) return null;
    
    // Sort by version number (newest first)
    const sorted = recoveries.sort((a, b) => {
      const aVer = parseInt(a.version.split('.')[0]);
      const bVer = parseInt(b.version.split('.')[0]);
      return bVer - aVer;
    });
    
    return sorted[0];
  }

  const latestRecovery = getLatestRecovery(recoveryData);
  const latestRecoveryVersion = latestRecovery ? latestRecovery.chrome_version.split('.')[0] : "N/A";
  const latestRecoveryURL = latestRecovery ? latestRecovery.url : "#";

  return `
        <Section class="devicePage flexPage">
            <Header>
              <div class="deviceInfo">
                <h1>Chrome OS Flex</h1>
                <div class="deviceTags">
                    <h2 class="mainBoard"><span>Board:</span> reven</h2>
                </div>
              </div>
              <div class="recoveryDropdown">
              <div class="recoveryWrapper">
                <a class="recoveryBtn deviceHeaderBtn" href="${latestRecoveryURL}" target="_blank" rel="noopener">
                  &#x2B07; Recovery (${latestRecoveryVersion})
                </a>
                <button class="dropdownToggleBtn" aria-label="Show more recovery versions">▼</button>
              </div>
                <div class="dropdownContent">
                  ${(() => {
                    if (!recoveryData || recoveryData.length === 0) {
                      return `<div class="no-recoveries-message">No recovery images available.</div>`;
                    }
                    
                    // Group recoveries by channel
                    const channelGroups = {
                      stable: [],
                      beta: [],
                      ltc: [],
                      lts: []
                    };
                    
                    recoveryData.forEach(recovery => {
                      const channel = (recovery.channel || '').toLowerCase();
                      if (channelGroups[channel]) {
                        channelGroups[channel].push(recovery);
                      } else {
                        // Default to stable if no channel specified
                        channelGroups.stable.push(recovery);
                      }
                    });
                    
                    let dropdownHTML = '';
                    
                    // Define channel order and labels
                    const channels = [
                      { key: 'stable', label: 'Stable', class: 'stable' },
                      { key: 'beta', label: 'Beta', class: 'beta' },
                      { key: 'ltc', label: 'LTC', class: 'ltc' },
                      { key: 'lts', label: 'LTS', class: 'lts' }
                    ];
                    
                    channels.forEach(channel => {
                      const channelRecoveries = channelGroups[channel.key] || [];
                      if (channelRecoveries.length > 0) {
                        // Sort by version (newest first)
                        const sorted = channelRecoveries.sort((a, b) => {
                          const aVer = parseInt(a.chrome_version.split('.')[0]);
                          const bVer = parseInt(b.chrome_version.split('.')[0]);
                          return bVer - aVer;
                        });
                        
                        dropdownHTML += `<div class="recovery-channel-section">`;
                        dropdownHTML += `<div class="recovery-channel-header ${channel.class}">${channel.label}</div>`;
                        
                        sorted.forEach(recovery => {
                          const majorVersion = recovery.chrome_version.split('.')[0];
                          const displayName = `Chrome OS <strong>${majorVersion}</strong>`;
                          dropdownHTML += `<a href="${recovery.url}" class="recovery-link ${channel.class}" target="_blank" rel="noopener">${displayName}</a>`;
                        });
                        
                        dropdownHTML += `</div>`;
                      }
                    });
                    
                    return dropdownHTML;
                  })()}
                </div>
              </div>
            </Header>
            <Body class="versionBody">
                <div class="versionCardContainer">
                    <div class="versionCard stable">
                        <h1>Stable</h1>
                        <h2>${formatVersion(revenData.servingStable?.chromeVersion) || "Unavailable"}</h2>
                        <h3><span>Platform:</span>${revenData.servingStable?.version || "Unavailable"}</h3>
                    </div>
                    <div class="versionCard beta">
                        <h1>Beta</h1>
                        <h2>${formatVersion(revenData.servingBeta?.chromeVersion) || "Unavailable"}</h2>
                        <h3><span>Platform:</span>${revenData.servingBeta?.version || "Unavailable"}</h3>
                    </div>
                    <div class="versionCard dev">
                        <h1>Dev</h1>
                        <h2>${formatVersion(revenData.servingDev?.chromeVersion) || "Unavailable"}</h2>
                        <h3><span>Platform:</span>${revenData.servingDev?.version || "Unavailable"}</h3>
                    </div>
                    <div class="versionCard canary">
                        <h1>Canary</h1>
                        <h2>${formatVersion(revenData.servingCanary?.chromeVersion) || "Unavailable"}</h2>
                        <h3><span>Platform:</span>${revenData.servingCanary?.version || "Unavailable"}</h3>
                    </div>
                </div>
            </Body>
        </Section>
<script src="/public/js/app.js"></script>
    `;
}