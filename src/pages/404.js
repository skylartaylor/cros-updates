import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Grid, Card, CardContent } from "@material-ui/core"

const useStyles = makeStyles(theme => ({
  grid: {
    padding: theme.spacing(3),
    height: "auto"
  },
  header: {
    textAlign: "center",
    '& h1': {
      margin: "15px 0px 5px 0px",
    },
    '& h3': {
      fontWeight: "300",
      fontStyle: "italic",
      fontSize: "0.95em",
      margin: "0px 0px 30px 0px",
    },
  },
  item: {
    minWidth: "60%",
  },
}))

export default function NotFound(props) {
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
            <h1>Oops!</h1>
            <h3>
              You managed to find a url that doesn't exist. whoops.
            </h3>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
