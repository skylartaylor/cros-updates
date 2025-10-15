const fs = require("fs/promises");

const url = "https://chromiumdash.appspot.com/cros/fetch_serving_builds";

async function scrape() {
    try {
        // Fetch data using built-in fetch (Node 18+)
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

        // Ensure output directory exists
        await fs.mkdir('./src/data', { recursive: true });

        // Write both files in parallel using promises
        await Promise.all([
            fs.writeFile('./src/data/cros-updates.json', JSON.stringify(crosUpdatesData, null, 2)),
            fs.writeFile('./src/data/cros-updates.csv', csv)
        ]);

        console.log('✓ Successfully scraped and saved data');
    } catch (error) {
        console.error('✗ Scraping failed:', error.message);
        process.exit(1);
    }
}

scrape();
