import React, { Component } from "react"
import { Grid, Card, CardContent } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"


const classes = makeStyles(theme => ({
    versionCard: {
      maxWidth: "300px",
    }
  }))

export default class DeviceVersions extends Component {
    render(props) {
        return(
            <Grid
                direction="row"
                container
            >
                <Card className={classes.versionCard}>
                    <CardContent>
                        <h2>Stable</h2>
                        <p>{this.props.device.Stable.version}</p>
                    </CardContent>
                </Card>
                <Card className={classes.versionCard}>
                    <CardContent>
                        <h2>Beta</h2>
                        <p>{this.props.device.Beta.version}</p>
                    </CardContent>
                </Card>
                <Card className={classes.versionCard}>
                    <CardContent>
                        <h2>Dev</h2>
                        <p>{this.props.device.Dev.version}</p>
                    </CardContent>
                </Card>
                <Card className={classes.versionCard}>
                    <CardContent>
                        <h2>Canary</h2>
                        <p>{this.props.device.Canary.version}</p>
                    </CardContent>
                </Card>
            </Grid>
        )
    }
}