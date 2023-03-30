import React from "react";
import { Grid, Typography, Box, Card, CardContent, CardActionArea } from "@mui/material";
import { Link } from 'gatsby'
import { styled } from "@mui/system";

import Layout from "../components/Layout";
import RecoveryPanel from "../components/RecoveryPanel";

const DeviceTitle = ({ brandNames, ...rest }) => (
  <Typography
    variant="h1"
    sx={{
      textAlign: "center",
      margin: "15px 0px 0px 0px",
      padding: "0px 10px",
      fontSize: "2.5em",
      fontWeight: "bold",
    }}
  >
    {brandNames}
  </Typography>
  )

const BoardName = styled(Typography)({
  textAlign: "center",
  fontStyle: "italic",
  margin: "5px 0px 15px 0px",
  padding: 0,
});

const DevicePage = (pageContext, props) => {
  const boardData = pageContext.pageContext.device
  const pushRecoveries = boardData.models[Object.keys(boardData.models)[0]].pushRecoveries;
  const deviceData = {
    pushRecoveries: pushRecoveries,
    ...boardData,
  }
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
          <DeviceTitle variant="h1" brandNames={deviceData.codename}>
            {deviceData.codename}
          </DeviceTitle>
          <BoardName variant="subtitle1">
            Board • {Object.keys(boardData.models).length} Devices
          </BoardName>
          <RecoveryPanel recoveryData={deviceData.pushRecoveries} />
          <Box sx={{ maxWidth: "800px", width: '80%' }}>
            {Object.keys(boardData.models).map((model) => {
              let selectedModel = {
                codename: model,
                path: "/device/" + model,
                ...boardData.models[model]
              }
              return (
                // Return an element here, for example:
                <Card variant="outlined" sx={{ margin: '15px 0' }}>
                <Link to={selectedModel.path} style={{ textDecoration: 'none' }}>
                  <CardActionArea>
                    <CardContent>
                      <Typography variant="h4" sx={{ color: '#FF3C00', margin: '0 0 5px 0' }}>{selectedModel.codename}</Typography>
                      <Typography sx={{ color: "#FFF" }}>{selectedModel.brandNames.join(', ')}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Link>
              </Card>
              );
            })}
          </Box>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default DevicePage;
