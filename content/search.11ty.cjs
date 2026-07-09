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
          <input id="search-input" type="text" placeholder="Search Devices..." aria-label="Search" />
          <div id="search-results" aria-live="polite"></div>
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