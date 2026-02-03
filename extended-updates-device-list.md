# Chrome OS Extended Updates Device List

**Date:** November 13, 2025
**Source:** Analysis of cros.tech data and Chromium Dashboard API
**Total:** 13 boards, 50 device models

## Detection Criteria

Boards identified as being on "Extended Updates" meet ALL of these criteria:
- `isAue = false` (not officially marked as End of Life)
- `Stable = "No Update"` (no stable channel releases)
- Has active Beta, Dev, and/or Canary channel updates
- Has LTC/LTR (Long-Term Support) channels but no Stable channel

## Boards and Device Models

### coral
- astronaut
- babymega
- babytiger
- blacktip
- blacktip360
- blacktiplte
- blue
- bruce
- epaulette
- lava
- nasher
- nasher360
- rabbid
- robo
- robo360
- santa
- whitetip

### elm
- elm

### eve
- eve

### fizz
- jax
- kench
- sion
- teemo
- wukong

### hana
- birch
- hana
- maple
- maple14
- sycamore
- sycamore360
- telesu

### kalista
- karma

### nami
- akali
- akali360
- bard
- ekko
- pantheon
- sona
- syndra
- vayne

### nautilus
- nautilus
- nautiluslte

### pyro
- pyro

### reef
- basking
- electro

### sand
- sand

### snappy
- alan
- bigdaddy
- snappy

### soraka
- soraka

## Validation

All listed boards confirmed via Chromium Dashboard API to have:
- ✓ No `servingStable` channel
- ✓ Active `servingLtc` and `servingLtr` channels (Chrome 138)
- ✓ Active `servingBeta`, `servingDev`, and `servingCanary` channels
- ✓ `isAue = false`
