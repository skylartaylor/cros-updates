const fs = require("fs/promises");
const path = require("path");

const TEMP_DIR = path.join(__dirname, ".test-output");

async function runLegacyScraper() {
    const fetch = require("node-fetch");
    const { Parser } = require("json2csv");

    const url = "https://chromiumdash.appspot.com/cros/fetch_serving_builds";
    const settings = { method: "Get" };

    const res = await fetch(url, settings);
    const json = await res.json();

    let data = json.builds;
    let crosUpdatesData = [];

    function formatVersionString(version) {
        if (version === undefined) {
            return "No Update";
        } else {
            return version.version + "<br>" + version.chromeVersion;
        }
    }

    function formatBoardObject(board, name) {
        let boardObject = {
            "Codename": name,
            "Stable": formatVersionString(board.servingStable),
            "Beta": formatVersionString(board.servingBeta),
            "Dev": formatVersionString(board.servingDev),
            "Canary": formatVersionString(board.servingCanary),
            "Recovery": board.pushRecoveries,
            "Brand names": board.brandNames.sort().join(', '),
            "isAue": board.isAue,
        };
        return boardObject;
    }

    Object.keys(data).forEach(boardName => {
        let board = data[boardName];

        //checking for codename with sub-boards (no channel info on main device obj)
        if (board.servingStable === undefined) {
            // grab version data from first sub-board and mainboard, push to array
            let mainBoardVersions = Object.values(board.models)[0];
            mainBoardVersions.pushRecoveries = board.pushRecoveries;
            mainBoardVersions.subboard = false;
            crosUpdatesData.push(formatBoardObject(mainBoardVersions, boardName));

            //iterate over sub-boards and push to array
            Object.keys(board.models).forEach(modelName => {
                model = board.models[modelName];
                model.pushRecoveries = board.pushRecoveries;
                model.subboard = true;
                //don't push if sub-board and mainboard name are the same
                if (modelName !== boardName) {
                    crosUpdatesData.push(formatBoardObject(model, modelName));
                }
            });
        } else {
            //(hopefully) temporary fix for issue with bob board
            if (boardName === "bob") {
                board.servingBeta = board.models.bob.servingBeta;
                board.servingDev = board.models.bob.servingDev;
                board.servingCanary = board.models.bob.servingCanary;
            }
            //for boards with no sub-boards, just push data to array
            board.subboard = false;
            crosUpdatesData.push(formatBoardObject(board, boardName));
        }
    });

    //convert data to CSV format for Discord Bot
    const legacycsv = [];

    crosUpdatesData.map(item => {
        let csvDevice = {
            "Codename": item.Codename,
            "Pinned 93": "NA",
            "Pinned 94": "NA",
            "Pinned 96": "NA",
            "Pinned 97": "NA",
            "Pinned 98": "NA",
            "Stable": item.Stable.replace('<br>', "\\n"),
            "Beta": item.Beta.replace('<br>', "\\n"),
            "Dev": item.Dev.replace('<br>', "\\n"),
            "Canary": item.Canary.replace('<br>', "\\n"),
            "Recovery": "NA",
            "Brand names": item['Brand names']
        };
        legacycsv.push(csvDevice);
    });

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(legacycsv);

    return { json: crosUpdatesData, csv };
}

async function runNewScraper() {
    const url = "https://chromiumdash.appspot.com/cros/fetch_serving_builds";

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    const data = json.builds;
    const crosUpdatesData = [];

    function formatVersionString(version) {
        return version === undefined
            ? "No Update"
            : `${version.version}<br>${version.chromeVersion}`;
    }

    function formatBoardObject(board, name) {
        return {
            "Codename": name,
            "Stable": formatVersionString(board.servingStable),
            "Beta": formatVersionString(board.servingBeta),
            "Dev": formatVersionString(board.servingDev),
            "Canary": formatVersionString(board.servingCanary),
            "Recovery": board.pushRecoveries,
            "Brand names": board.brandNames.sort().join(', '),
            "isAue": board.isAue,
        };
    }

    Object.entries(data).forEach(([boardName, board]) => {
        if (!board) {
            console.warn(`Skipping undefined value for board: ${boardName}`);
            return;
        }

        // Process boards with models (multiple devices per board)
        if (board.models) {
            // Get first model for board-level entry
            const firstModel = Object.values(board.models)[0];
            const boardLevelData = {
                ...firstModel,
                pushRecoveries: board.pushRecoveries,
                subboard: false,
            };
            crosUpdatesData.push(formatBoardObject(boardLevelData, boardName));

            // Add all individual models
            Object.entries(board.models).forEach(([modelName, modelData]) => {
                const deviceData = {
                    ...modelData,
                    pushRecoveries: board.pushRecoveries,
                    subboard: true,
                };
                // Don't duplicate if model name matches board name
                if (modelName !== boardName) {
                    crosUpdatesData.push(formatBoardObject(deviceData, modelName));
                }
            });
        } else {
            // Single device board (board name = device name)
            const deviceData = {
                ...board,
                subboard: false,
            };
            crosUpdatesData.push(formatBoardObject(deviceData, boardName));
        }
    });

    // Convert data to CSV format for Discord Bot using vanilla JS
    const legacycsv = crosUpdatesData.map(item => ({
        "Codename": item.Codename,
        "Pinned 93": "NA",
        "Pinned 94": "NA",
        "Pinned 96": "NA",
        "Pinned 97": "NA",
        "Pinned 98": "NA",
        "Stable": item.Stable.replace('<br>', "\\n"),
        "Beta": item.Beta.replace('<br>', "\\n"),
        "Dev": item.Dev.replace('<br>', "\\n"),
        "Canary": item.Canary.replace('<br>', "\\n"),
        "Recovery": "NA",
        "Brand names": item['Brand names']
    }));

    // Simple CSV conversion without external library (matches json2csv format)
    const headers = Object.keys(legacycsv[0]);
    const csvRows = [
        headers.map(h => `"${h}"`).join(','),
        ...legacycsv.map(row =>
            headers.map(header => {
                const value = row[header]?.toString() || '';
                // Escape quotes and wrap in quotes (matching json2csv behavior)
                return `"${value.replace(/"/g, '""')}"`;
            }).join(',')
        )
    ];
    const csv = csvRows.join('\n');

    return { json: crosUpdatesData, csv };
}

// Deep compare two objects
function deepCompare(obj1, obj2, path = "") {
    const differences = [];

    if (typeof obj1 !== typeof obj2) {
        differences.push({
            path,
            type: "type_mismatch",
            legacy: typeof obj1,
            new: typeof obj2,
        });
        return differences;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            differences.push({
                path,
                type: "array_length",
                legacy: obj1.length,
                new: obj2.length,
            });
        }

        const minLength = Math.min(obj1.length, obj2.length);
        for (let i = 0; i < minLength; i++) {
            differences.push(...deepCompare(obj1[i], obj2[i], `${path}[${i}]`));
        }
    } else if (typeof obj1 === "object" && obj1 !== null && obj2 !== null) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        const allKeys = new Set([...keys1, ...keys2]);

        for (const key of allKeys) {
            if (!(key in obj1)) {
                differences.push({
                    path: `${path}.${key}`,
                    type: "missing_in_legacy",
                    new: obj2[key],
                });
            } else if (!(key in obj2)) {
                differences.push({
                    path: `${path}.${key}`,
                    type: "missing_in_new",
                    legacy: obj1[key],
                });
            } else {
                differences.push(...deepCompare(obj1[key], obj2[key], `${path}.${key}`));
            }
        }
    } else if (obj1 !== obj2) {
        differences.push({
            path,
            type: "value_mismatch",
            legacy: obj1,
            new: obj2,
        });
    }

    return differences;
}

async function main() {
    console.log("🧪 Starting scraper comparison test...\n");

    try {
        // Create temp directory
        await fs.mkdir(TEMP_DIR, { recursive: true });

        // Run legacy scraper
        console.log("📦 Running legacy scraper...");
        const legacyOutput = await runLegacyScraper();
        console.log("✓ Legacy scraper completed\n");

        // Run new scraper
        console.log("📦 Running new scraper...");
        const newOutput = await runNewScraper();
        console.log("✓ New scraper completed\n");

        // Save outputs for inspection
        await Promise.all([
            fs.writeFile(path.join(TEMP_DIR, "legacy.json"), JSON.stringify(legacyOutput.json, null, 2)),
            fs.writeFile(path.join(TEMP_DIR, "new.json"), JSON.stringify(newOutput.json, null, 2)),
            fs.writeFile(path.join(TEMP_DIR, "legacy.csv"), legacyOutput.csv),
            fs.writeFile(path.join(TEMP_DIR, "new.csv"), newOutput.csv),
        ]);

        // Compare outputs
        console.log("📊 Comparing outputs...\n");

        const legacyJson = legacyOutput.json;
        const newJson = newOutput.json;
        const legacyCsv = legacyOutput.csv;
        const newCsv = newOutput.csv;

        // Compare JSON
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("JSON COMPARISON");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        const jsonDiffs = deepCompare(legacyJson, newJson, "root");

        if (jsonDiffs.length === 0) {
            console.log("✅ JSON outputs are IDENTICAL\n");
        } else {
            console.log(`⚠️  Found ${jsonDiffs.length} differences in JSON:\n`);
            jsonDiffs.slice(0, 20).forEach((diff, i) => {
                console.log(`${i + 1}. ${diff.path}`);
                console.log(`   Type: ${diff.type}`);
                if (diff.legacy !== undefined) console.log(`   Legacy: ${JSON.stringify(diff.legacy)}`);
                if (diff.new !== undefined) console.log(`   New: ${JSON.stringify(diff.new)}`);
                console.log();
            });
            if (jsonDiffs.length > 20) {
                console.log(`... and ${jsonDiffs.length - 20} more differences\n`);
            }
        }

        // Compare CSV
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("CSV COMPARISON");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        if (legacyCsv === newCsv) {
            console.log("✅ CSV outputs are IDENTICAL\n");
        } else {
            const legacyLines = legacyCsv.split("\n");
            const newLines = newCsv.split("\n");

            console.log(`⚠️  CSV outputs differ`);
            console.log(`   Legacy lines: ${legacyLines.length}`);
            console.log(`   New lines: ${newLines.length}\n`);

            // Show first few line differences
            const maxLines = Math.max(legacyLines.length, newLines.length);
            let diffCount = 0;
            for (let i = 0; i < Math.min(maxLines, 10); i++) {
                if (legacyLines[i] !== newLines[i]) {
                    console.log(`Line ${i + 1} differs:`);
                    console.log(`  Legacy: ${legacyLines[i]?.substring(0, 100)}`);
                    console.log(`  New:    ${newLines[i]?.substring(0, 100)}`);
                    console.log();
                    diffCount++;
                }
            }

            // Count total differences
            for (let i = 10; i < maxLines; i++) {
                if (legacyLines[i] !== newLines[i]) diffCount++;
            }

            if (diffCount > 10) {
                console.log(`... and ${diffCount - 10} more line differences\n`);
            }
        }

        // Summary
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("SUMMARY");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        console.log(`Legacy JSON entries: ${legacyJson.length}`);
        console.log(`New JSON entries: ${newJson.length}`);
        console.log(`JSON differences: ${jsonDiffs.length}`);
        console.log(`CSV match: ${legacyCsv === newCsv ? "YES" : "NO"}`);

        console.log(`\n📁 Outputs saved to: ${TEMP_DIR}`);

        if (jsonDiffs.length === 0 && legacyCsv === newCsv) {
            console.log("\n🎉 All tests passed! Outputs are identical.");
            process.exit(0);
        } else {
            console.log("\n⚠️  Differences found. Review the output above.");
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
