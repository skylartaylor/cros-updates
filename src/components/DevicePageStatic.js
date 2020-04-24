import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Grid, Card, CardContent } from "@material-ui/core"
import { graphql } from "gatsby"

import DeviceVersions from './DeviceVersions'

const useStyles = makeStyles({
  grid: {
    height: "100%",
  },
})

export default function Device(props) {
  const classes = useStyles()

  var selectedDevice = props.pageContext

  function splitVersion(versionstring) {
    var values = versionstring.split("<br>")
    return {
      version: values[1],
      platform: values[0]
    }
  }

  var formattedDevice = {
    Codename: selectedDevice.Codename,
    Brand_names: selectedDevice["Brand names"],
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
    >
      <Grid item>
        <h1>{formattedDevice.Brand_names}</h1>
        <p>{formattedDevice.Codename}</p>
        <DeviceVersions device={formattedDevice} />
      </Grid>
    </Grid>
  )
}
