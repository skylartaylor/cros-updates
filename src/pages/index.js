import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Grid, Card, CardContent } from "@material-ui/core"
import DeviceSearch from "../components/DeviceSearch"

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
}))

export default function Index() {
  const classes = useStyles()

  return (
    <Grid
      container
      className={classes.grid}
      alignContent="center"
      justify="center"
      flexGrow={1}
    >
      <Grid item className={classes.item}>
        <Card>
          <CardContent>
            <h3 className={classes.header}>
              This website is *extremely broken* and under construction!
            </h3>
            <h1 className={classes.header}>Find your Chrome OS Device</h1>
            <DeviceSearch />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
