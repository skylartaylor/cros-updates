import React from "react";
import { Grid, Typography } from "@mui/material";
import { styled } from "@mui/system";

import Layout from "../components/Layout";
import RecoveryPanel from "../components/RecoveryPanel";
import DeviceVersions from "../components/DeviceVersions";

const DeviceTitle = ({ brandNames, ...rest }) => (
  <Typography
    variant="h1"
    sx={{
      textAlign: "center",
      margin: "15px 0px 0px 0px",
      padding: "0px 10px",
      fontSize: brandNames[0].length > 50 ? "1.5em" : "2em",
      fontWeight: "bold",
    }}
  >
    {brandNames.join(', ')}
  </Typography>
  )

const BoardName = styled(Typography)({
  textAlign: "center",
  fontStyle: "italic",
  margin: "5px 0px",
  padding: 0,
});

const DevicePage = (pageContext, props) => {
  const deviceData = pageContext.pageContext.device;
  const codename = deviceData.codename
  return (
    <Layout>
      <Grid container direction="row" justifyContent="center">
        <Grid
          item
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            width: "100%",
            padding: "30px 0px",
          }}
        >
          <DeviceTitle variant="h1" brandNames={deviceData.brandNames}>
            {deviceData.brandNames}
          </DeviceTitle>
          <BoardName variant="subtitle1">
            {deviceData.mainBoard && deviceData.mainBoard !== codename ? `board: ${deviceData.mainBoard}   • ` : ""} codename: {codename}
          </BoardName>
        </Grid>
        <DeviceVersions deviceData={deviceData} />
        <RecoveryPanel recoveryData={deviceData.pushRecoveries} />
      </Grid>
    </Layout>
  );
};

export default DevicePage;
