import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Grid } from "@material-ui/core"

import DeviceVersions from './DeviceVersions'

const useStyles = makeStyles({
  grid: {
    height: "100%",
    width: "100%",
    marginTop: "50px",
  },
  deviceInfo: {
    fontSize: "1.2em",
    '& h1': {
      textAlign: "center",
      margin: 0,
      padding: 0,
    },
    '& p': {
      textAlign: "center",
      fontStyle: "italic",
      margin: "0 0 50px 0",
      padding: 0,
    }
  }
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
//      alignContent="center"
      justify="center"
    >
      <Grid item>
        <div className={classes.deviceInfo}>
          <h1>{formattedDevice.Brand_names}</h1>
          <p>board: {formattedDevice.Codename}</p>
        </div>
        <DeviceVersions device={formattedDevice} />
      </Grid>
    </Grid>
  )
}
