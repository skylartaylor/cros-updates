// Process raw build data into devices and boards structure
export function processBoardsAndDevices(buildsData) {
  const devices = {};
  const boards = {};

  Object.entries(buildsData).forEach(([boardKey, boardData]) => {
    if (!boardData) {
      console.warn(`Skipping undefined value for board: ${boardKey}`);
      return;
    }

    // Initialize the board entry
    boards[boardKey] = {
      board: boardKey,
      devices: {},
      ...boardData,
    };

    // Process models (multiple devices per board)
    if (boardData.models) {
      Object.entries(boardData.models).forEach(([modelKey, modelData]) => {
        // Detect extended updates status
        const isExtendedUpdates =
          !modelData.isAue &&
          !('servingStable' in modelData) &&
          ('servingLtc' in modelData || 'servingLtr' in modelData);

        const deviceData = {
          mainBoard: boardKey,
          isExtendedUpdates,
          ...modelData,
        };

        devices[modelKey] = deviceData;
        boards[boardKey].devices[modelKey] = deviceData;
      });
    } else {
      // Single device board (board name = device name)
      // Detect extended updates status
      const isExtendedUpdates =
        !boardData.isAue &&
        !('servingStable' in boardData) &&
        ('servingLtc' in boardData || 'servingLtr' in boardData);

      const deviceData = {
        mainBoard: boardKey,
        isExtendedUpdates,
        ...boardData,
      };

      devices[boardKey] = deviceData;
      boards[boardKey].devices[boardKey] = deviceData;
    }
  });

  return { devices, boards };
}

// Separate boards into multi-device and single-device boards
export function categorizeBoards(boards) {
  const multiDeviceBoards = {};
  const singleDeviceBoards = {};

  Object.keys(boards)
    .sort()
    .forEach((key) => {
      const board = boards[key];
      const deviceCount = Object.keys(board.devices || {}).length;

      if (deviceCount > 1) {
        multiDeviceBoards[key] = board;
      } else {
        singleDeviceBoards[key] = board;
      }
    });

  return { multiDeviceBoards, singleDeviceBoards };
}
