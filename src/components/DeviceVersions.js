import React from "react"
import { Grid } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"


const useStyles = makeStyles(theme => ({
    versionCard: {
      maxWidth: "300px",
      width: "300px",
      height: "200px",
      margin: "10px",
      padding: 0,
      backgroundColor: "#E9E9E9",
      color: "#333",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      '& h1': {
        fontWeight: "400",
        marginBottom: 0,
      },
      '& h4': {
          marginTop: "0px",
      },
    },
    versionHeader: {
        color: "#FFF",
        margin: 0,
        padding: "15px 0px",
    },
    stable: {
        background: "#1DA462",
    },
    beta: {
        background: "#4C8BF5",
    },
    dev: {
        background: "#DD5144",
    },
    canary: {
        background: "#FFCD46",
    },
    versionContainer: {
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    }
  }))

export default function DeviceVersions(props) {
    const classes= useStyles()
    return(
        <Grid
            direction="row"
            container
            justify="center"
        >
            <div className={classes.versionCard}>
                    <h2 className={`${classes.versionHeader} ${classes.stable}`}>Stable</h2>
                    <div className={classes.versionContainer}>
                        <h1>{props.device.Stable.version}</h1>
                        <h4>platform: {props.device.Stable.platform}</h4>
                    </div>
            </div>
            <div className={classes.versionCard}>
                    <h2 className={`${classes.versionHeader} ${classes.beta}`}>Beta</h2>
                    <div className={classes.versionContainer}>
                        <h1>{props.device.Beta.version}</h1>
                        <h4>platform: {props.device.Beta.platform}</h4>
                    </div>
            </div>
            <div className={classes.versionCard}>
                    <h2 className={`${classes.versionHeader} ${classes.dev}`}>Dev</h2>
                    <div className={classes.versionContainer}>
                        <h1>{props.device.Dev.version}</h1>
                        <h4>platform: {props.device.Dev.platform}</h4>
                    </div>
            </div>
            <div className={classes.versionCard}>
                    <h2 className={`${classes.versionHeader} ${classes.canary}`}>Canary</h2>
                    <div className={classes.versionContainer}>
                        <h1>{props.device.Canary.version}</h1>
                        <h4>platform: {props.device.Canary.platform}</h4>
                    </div>
            </div>
        </Grid>
    )
}