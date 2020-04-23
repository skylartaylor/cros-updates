import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Grid, Card, CardContent } from "@material-ui/core"
import { graphql } from "gatsby"

import DeviceVersions from '../components/DeviceVersions'


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

const useStyles = makeStyles(theme => ({
  grid: {
    padding: theme.spacing(3),
    height: "100%",
  },
  header: {
    textAlign: "center",
  },
  item: {
    minWidth: "60%",
  },
  card: {
    maxWidth: "300px",
  }
}))

export default function Index(props) {
  const classes = useStyles()
  
  var deviceList = props.data.allCrosUpdatesJson.nodes

  var urlDevice = props.location.search.replace('?board=', '')

  var selectedDevice = deviceList.filter(function (device) {
    return device.Codename === urlDevice
  })[0]

  function splitVersion(versionstring) {
    var values = versionstring.split("<br>")
    return {
      version: values[1],
      platform: values[0]
    }
  }

  var formattedDevice = {
    Codename: selectedDevice.Codename,
    Brand_names: selectedDevice.Brand_names,
    Stable: splitVersion(selectedDevice.Stable),
    Beta: splitVersion(selectedDevice.Beta),
    Dev: splitVersion(selectedDevice.Dev),
    Canary: splitVersion(selectedDevice.Canary),
  }

  return (
    <Grid
      container
      className={classes.grid}
      alignContent="center"
      justify="center"
      flexGrow={1}
    >
      <Grid item className={classes.item}>
        <h1>{selectedDevice.Brand_names}</h1>
        <p>{selectedDevice.Codename}</p>
        <DeviceVersions device={formattedDevice} />
      </Grid>
    </Grid>
  )
}
