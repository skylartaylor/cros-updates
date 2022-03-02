import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Grid, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Typography, Button } from "@material-ui/core"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { DOMParser } from 'xmldom'

const useStyles = makeStyles({
    recoveryPanel: {
      maxWidth: "60%",
      minWidth: "40%",
      margin: "30px 0",
      '& h3': {
        textAlign: "center",
      },
    },
    recoveryLinks: {
      '& a': {
        textDecoration: "none",
        padding: "5px 10px",
        border: "2px solid white",
        borderRadius: "5px",
      },
    },
    button: {
      color: "#333",
      margin: "10px 5px",
    },
  })
  
  export default function RecoveryPanel(props) {
    const classes = useStyles()
  
    var selectedDevice = props.device
    var recoveryData = Object.entries(selectedDevice.Recovery)

    var formattedDevice = {
      Codename: selectedDevice.Codename,
      Brand_names: selectedDevice["Brand names"],
      Recovery: selectedDevice.Recovery,
    }
    return (
        <ExpansionPanel className={classes.recoveryPanel}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>Recovery Images</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container justify="center">
                {(formattedDevice.Recovery === "no update") ? <h3>Google's recovery images are currently down. <br />They will return here as soon as they are up again. Sorry for the inconvenience!</h3> : null}
                {recoveryData.map(recovery => {
                  return (
                    <Button
                      key={recovery[0]}
                      href={recovery[1]}
                      color="primary"
                      variant="contained"
                      className={classes.button}
                    >
                      {recovery[0]}
                    </Button>
                  )
                })}
              </Grid>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    )
  }
  