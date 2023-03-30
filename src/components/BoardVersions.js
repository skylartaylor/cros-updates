import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import { styled } from "@mui/system";

const VersionCard = ({ headerColor, ...rest }) => (
  <Box
    sx={{
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
      "& h1": {
        fontWeight: "400",
        fontSize: "2em",
        marginBottom: 0,
      },
      "& h4": {
        marginTop: "5px",
        fontSize: "0.8em",
      },
      "& h2": {
        color: "#FFF",
        margin: 0,
        padding: "15px 0px",
        background: headerColor,
        fontSize: "1.5em",
        fontWeight: "bold",
      },
    }}
    {...rest}
  />
);

const VersionContainer = styled(Box)({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
});

export default function DeviceVersions(props) {
    const deviceData = props.deviceData
    return (
        <Grid container justifyContent="center">
            <VersionCard headerColor="#1DA462">
            <Typography variant="h2">Stable</Typography>
            <VersionContainer>
                <Typography variant="h1">{deviceData.servingStable.chromeVersion}</Typography>
                <Typography variant="h4">platform: {deviceData.servingStable.version}</Typography>
            </VersionContainer>
            </VersionCard>
            <VersionCard headerColor="#4C8BF5">
            <Typography variant="h2">Beta</Typography>
            <VersionContainer>
                <Typography variant="h1">{deviceData.servingBeta.chromeVersion}</Typography>
                <Typography variant="h4">platform: {deviceData.servingBeta.version}</Typography>
            </VersionContainer>
            </VersionCard>
            <VersionCard headerColor="#DD5144">
            <Typography variant="h2">Dev</Typography>
            <VersionContainer>
                <Typography variant="h1">{deviceData.servingDev.chromeVersion}</Typography>
                <Typography variant="h4">platform: {deviceData.servingDev.version}</Typography>
            </VersionContainer>
            </VersionCard>
            <VersionCard headerColor="#FFCD46">
            <Typography variant="h2">Canary</Typography>
            <VersionContainer>
                <Typography variant="h1">{deviceData.servingCanary.chromeVersion}</Typography>
                <Typography variant="h4">platform: {deviceData.servingCanary.version}</Typography>
            </VersionContainer>
            </VersionCard>
        </Grid>
    );  
}
