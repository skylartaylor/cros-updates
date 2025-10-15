import pluginBundle from "@11ty/eleventy-plugin-bundle";
import enhancedDevicesLoader from "./_data/enhanced-devices.js";
import { generateDataHash, loadCache, saveCache } from "./lib/cache.js";
import { fetchJSON } from "./lib/fetcher.js";
import { processBoardsAndDevices, categorizeBoards } from "./lib/board-device-processor.js";
import { processRecoveryData } from "./lib/recovery-processor.js";
import { minify as minifyHTML } from "html-minifier-terser";
import { minify as minifyJS } from "terser";

const isProduction = process.env.NODE_ENV === "production";

export default async function (eleventyConfig) {
  // Configure bundle plugin with LightningCSS and Terser transforms
  eleventyConfig.addPlugin(pluginBundle, {
    transforms: [
      async function(content) {
        // Use LightningCSS for CSS minification with nesting support
        if (this.type === 'css' && isProduction) {
          try {
            const { transform, browserslistToTargets } = await import('lightningcss');
            const browserslistModule = await import('browserslist');
            const browserslist = browserslistModule.default;

            const targets = browserslistToTargets(browserslist([
              '> 0.5%',
              'last 2 versions',
              'Firefox ESR',
              'not dead'
            ]));

            const result = transform({
              filename: 'bundle.css',
              code: Buffer.from(content),
              minify: true,
              targets,
              drafts: {
                nesting: true // Enable CSS nesting support
              }
            });

            return result.code.toString();
          } catch (error) {
            console.error('LightningCSS error:', error);
            return content;
          }
        }

        // Terser for JS minification
        if (this.type === 'js' && isProduction) {
          try {
            const result = await minifyJS(content, {
              compress: {
                drop_console: false,
                passes: 2
              },
              mangle: true,
              format: {
                comments: false
              }
            });
            return result.code || content;
          } catch (error) {
            console.error('JS minification error:', error);
            return content;
          }
        }

        return content;
      }
    ]
  });

  // HTML minification for production
  eleventyConfig.addTransform("htmlmin", async function(content) {
    if (isProduction && this.page.outputPath?.endsWith(".html")) {
      try {
        return await minifyHTML(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
          minifyCSS: false, // Handled by bundle plugin
          minifyJS: false, // Handled by bundle plugin
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        });
      } catch (error) {
        console.error('HTML minification error:', error);
        return content;
      }
    }
    return content;
  });

  // Copy static assets and watch for changes
  eleventyConfig.addPassthroughCopy("public/css");
  eleventyConfig.addPassthroughCopy("public/js");
  eleventyConfig.addWatchTarget("public/css");
  eleventyConfig.addWatchTarget("public/js");

  const EMPTY_DATA = { devices: {}, boards: {}, singleDeviceBoards: {} };

  // Fetch ChromeOS data
  eleventyConfig.addGlobalData("crosBuilds", async () => {
    const startTime = Date.now();
    console.log('🔄 Starting Chrome OS data fetch...');

    try {
      // Fetch serving builds data
      const servingBuilds = await fetchJSON(
        "https://chromiumdash.appspot.com/cros/fetch_serving_builds",
        "Serving builds fetch failed"
      );

      if (!servingBuilds || !servingBuilds.builds) {
        console.error("No builds found in the response");
        return EMPTY_DATA;
      }

      // Fetch recovery images data
      const recoveryData = await fetchJSON(
        "https://dl.google.com/dl/edgedl/chromeos/recovery/recovery2.json",
        "Recovery fetch failed"
      ) || [];

      if (recoveryData.length > 0) {
        console.log(`✅ Fetched ${recoveryData.length} recovery images`);
      }

      // Check cache validity
      const dataHash = generateDataHash(servingBuilds, recoveryData);
      const existingCache = loadCache();

      if (existingCache && existingCache.dataHash === dataHash) {
        const cacheAge = Date.now() - existingCache.timestamp;
        const cacheAgeMinutes = Math.floor(cacheAge / (1000 * 60));
        console.log(`🚀 Using cached device-recovery mappings (${cacheAgeMinutes}m old)`);
        console.log(`⚡ Build completed in ${Date.now() - startTime}ms (cache hit)`);
        return existingCache.data;
      }

      console.log('🔄 Cache miss or invalid, rebuilding device-recovery mappings...');

      // Process boards and devices
      let { devices, boards } = processBoardsAndDevices(servingBuilds.builds);

      // Add recovery data to devices
      devices = processRecoveryData(devices, recoveryData);

      // Categorize boards into multi-device and single-device
      const { multiDeviceBoards, singleDeviceBoards } = categorizeBoards(boards);

      console.log(`✅ Processed ${Object.keys(devices).length} devices with recovery data`);

      // Save to cache
      const finalData = {
        devices,
        boards: multiDeviceBoards,
        singleDeviceBoards
      };

      const cacheData = {
        dataHash,
        timestamp: Date.now(),
        data: finalData,
        stats: {
          deviceCount: Object.keys(devices).length,
          boardCount: Object.keys(multiDeviceBoards).length,
          singleDeviceBoardCount: Object.keys(singleDeviceBoards).length,
          recoveryCount: recoveryData.length
        }
      };

      saveCache(cacheData);

      const buildTime = Date.now() - startTime;
      console.log(`💾 Cache saved successfully`);
      console.log(`⚡ Build completed in ${buildTime}ms (full rebuild)`);

      return finalData;
    } catch (error) {
      console.error("Unexpected error in fetching builds:", error);
      return EMPTY_DATA;
    }
  });

  // Add enhanced device capabilities data
  eleventyConfig.addGlobalData("enhancedDevices", enhancedDevicesLoader);

  // Fetch Chrome OS Flex data
  eleventyConfig.addGlobalData("flexData", async () => {
    try {
      const [versionData, recoveryData] = await Promise.all([
        fetchJSON(
          "https://chromiumdash.appspot.com/cros/fetch_serving_builds?deviceCategory=ChromeOS%20Flex",
          "Flex version fetch failed"
        ),
        fetchJSON(
          "https://dl.google.com/dl/edgedl/chromeos/recovery/cloudready_recovery2.json",
          "Flex recovery fetch failed"
        )
      ]);

      return {
        versions: versionData || {},
        recoveries: recoveryData || [],
      };
    } catch (error) {
      console.error("Error fetching Flex data:", error);
      return {
        versions: {},
        recoveries: [],
      };
    }
  });

  // Configure dev server redirects for single-device boards
  eleventyConfig.setServerOptions({
    onRequest: {
      "/board/:boardName": async function({ patternGroups }) {
        const boardName = patternGroups.boardName;

        // Load the cache to get single-device boards
        const cache = loadCache();
        if (cache && cache.data && cache.data.singleDeviceBoards) {
          const singleDeviceBoard = cache.data.singleDeviceBoards[boardName];

          if (singleDeviceBoard) {
            const deviceKey = Object.keys(singleDeviceBoard.devices)[0];

            // Return a 302 redirect
            return {
              status: 302,
              headers: {
                "Location": `/device/${deviceKey}`,
                "Content-Type": "text/html"
              },
              body: `Redirecting to <a href="/device/${deviceKey}">/device/${deviceKey}</a>...`
            };
          }
        }

        // If not a single-device board, let it pass through
        return;
      }
    }
  });

  return {
    dir: {
      input: "content",
      data: "_data",
      includes: "../_includes",
      output: "_site",
    },
  };
}
