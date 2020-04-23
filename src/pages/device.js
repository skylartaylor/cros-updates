import React from "react"
import { Router, Redirect } from "@reach/router"
import Device from "../components/DevicePage"
import Index from './index'

export const query = graphql`
  query DevicePage {
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

const DevicePage = (props) => {
    return (
        <Router basepath="/device">
            <Device path="/:boardName" deviceList={props.data.allCrosUpdatesJson.nodes} />
            <Index default />
        </Router>
    )
}

export default DevicePage