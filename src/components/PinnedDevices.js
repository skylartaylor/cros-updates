import React, { Component } from "react"
import { StaticQuery, graphql, navigate } from "gatsby"
import { makeStyles } from "@material-ui/core/styles"
import { Grid, Card } from "@material-ui/core"

const useStyles = makeStyles(theme => ({
    grid: {
        justifyContent: "center",
        paddingBottom: "20px",
    },
    card: {
        padding: "5px 25px",
        margin: "0px 10px",
        background: "#333",
    },
  }))

function PinnedDevices(props) {

    const classes = useStyles()
    var selectedDevice = props.data.allCrosUpdatesJson.nodes[16]

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

    var devices = [
        {
          board: "eve",
          displayName: "Google Pixelbook",
          position: "1",
        },
        {
          board: "soraka",
          displayName: "HP Chromebook x2",
          position: "3",
        },
        {
          board: "hatch",
          displayName: "Samsung Galaxy Chromebook",
          position: "2",
        },
      ]

    return (
        <Grid container className={classes.grid}>
            <Card className={classes.card} variant="outlined">
                <h3>{formattedDevice.Brand_names}</h3>
                <p>Stable: {formattedDevice.Stable.version}</p>
                <p>Beta: {formattedDevice.Beta.version}</p>
                <p>Dev: {formattedDevice.Dev.version}</p>
                <p>Canary: {formattedDevice.Canary.version}</p>
            </Card>
            {devices.map(device => {
                  return (
                    <Card
                      key={device.board}
                      variant="outlined"
                      className={classes.card}
                    >
                      {device.displayName}
                    </Card>
                  )
                })}
        </Grid>
    )
}

export default props => (
  <StaticQuery
    query={graphql`
    query {
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
    `}
    render={data => <PinnedDevices data={data} {...props} />}
  />
)
