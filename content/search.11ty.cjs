module.exports = {
  data: {
    layout: "base.njk",
    title: "Search - Chrome OS Updates",
    permalink: "/search/index.html",
  },

  render(data) {
    return `
      <section class="homePage">
        <div class="homePageContent">
          <h2>Search</h2>
          <div class="search-container">
            <input id="search-input" type="text" autocomplete="off" placeholder="Search by Device, Board, Codename, or Brand..." aria-label="Search" />
            <div id="search-results" aria-live="polite"></div>
          </div>
        </div>
        <script>
          document.addEventListener("DOMContentLoaded", () => {
            const searchInput = document.getElementById("search-input");
            const resultsContainer = document.getElementById("search-results");
            
            const search = new DeviceSearch();
            search.initialize(searchInput, resultsContainer);
          });
        </script>
      </section>
    `;
  },
};