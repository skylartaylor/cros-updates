module.exports = class Versions {
  data() {
    return {
      layout: "base",
      title: "Versions - Chrome OS Updates",
      permalink: "/versions/",
    };
  }

  render(data) {
    if (
      !data?.crosBuilds ||
      (!data.crosBuilds.boards && !data.crosBuilds.devices)
    ) {
      return "<h1>Chrome OS Versions</h1><p>No data available</p>";
    }

    const channels = [
      { id: "stable", name: "Stable", field: "servingStable" },
      { id: "beta", name: "Beta", field: "servingBeta" },
      { id: "dev", name: "Dev", field: "servingDev" },
      { id: "canary", name: "Canary", field: "servingCanary" },
    ];

    const allDevices = {};

    Object.entries(data.crosBuilds.devices || {}).forEach(
      ([deviceKey, deviceData]) => {
        allDevices[deviceKey] = {
          codename: deviceKey,
          name: deviceData.name || deviceKey,
          mainBoard: deviceData.mainBoard || null,
          ...deviceData,
        };
      },
    );

    Object.entries(data.crosBuilds.boards || {}).forEach(
      ([boardKey, boardData]) => {
        Object.entries(boardData.devices || {}).forEach(
          ([deviceKey, deviceData]) => {
            if (!allDevices[deviceKey]) {
              allDevices[deviceKey] = {
                codename: deviceKey,
                name: deviceData.name || deviceKey,
                mainBoard: boardKey,
                ...deviceData,
              };
            }
          },
        );
      },
    );

    const groupByMajorVersion = (channelField) =>
      Object.values(allDevices).reduce((groups, device) => {
        const version = device[channelField]?.chromeVersion;
        if (version) {
          const majorVersion = version.split(".")[0];
          groups[majorVersion] = groups[majorVersion] || {};
          groups[majorVersion][version] = groups[majorVersion][version] || [];
          groups[majorVersion][version].push({
            codename: device.codename,
            name: device.name,
            mainBoard: device.mainBoard,
            version: version,
          });
        }
        return groups;
      }, {});

    const generateSidebar = () =>
      `
            <details open>
                <summary>Version Tracker <span>Menu</span></summary>
                <div class="channel-buttons">
                    ${channels
                      .map(
                        (channel) => `
                            <button type="button" class="channel-btn" data-channel="${channel.id}">
                                ${channel.name}
                            </button>
                        `,
                      )
                      .join("")}
                </div>
                ${channels
                  .map((channel) => {
                    const versions = groupByMajorVersion(channel.field);
                    const sortedMajorVersions = Object.keys(versions).sort(
                      (a, b) => b - a,
                    );

                    return `
                        <div class="channel-section hidden" id="pane-${channel.id}">
                            <ul>
                                ${sortedMajorVersions
                                  .map(
                                    (majorVersion) => `
                                        <li>
                                            <a href="#" data-channel="${channel.id}" data-version="${majorVersion}">
                                                ${majorVersion}
                                            </a>
                                        </li>
                                    `,
                                  )
                                  .join("")}
                            </ul>
                        </div>
                    `;
                  })
                  .join("")}
            </details>
            `;

    const generateDeviceLists = () =>
      channels
        .map((channel) => {
          const versions = groupByMajorVersion(channel.field);
          const sortedMajorVersions = Object.keys(versions).sort(
            (a, b) => b - a,
          );

          return sortedMajorVersions
            .map(
              (majorVersion) => `
                            <div class="version-pane hidden ${channel.id}" id="devices-${channel.id}-${majorVersion}">
                                <h2 class="${channel.id}">Chrome OS ${majorVersion} <span>${channel.name}</span></h2>
                                ${Object.keys(versions[majorVersion])
                                  .sort((a, b) =>
                                    b.localeCompare(a, undefined, {
                                      numeric: true,
                                      sensitivity: "base",
                                    }),
                                  )
                                  .map(
                                    (fullVersion) => `
                                        <div class="sub-version">
                                            <h3>${fullVersion}</h3>
                                            <ul>
                                                ${versions[majorVersion][
                                                  fullVersion
                                                ]
                                                  .sort((a, b) =>
                                                    a.name.localeCompare(
                                                      b.name,
                                                    ),
                                                  )
                                                  .map(
                                                    (device) => `
                                                        <li>
                                                            <a href="/device/${device.codename}">
                                                                ${device.name}${device.mainBoard && device.mainBoard !== device.name ? ` <span class="boardName">${device.mainBoard}</span>` : ""}
                                                            </a>
                                                        </li>
                                                    `,
                                                  )
                                                  .join("")}
                                            </ul>
                                        </div>
                                    `,
                                  )
                                  .join("")}
                            </div>
                        `,
            )
            .join("");
        })
        .join("");

    return `
            <div class="versions-container">
                <aside class="sidebar">
                    <div id="version-list">
                        ${generateSidebar()}
                    </div>
                </aside>
                <main class="version-content">
                    <div id="device-list">
                        ${generateDeviceLists()}
                    </div>
                </main>
            </div>

            <script>
                document.addEventListener("DOMContentLoaded", () => {
                    function showVersion(channel, version) {
                        document.querySelectorAll(".version-pane").forEach((pane) => {
                            pane.classList.add("hidden");
                        });

                        document.getElementById("devices-" + channel + "-" + version).classList.remove("hidden");

                        document.querySelectorAll(".sidebar ul li a").forEach((link) => {
                            link.classList.remove("active");
                        });

                        document.querySelector(\`[data-channel='\${channel}'][data-version='\${version}']\`).classList.add("active");
                    }

                    function selectLatestVersion(channel) {
                        const versionLinks = document.querySelectorAll(\`.sidebar ul li a[data-channel="\${channel}"]\`);
                        if (versionLinks.length > 0) {
                            const latestVersion = Array.from(versionLinks)
                                .map(link => link.dataset.version)
                                .sort((a, b) => b - a)[0];

                            showVersion(channel, latestVersion);
                        }
                    }

                    document.querySelectorAll(".channel-btn").forEach((button) => {
                        button.addEventListener("click", (e) => {
                            const selectedChannel = e.target.dataset.channel;

                            document.querySelectorAll(".channel-section").forEach((section) => {
                                section.classList.add("hidden");
                            });

                            document.getElementById("pane-" + selectedChannel).classList.remove("hidden");

                            document.querySelectorAll(".channel-btn").forEach(btn => btn.classList.remove("active"));
                            e.target.classList.add("active");

                            selectLatestVersion(selectedChannel);
                        });
                    });

                    document.getElementById("version-list").addEventListener("click", (e) => {
                        if (e.target.tagName === "A") {
                            e.preventDefault();
                            const channel = e.target.dataset.channel;
                            const version = e.target.dataset.version;
                            showVersion(channel, version);
                        }
                    });

                    document.querySelector(\`.channel-btn[data-channel="stable"]\`).classList.add("active");
                    document.getElementById("pane-stable").classList.remove("hidden");
                    selectLatestVersion("stable");
                });
            </script>
        `;
  }
};
