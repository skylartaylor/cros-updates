import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Grid, Card, CardContent } from "@material-ui/core"
import DeviceSearch from "../components/DeviceSearch"
import PinnedDevices from "../components/PinnedDevices"
import clsx from 'clsx'

const useStyles = makeStyles(theme => ({
  grid: {
    padding: theme.spacing(3),
  },
  card: {
    padding: "0 " + theme.spacing(2) + "px",
    margin: "0 0 15px 0",
  },
  header: {
    textAlign: "center",
    '& h1': {
      margin: "15px 0px 20px 0px",
    },
    '& h3': {
      fontWeight: "300",
      fontStyle: "italic",
      fontSize: "0.95em",
      margin: "20px 0px 0px 0px",
    },
  },
  item: {
    minWidth: "60%",
  },
  warning: {
    margin: "-10px 0px 10px 0px !important",
    color: "#FF3C00",
  },
  pinnedDevices: {
    minHeight: "306px",
    '& h3': {
      textAlign: "center",
      //fontSize: "1.2em",
      fontWeight: "400",
      //textTransform: "uppercase",
      //letterSpacing: "0.2em",
    },
  },
}))

export default function Index(props) {
  const classes = useStyles()

  return (
    <Grid
      container
      className={classes.grid}
      alignContent="center"
      justify="center"
    >
      <Grid item className={classes.item}>
        <Card className={classes.card}>
          <CardContent className={classes.header}>
            <h1>Find your Chrome OS Device</h1>
            {/*<h3 className={classes.warning}>GitHub is currently experiencing issues resulting in version data being out of date.</h3>*/}
            <DeviceSearch />
          </CardContent>
        </Card>
        <Card className={clsx(classes.card && classes.pinnedDevices)}>
          <h3>Pinned Devices:</h3>
          <PinnedDevices />
        </Card>
      </Grid>
    </Grid>
  )
}
