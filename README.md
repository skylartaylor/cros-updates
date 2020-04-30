# Chrome OS Updates [![Netlify Status](https://api.netlify.com/api/v1/badges/f7f707c6-715d-41d6-9fa8-343f1093f70c/deploy-status)](https://app.netlify.com/sites/cros-updates/deploys)
This respository hosts https://cros.tech, a website I'm building to replace the well-known [cros-updates-serving](https://cros-updates-serving.appspot.com) appspot app. This repository consists of two parts:

### Web Scraping Script

Located in `/scripts` is a node script that Github Actions runs every 15 minutes to scrape [cros-updates-serving](https://cros-updates-serving.appspot.com) for its data. If you know a better place to source board-specific Chrome OS version data, please open an issue.

### Static Web App

The rest of the repository is a [Gatsby](https://gatsbyjs.org)-based web application to display version data in a more user-friendly way. Pages are rendered statically by [Netlify](https://netlify.com) upon push to `master`. There are plans to move the website build process to Github Actions in order to save money on Netlify build minutes.

_____

### Reporting Issues

If you run into an issue with the website, please [open an issue](https://github.com/skylartaylor/cros-updates/issues/new) on the repository and provide as much information as you can about the problem. If you could provide at least your device type and OS / Browser version, that'd be great.

_____

#### Other Considerations

Since version data is stored as JSON in Git, this repository can be used as an archive of the last ~7 months of Chrome OS Version data. I've yet to figure out how to use that productively, but I'm sure there's things you could do. If you have ideas or want to contribute something, feel free!

Also, I'm not an excellent developer by any means. This has been cobbled together over quite some time with lots of tutorials and trial and error. If you notice an error or best practice not being followed and have the time, I'd love if you could [open an issue](https://github.com/skylartaylor/cros-updates/issues/new) with your feedback. Thank you in advance!

