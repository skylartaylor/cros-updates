import React from "react"
import { Link, graphql } from "gatsby"

import TableView from '../components/TableView'

export const query = graphql`
  query {
    allCrosUpdates3Json {
      nodes {
        name
        Brand_names
        Stable
        Beta
        Dev
        Canary
      }
    }
  }
`

class Index extends React.Component {
  render() {
    var data = this.props.data.allCrosUpdates3Json.nodes
    return (
      <>
        <TableView  data={data} />
      </>
    )
  }
}

export default Index
