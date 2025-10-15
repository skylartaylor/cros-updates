# Chrome OS Updates

A modern, fast, and accessible website for tracking Chrome OS version updates, recovery images, and device information.

**Live Site:** https://cros.tech

## About

Chrome OS Updates provides up-to-date information about Chrome OS versions across all devices and boards, including:
- Current stable, beta, dev, and canary versions for every device
- Recovery image downloads for all channels and versions
- Device specifications including architecture, kernel versions, and capabilities
- Chrome OS Flex update information
- Historical version data

This site was orignally built to provide a more user-friendly and performant alternative to the now-defunct [cros-updates-serving](https://cros-updates-serving.appspot.com) appspot app.

## Data Sources

All Chrome OS version and device data is sourced directly from Google's official APIs and community-maintained repositories:
- **Version Data:** [Chromium Dashboard API](https://chromiumdash.appspot.com/cros/fetch_serving_builds)
- **Recovery Images:** [Google Chrome OS Recovery](https://dl.google.com/dl/edgedl/chromeos/recovery/)
- **Chrome OS Flex:** [Flex Recovery Data](https://dl.google.com/dl/edgedl/chromeos/recovery/cloudready_recovery2.json)
- **Device Metadata:** [ChromeOS Update Directory](https://github.com/jay0lee/chromeos-update-directory) - Enhanced device capabilities, kernel versions, architecture, and hardware information. (Thanks jay0lee!)

Data is automatically updated every 15 minutes via GitHub Actions (see `.github/workflows/scrape.yml`).

## Technology Stack

Built with modern web technologies for maximum performance and maintainability:

### Core Framework
- **[Eleventy (11ty) 3.0](https://www.11ty.dev/)** - Static site generator

### Build & Optimization
- **[LightningCSS](https://lightningcss.dev/)** - CSS processing and minification (100x faster than traditional tools)
- **[Terser](https://terser.org/)** - JavaScript minification
- **[html-minifier-terser](https://github.com/terser/html-minifier-terser)** - HTML minification
- **[@11ty/eleventy-plugin-bundle](https://github.com/11ty/eleventy-plugin-bundle)** - Asset bundling

## Development

### Prerequisites
- Node.js 20 or higher
- npm or pnpm

### Installation

```bash
git clone https://github.com/skylartaylor/cros-updates.git
cd cros-updates
npm install
```

### Commands

```bash
# Development server (with live reload)
npm start

# Production build
npm run build:prod

# Development build
npm run build

# Production server (test minified output)
npm run start:prod

# Clean output directory
npm run clean

# Debug mode (verbose logging)
npm run debug
```

## Data Updates

Chrome OS version data is automatically updated every 15 minutes via GitHub Actions:
1. Workflow runs scraper script (`scripts/scrape.js`)
2. Fetches latest data from Chromium Dashboard API
3. Commits updated data files if changes detected
4. Netlify automatically rebuilds and deploys

## Contributing

Issues and pull requests are welcome! Please feel free to:
- Report bugs or issues
- Suggest new features
- Improve documentation
- Optimize performance

## Contact

For questions, feedback, or issues, please:
- [Open an issue](https://github.com/skylartaylor/cros-updates/issues)
- Email: hi@skylar.cc

---

**Previous Version:** The legacy Gatsby-based version is preserved at [cros-updates-legacy](https://github.com/skylartaylor/cros-updates-legacy)
