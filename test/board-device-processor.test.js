import test from "node:test";
import assert from "node:assert/strict";
import {
  processBoardsAndDevices,
  categorizeBoards,
} from "../lib/board-device-processor.js";

test("processBoardsAndDevices: multi-model board flattens into devices keyed by model", () => {
  const buildsData = {
    grunt: {
      brandNames: ["Acer"],
      models: {
        barla: { pushRecoveries: {} },
        careena: { pushRecoveries: {} },
      },
    },
  };

  const { devices, boards } = processBoardsAndDevices(buildsData);

  assert.deepEqual(Object.keys(devices).sort(), ["barla", "careena"]);
  assert.equal(devices.barla.mainBoard, "grunt");
  assert.equal(devices.careena.mainBoard, "grunt");
  assert.deepEqual(Object.keys(boards.grunt.devices).sort(), ["barla", "careena"]);
  assert.equal(boards.grunt.board, "grunt");
});

test("processBoardsAndDevices: single-device board keys the device by board name", () => {
  const buildsData = {
    eve: { brandNames: ["Google"], pushRecoveries: {} },
  };

  const { devices, boards } = processBoardsAndDevices(buildsData);

  assert.deepEqual(Object.keys(devices), ["eve"]);
  assert.equal(devices.eve.mainBoard, "eve");
  assert.deepEqual(Object.keys(boards.eve.devices), ["eve"]);
});

test("processBoardsAndDevices: null board value is skipped", () => {
  const buildsData = {
    eve: { pushRecoveries: {} },
    broken: null,
  };

  const { devices, boards } = processBoardsAndDevices(buildsData);

  assert.ok(!("broken" in devices));
  assert.ok(!("broken" in boards));
  assert.deepEqual(Object.keys(devices), ["eve"]);
});

test("processBoardsAndDevices: model key collision keeps last write and warns", () => {
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (msg) => warnings.push(msg);
  try {
    const buildsData = {
      boardA: { models: { shared: { pushRecoveries: {} } } },
      boardB: { models: { shared: { pushRecoveries: {} } } },
    };
    const { devices } = processBoardsAndDevices(buildsData);
    assert.equal(devices.shared.mainBoard, "boardB");
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /collision/i);
  } finally {
    console.warn = originalWarn;
  }
});

test("categorizeBoards: splits by device count with sorted keys", () => {
  const boards = {
    zeta: { devices: { zeta: {} } },
    grunt: { devices: { barla: {}, careena: {} } },
    eve: { devices: { eve: {} } },
  };

  const { multiDeviceBoards, singleDeviceBoards } = categorizeBoards(boards);

  assert.deepEqual(Object.keys(multiDeviceBoards), ["grunt"]);
  assert.deepEqual(Object.keys(singleDeviceBoards), ["eve", "zeta"]);
});
