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
              <recovery-dropdown
                data-recoveries='${JSON.stringify(recoveryData || [])}'
                data-latest-version="${latestRecoveryVersion}"
                data-latest-url="${latestRecoveryURL}"
                data-format="flex">
              </recovery-dropdown>
            </Header>
            <Body class="versionBody">
                <div class="versionCardContainer">
                    <version-card
                        channel="stable"
                        chrome-version="${revenData.servingStable?.chromeVersion || 'Unavailable'}"
                        platform-version="${revenData.servingStable?.version || 'Unavailable'}">
                    </version-card>
                    <version-card
                        channel="beta"
                        chrome-version="${revenData.servingBeta?.chromeVersion || 'Unavailable'}"
                        platform-version="${revenData.servingBeta?.version || 'Unavailable'}">
                    </version-card>
                    <version-card
                        channel="dev"
                        chrome-version="${revenData.servingDev?.chromeVersion || 'Unavailable'}"
                        platform-version="${revenData.servingDev?.version || 'Unavailable'}">
                    </version-card>
                    <version-card
                        channel="canary"
                        chrome-version="${revenData.servingCanary?.chromeVersion || 'Unavailable'}"
                        platform-version="${revenData.servingCanary?.version || 'Unavailable'}">
                    </version-card>
                </div>
            </Body>
        </Section>
<script src="/public/js/app.js"></script>
    `;
}