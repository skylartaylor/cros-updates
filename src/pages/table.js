import React from "react"
import { graphql } from "gatsby"

import TableView from "../components/TableView"

export const query = graphql`
  query MyQuery {
    allCrosUpdatesJson(filter: { Brand_names: { ne: null } }) {
      nodes {
        Codename
        Brand_names
        Canary
        Dev
        Beta
        Stable
      }
    }
  }
`

class Index extends React.Component {
  render() {
    var data = this.props.data.allCrosUpdatesJson.nodes
    return (
      <>
        <TableView data={data} />
      </>
    )
  }
}

export default Index
