import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Grid, Card, CardContent } from "@material-ui/core"
import DeviceSearch from "../components/DeviceSearch"

const useStyles = makeStyles(theme => ({
  grid: {
    padding: theme.spacing(3),
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
        <Card>
          <CardContent className={classes.header}>
            <h1>Find your Chrome OS Device</h1>
            <h3 className={classes.warning}>Data may be out of date due to a Google data issue.</h3>
            <DeviceSearch />
            <h3>
              Experiencing issues or have a feature request? <a href="https://github.com/skylartaylor/cros-updates/" target="_blank" rel="noopener noreferrer" >Report it on Github!</a>
            </h3>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
