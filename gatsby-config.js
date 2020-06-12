module.exports = {
  siteMetadata: {
    title: `Chrome OS Version Tracking`,
    description: `View Current Chrome OS Version Numbers by Device and Channel`,
    author: `Skylar Taylor`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    "gatsby-plugin-layout",
    {
      resolve: 'gatsby-plugin-material-ui',
      options: {
        disableAutoprefixing: true,
        disableMinification: true,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Chrome OS Updates`,
        short_name: `Cros Updates`,
        start_url: `/`,
        background_color: `#303030`,
        theme_color: `#FF3C00`,
        display: `minimal-ui`,
        icon: `src/images/icon.png`, // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./src/data/cros-updates.json`,
      },
    },
    'gatsby-plugin-netlify',
    'gatsby-plugin-react-helmet',
  ],
}
