import React, { useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Grid, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Typography } from "@material-ui/core"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import DeviceVersions from './DeviceVersions'
import RecoveryPanel from './RecoveryPanel'

const useStyles = makeStyles({
  grid: {
    width: "100%",
    marginTop: "50px",
    alignContent: "flex-start",
  },
  deviceInfo: {
    fontSize: "1.2em",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    width: "90%",
    '& h1': {
      textAlign: "center",
      maxWidth: "80%",
      margin: 0,
      padding: 0,
    },
    '& p': {
      textAlign: "center",
      fontStyle: "italic",
      margin: "0 0 50px 0",
      padding: 0,
    },
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

  const [ deviceName, setDeviceName ] = useState("")

  useEffect(() => {
    if ( props.location.state !== undefined && props.location.state !== null && props.location.state.deviceName !== undefined) {
      if ( props.location.state.deviceName.includes("board: ") ) {
        setDeviceName(selectedDevice["Brand names"])
      } else {
        setDeviceName(props.location.state.deviceName)
      }
    } else {
      setDeviceName(selectedDevice["Brand names"])
    }

  }, [])
  
  var formattedDevice = {
    Codename: selectedDevice.Codename,
    Brand_names: deviceName,
    Stable: splitVersion(selectedDevice.Stable),
    Beta: splitVersion(selectedDevice.Beta),
    Dev: splitVersion(selectedDevice.Dev),
    Canary: splitVersion(selectedDevice.Canary),
    Recovery: selectedDevice.Recovery,
  }
  return (
    <Grid
      container
      className={classes.grid}
      justify="center"
    >
        <div className={classes.deviceInfo}>
            <h1 style={{ fontSize: ((deviceName.length > 50) ? "1.5em" : "2em")}} >{deviceName}</h1>
          <p>board: {formattedDevice.Codename}</p>
        </div>
        <DeviceVersions device={formattedDevice} />
        <RecoveryPanel device={formattedDevice} />
    </Grid>
  )
}
