const path = require('path');
const fs = require('fs');

// Read the search.js file content at build time
const searchJsPath = path.join(__dirname, '../_includes/search.js');
const searchJs = fs.readFileSync(searchJsPath, 'utf8');

module.exports = {
  data: {
    layout: "base.njk",
    permalink: "/search/index.html",
  },

  render(data) {
    return `
      <section class="search-page">
        <h1>Search</h1>
        <div class="search-container">
          <search-box
            placeholder="Search Devices..."
            auto-show-results="true"
            auto-focus="true">
          </search-box>
        </div>
        <script>
          ${searchJs}
        </script>
      </section>
    `;
  },
};