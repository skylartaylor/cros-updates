import React, { Component } from "react"
import { StaticQuery, graphql, navigate } from "gatsby"
import { makeStyles } from "@material-ui/core/styles"
import { Grid, Card, Fade } from "@material-ui/core"
import ClientOnly from './ClientOnly'

const useStyles = makeStyles(theme => ({
    grid: {
        justifyContent: "center",
        paddingBottom: "20px",
    },
    card: {
        padding: "5px 25px",
        margin: "0px 10px",
        background: "#333",
        width: "30%",
        '& h3': {
          minHeight: "50px",
          
        },
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
     
    function stripVersion(versionstring) {
      var values = versionstring.split("<br>")
      return values[1]
    }

    var fetchedDevices = []

    function fetchVersions() {
      var deviceData = props.data.allCrosUpdatesJson.nodes

      if ( devices !== [] ) {

        devices.map(device => {

          var deviceVersions = deviceData.filter(devicetoFilter => devicetoFilter.Codename == device.board )[0]

          var newDevice = {
            board: device.board,
            displayName: device.displayName,
            position: device.position,
            Stable: stripVersion(deviceVersions.Stable),
            Beta: stripVersion(deviceVersions.Beta),
            Dev: stripVersion(deviceVersions.Dev),
            Canary: stripVersion(deviceVersions.Canary),
          }
          
          fetchedDevices.push(newDevice)

        })
      } else {
        return null
      }
    }

    return (
      <ClientOnly>
          <Fade in={true} timeout="1500">
            <Grid container className={classes.grid}>
              {fetchVersions()}
              {fetchedDevices.map(device => {
                    return (
                      <Card
                        key={device.board}
                        variant="outlined"
                        className={classes.card}
                      >
                        <div className={classes.pinnedDevicesHeader}>
                        <h3>{device.displayName}</h3>

                        </div>
                        <div className="versionContainer">
                          <p>Stable: {device.Stable}</p>
                          <p>Beta: {device.Beta}</p>
                          <p>Dev: {device.Dev}</p>
                          <p>Canary: {device.Canary}</p>
                        </div>
                      </Card>
                    )
                  })}
              </Grid>
            </Fade>
          </ClientOnly>
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
