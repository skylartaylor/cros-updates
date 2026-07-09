import test from "node:test";
import assert from "node:assert/strict";
import {
  matchRecoveryToDevice,
  compareChromeOsVersionsDesc,
  processRecoveryData,
} from "../lib/recovery-processor.js";

test("matchRecoveryToDevice: board 'gru' does not match a 'grunt' recovery image", () => {
  const recovery = {
    file: "chromeos_15437.42.0_grunt_recovery_stable-channel_mp-v2.bin",
    url: "https://example.com/chromeos_15437.42.0_grunt_recovery_stable-channel_mp-v2.bin.zip",
  };
  assert.ok(!matchRecoveryToDevice(recovery, { mainBoard: "gru" }));
});

test("matchRecoveryToDevice: board 'grunt' matches a 'grunt' recovery image", () => {
  const recovery = {
    file: "chromeos_15437.42.0_grunt_recovery_stable-channel_mp-v2.bin",
    url: "https://example.com/chromeos_15437.42.0_grunt_recovery_stable-channel_mp-v2.bin.zip",
  };
  assert.ok(matchRecoveryToDevice(recovery, { mainBoard: "grunt" }));
});

test("matchRecoveryToDevice: matches via url when file is absent", () => {
  const recovery = {
    url: "https://example.com/chromeos_15437.42.0_grunt_recovery_beta-channel_mp.bin.zip",
  };
  assert.ok(matchRecoveryToDevice(recovery, { mainBoard: "grunt" }));
});

test("matchRecoveryToDevice: no board yields no match", () => {
  const recovery = {
    file: "chromeos_15437.42.0_grunt_recovery_stable-channel_mp-v2.bin",
  };
  assert.ok(!matchRecoveryToDevice(recovery, {}));
});

test("compareChromeOsVersionsDesc: '15437.42.0' sorts before '15437.8.0'", () => {
  assert.ok(compareChromeOsVersionsDesc("15437.42.0", "15437.8.0") < 0);
  const sorted = ["15437.8.0", "15437.42.0"].sort(compareChromeOsVersionsDesc);
  assert.deepEqual(sorted, ["15437.42.0", "15437.8.0"]);
});

test("compareChromeOsVersionsDesc: major component dominates", () => {
  assert.ok(compareChromeOsVersionsDesc("16000.1.0", "15999.99.0") < 0);
});

test("compareChromeOsVersionsDesc: equal versions compare as 0", () => {
  assert.equal(compareChromeOsVersionsDesc("15437.42.0", "15437.42.0"), 0);
});

test("processRecoveryData: channels, stable-from-pushRecoveries, dedup and numeric sort", () => {
  const devices = {
    grunt: {
      mainBoard: "grunt",
      pushRecoveries: {
        "15100": "https://example.com/stable-15100.bin",
        "15437": "https://example.com/stable-15437.bin",
        "15300": "https://example.com/stable-15300.bin",
      },
    },
  };

  const betaUrl42 =
    "https://example.com/chromeos_15437.42.0_grunt_recovery_beta-channel_mp.bin.zip";
  const recoveryData = [
    {
      file: "chromeos_15437.8.0_grunt_recovery_beta-channel_mp.bin",
      url: "https://example.com/chromeos_15437.8.0_grunt_recovery_beta-channel_mp.bin.zip",
      channel: "BETA",
      version: "15437.8.0",
      chrome_version: "120.0.6099.8",
    },
    {
      file: "chromeos_15437.42.0_grunt_recovery_beta-channel_mp.bin",
      url: betaUrl42,
      channel: "Beta",
      version: "15437.42.0",
      chrome_version: "120.0.6099.42",
    },
    // Exact duplicate of the 15437.42.0 beta entry (same chrome_version + url).
    {
      file: "chromeos_15437.42.0_grunt_recovery_beta-channel_mp.bin",
      url: betaUrl42,
      channel: "beta",
      version: "15437.42.0",
      chrome_version: "120.0.6099.42",
    },
    {
      file: "chromeos_15400.10.0_grunt_recovery_ltc-channel_mp.bin",
      url: "https://example.com/chromeos_15400.10.0_grunt_recovery_ltc-channel_mp.bin.zip",
      channel: "LTC",
      version: "15400.10.0",
      chrome_version: "119.0.0.0",
    },
    {
      file: "chromeos_15300.5.0_grunt_recovery_ltr-channel_mp.bin",
      url: "https://example.com/chromeos_15300.5.0_grunt_recovery_ltr-channel_mp.bin.zip",
      channel: "ltr",
      version: "15300.5.0",
      chrome_version: "118.0.0.0",
    },
    // A stable-channel recovery image must be ignored (stable comes from pushRecoveries only).
    {
      file: "chromeos_15500.1.0_grunt_recovery_stable-channel_mp.bin",
      url: "https://example.com/chromeos_15500.1.0_grunt_recovery_stable-channel_mp.bin.zip",
      channel: "STABLE",
      version: "15500.1.0",
      chrome_version: "121.0.0.0",
    },
    // A "gru" look-alike image must not match the "grunt" board.
    {
      file: "chromeos_15999.0.0_gru_recovery_beta-channel_mp.bin",
      url: "https://example.com/chromeos_15999.0.0_gru_recovery_beta-channel_mp.bin.zip",
      channel: "beta",
      version: "15999.0.0",
      chrome_version: "199.0.0.0",
    },
  ];

  const result = processRecoveryData(devices, recoveryData);
  const rec = result.grunt.recoveries;

  // Stable list is the pushRecoveries, sorted by numeric key descending.
  assert.deepEqual(
    rec.stable.map((r) => r.version),
    ["15437", "15300", "15100"]
  );
  assert.ok(!rec.stable.some((r) => r.version === "15500.1.0"));

  // Beta: duplicate removed, .42 sorts before .8, "gru" look-alike excluded.
  assert.deepEqual(
    rec.beta.map((r) => r.version),
    ["15437.42.0", "15437.8.0"]
  );

  // Ltc / ltr populated from their own channels.
  assert.deepEqual(
    rec.ltc.map((r) => r.version),
    ["15400.10.0"]
  );
  assert.deepEqual(
    rec.ltr.map((r) => r.version),
    ["15300.5.0"]
  );
});
