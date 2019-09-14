import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Box } from "@material-ui/core"
import DeviceSearch from "../components/DeviceSearch"

const useStyles = makeStyles(theme => ({
  box: {
    width: "60%",
    margin: "30px auto",
    height: "300px",
  },
  header: {
    textAlign: "center",
  },
}))

export default function Index() {
  const classes = useStyles()

  return (
    <Box className={classes.box}>
      <h1 className={classes.header}>Find your Chrome OS Device</h1>
      <DeviceSearch />
    </Box>
  )
}
