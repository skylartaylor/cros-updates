export function data() {
  // Reference global data directly
  return {
    pagination: {
      data: "crosBuilds.devices",
      size: 1,
      alias: "device",
    },
    layout: "base.njk",
    permalink: (data) => `/device/${data.device}/`,
    eleventyComputed: {
      title: (data) => `${data.device} - Chrome OS Updates`,
    },
  };
}

export function render(data) {
  const deviceKey = data.device;
  const deviceData = data.crosBuilds.devices[data.device];
  
  // Get enhanced device data
  const boardName = deviceData.mainBoard || deviceKey;
  const enhancedData = data.enhancedDevices?.[boardName] || {};

  // Get the latest recovery from any channel, or show "No Recoveries"
  let latestRecoveryVersion, latestRecoveryURL, hasAnyRecoveries = false;
  
  if (deviceData.recoveries) {
    // Check all channels for any recoveries
    const allRecoveries = [
      ...(deviceData.recoveries.stable || []),
      ...(deviceData.recoveries.beta || []),
      ...(deviceData.recoveries.ltc || []),
      ...(deviceData.recoveries.ltr || [])
    ];
    
    if (allRecoveries.length > 0) {
      hasAnyRecoveries = true;
      // Prefer stable, but fallback to any channel
      const latestRecovery = deviceData.recoveries.stable?.[0] || allRecoveries[0];
      latestRecoveryVersion = latestRecovery.chromeVersion || latestRecovery.version;
      latestRecoveryURL = latestRecovery.url;
    }
  } 
  
  // Fallback to pushRecoveries if no new recoveries
  if (!hasAnyRecoveries && deviceData.pushRecoveries) {
    const pushRecoveryKeys = Object.keys(deviceData.pushRecoveries);
    if (pushRecoveryKeys.length > 0) {
      hasAnyRecoveries = true;
      latestRecoveryVersion = Math.max(
        ...pushRecoveryKeys.map(Number),
      );
      latestRecoveryURL = deviceData.pushRecoveries[latestRecoveryVersion];
    }
  }
  
  if (!hasAnyRecoveries) {
    latestRecoveryVersion = null;
    latestRecoveryURL = null;
  }

  // Function to format version strings with underscore suffixes
  function formatVersion(version) {
    if (!version) return version;
    const parts = version.split("_");
    if (parts.length > 1) {
      return `${parts[0]}<span class="version-suffix">_${parts.slice(1).join("_")}</span>`;
    }
    return version;
  }

  // Generate capability badges
  function generateCapabilityBadges(enhanced) {
    const badges = [];
    
    if (enhanced.is_chromebook_plus_device) {
      badges.push('<h2 class="mainBoard capability-chromebook-plus">Chromebook Plus</h2>');
    }
    if (enhanced.android_app_support) {
      const androidText = enhanced.android_version || 'Android Apps';
      badges.push(`<h2 class="mainBoard capability-android">${androidText}</h2>`);
    }
    if (enhanced.kernel_version) {
      badges.push(`<h2 class="mainBoard capability-kernel">Kernel ${enhanced.kernel_version}</h2>`);
    }
    if (enhanced.eol_reached) {
      badges.push('<h2 class="mainBoard capability-eol">End of Life</h2>');
    }
    
    return badges.join('');
  }

  // Calculate brand names length class and format with non-breaking spans
  let brandNamesText, brandNamesLength;
  if (Array.isArray(deviceData.brandNames)) {
    // Wrap each brand name in a span to prevent breaking within a name
    brandNamesText = deviceData.brandNames.map(name => `<span class="brand-name-item">${name}</span>`).join(', ');
    brandNamesLength = deviceData.brandNames.join(', ').length;
  } else {
    brandNamesText = deviceData.brandNames;
    brandNamesLength = brandNamesText ? brandNamesText.length : 0;
  }

  let brandNamesClass = '';
  if (brandNamesLength > 120) {
    brandNamesClass = 'brand-names-extra-long';
  } else if (brandNamesLength > 80) {
    brandNamesClass = 'brand-names-long';
  } else if (brandNamesLength > 50) {
    brandNamesClass = 'brand-names-medium';
  }

  return `
        <div data-device-key="${deviceKey}"></div>
        <Section class="devicePage ${deviceData.isAue ? "isAue" : ""} ${brandNamesClass}">
            <div class="aueWarning">
              <h1>This device has reached end of life, and will not receive further updates.  <a href="https://support.google.com/chrome/a/answer/6220366?sjid=16139853356254607673-NA">Learn more ⮕</a></h1>
            </div>
            <Header>
              <div class="deviceInfo">
                <h1>${deviceKey}</h1>
                <div class="deviceTags">
                    ${deviceData.mainBoard && deviceData.mainBoard !== deviceKey ? `<a href="/board/${deviceData.mainBoard}"><h2 class="mainBoard"><span>Board:</span> ${deviceData.mainBoard}</h2></a>` : ``}
                    <h2 class="mainBoard">${Object.values(deviceData.brandNameToFormattedDeviceMap)[0].architecture}</h2>
                    ${generateCapabilityBadges(enhancedData)}
                </div>
                <h2 class="brandNames">${brandNamesText}</h2>
              </div>
              <div class="recoveryDropdown">
              <div class="recoveryWrapper${hasAnyRecoveries ? '' : ' no-recoveries'}">
                <button class="pin-device-btn deviceHeaderBtn" data-device="${deviceKey}" aria-label="Pin device to homepage">
                  <svg class="pin-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.4746 4.3747L19.6474 7.55072C20.6549 8.55917 21.4713 9.37641 21.9969 10.0856C22.5382 10.8161 22.8881 11.5853 22.6982 12.4634C22.5083 13.3415 21.8718 13.8972 21.0771 14.3383C20.3055 14.7665 19.2245 15.1727 17.8906 15.6738L15.9136 16.4166C15.1192 16.7151 14.9028 16.8081 14.742 16.9474C14.6611 17.0174 14.5887 17.0967 14.5263 17.1837C14.4021 17.3568 14.329 17.5812 14.1037 18.4L14.0914 18.4449C13.8627 19.2762 13.6739 19.9623 13.4671 20.4774C13.2573 21.0003 12.974 21.4955 12.465 21.786C12.1114 21.9878 11.7112 22.0936 11.3041 22.093C10.7179 22.0921 10.227 21.8014 9.78647 21.4506C9.35243 21.1049 8.8497 20.6016 8.24065 19.9919L6.65338 18.403L2.5306 22.53C2.23786 22.823 1.76298 22.8233 1.46994 22.5305C1.1769 22.2378 1.17666 21.7629 1.4694 21.4699L5.59326 17.3418L4.05842 15.8054C3.45318 15.1996 2.9536 14.6995 2.61002 14.2678C2.26127 13.8297 1.97215 13.3421 1.96848 12.7599C1.96586 12.3451 2.07354 11.9371 2.28053 11.5777C2.57116 11.0731 3.06341 10.7919 3.58296 10.5834C4.09477 10.3779 4.77597 10.1901 5.60112 9.96265L5.6457 9.95036C6.46601 9.7242 6.69053 9.65088 6.86346 9.52638C6.9526 9.4622 7.0337 9.38748 7.10499 9.30383C7.24338 9.14144 7.33502 8.92324 7.62798 8.12367L8.34447 6.16811C8.83874 4.819 9.23907 3.72629 9.66362 2.9461C10.1005 2.14324 10.654 1.49811 11.5357 1.30359C12.4175 1.10904 13.1908 1.46156 13.9246 2.0063C14.6375 2.53559 15.4597 3.35863 16.4746 4.3747ZM13.0304 3.21067C12.4277 2.76322 12.1086 2.71327 11.8588 2.76836C11.609 2.82349 11.3402 3.0033 10.9812 3.66306C10.6161 4.33394 10.2525 5.32066 9.73087 6.7443L9.03642 8.63971C9.02304 8.67621 9.00987 8.71226 8.99686 8.74786C8.76267 9.3886 8.58179 9.88351 8.24665 10.2768C8.09712 10.4522 7.92696 10.609 7.73987 10.7437C7.3205 11.0456 6.81257 11.1852 6.15537 11.3659C6.11884 11.3759 6.08184 11.3861 6.04438 11.3964C5.16337 11.6393 4.56523 11.8054 4.1418 11.9754C3.71693 12.146 3.615 12.2662 3.58038 12.3263C3.50616 12.4552 3.46751 12.6015 3.46845 12.7504C3.46889 12.8201 3.49835 12.9752 3.78366 13.3337C4.06799 13.6909 4.50615 14.1312 5.15229 14.778L9.26897 18.8989C9.91923 19.5498 10.3618 19.9912 10.721 20.2772C11.0814 20.5643 11.2369 20.5929 11.3064 20.593C11.4519 20.5933 11.595 20.5554 11.7215 20.4832C11.7821 20.4486 11.9033 20.3466 12.0751 19.9187C12.2462 19.4923 12.4133 18.8896 12.6574 18.0021C12.6677 17.9648 12.6778 17.9279 12.6878 17.8914C12.8678 17.2352 13.0069 16.7283 13.3075 16.3093C13.4384 16.1268 13.5903 15.9604 13.76 15.8134C14.15 15.4758 14.642 15.2914 15.2786 15.0527C15.314 15.0395 15.3498 15.0261 15.386 15.0124L17.3032 14.2921C18.7112 13.7631 19.6865 13.3946 20.3491 13.0268C21.0001 12.6655 21.178 12.3967 21.2321 12.1463C21.2863 11.8958 21.2353 11.5773 20.7917 10.9787C20.3403 10.3695 19.6045 9.63013 18.541 8.5656L15.4588 5.48018C14.3876 4.40792 13.6433 3.66571 13.0304 3.21067Z" fill="currentColor"/>
                  </svg>
                  <span class="pin-text">Pin</span>
                </button>
${hasAnyRecoveries 
                  ? `<a class="recoveryBtn deviceHeaderBtn" href="${latestRecoveryURL}">&#x2B07; Recovery (${latestRecoveryVersion})</a>`
                  : `<span class="recoveryBtn deviceHeaderBtn disabled">No Recoveries</span>`
                }
                <button class="dropdownToggleBtn" aria-label="Show older recovery versions">▼</button>
              </div>
                <div class="dropdownContent">
                  ${(() => {
                    if (!hasAnyRecoveries) {
                      return `<div class="no-recoveries-message">No recovery images available for this device.</div>`;
                    }
                    
                    const recoveries = deviceData.recoveries;
                    if (!recoveries) {
                      // Fallback to original pushRecoveries format
                      return Object.entries(deviceData.pushRecoveries || {})
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
            </Header>
            <Body class="versionBody">
                <div class="versionCardContainer">
                    <div class="versionCard stable">
                        <h1>Stable</h1>
                        <h2>${formatVersion(deviceData.servingStable?.chromeVersion) || "Unavailable"}</h2>
                        <h3><span>Platform:</span>${deviceData.servingStable?.version || "Unavailable"}</h3>
                    </div>
                    <div class="versionCard beta">
                        <h1>Beta</h1>
                        <h2>${formatVersion(deviceData.servingBeta?.chromeVersion) || "Unavailable"}</h2>
                        <h3><span>Platform:</span>${deviceData.servingBeta?.version || "Unavailable"}</h3>
                    </div>
                    <div class="versionCard dev">
                        <h1>Dev</h1>
                        <h2>${formatVersion(deviceData.servingDev?.chromeVersion) || "Unavailable"}</h2>
                        <h3><span>Platform:</span>${deviceData.servingDev?.version || "Unavailable"}</h3>
                    </div>
                    <div class="versionCard canary">
                        <h1>Canary</h1>
                        <h2>${formatVersion(deviceData.servingCanary?.chromeVersion) || "Unavailable"}</h2>
                        <h3><span>Platform:</span>${deviceData.servingCanary?.version || "Unavailable"}</h3>
                    </div>
                </div>
            </Body>
        </Section>
<script src="/public/js/app.js"></script>
    `;
}
