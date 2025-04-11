import React from 'react';
import { graphql, Link, StaticQuery, navigate } from 'gatsby';
import { styled } from "@mui/system";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "16px",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#121212",
  },
  minHeight: "50px",
  cursor: "pointer",
}));

const PlatformVersion = styled(Typography)(({ theme }) => ({
  fontSize: "0.85em",
}))

const PageTableComponent = ({ devices }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>Codename</StyledTableCell>
            <StyledTableCell>Device Name(s)</StyledTableCell>
            <StyledTableCell align="center">Stable</StyledTableCell>
            <StyledTableCell align="center">Beta</StyledTableCell>
            <StyledTableCell align="center">Dev</StyledTableCell>
            <StyledTableCell align="center">Canary</StyledTableCell>
            <StyledTableCell align="center">AUE Date</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {devices
            .sort((a, b) => a.pageContext.device.codename.localeCompare(b.pageContext.device.codename))
            .map(function(device) {
              let selectedDevice = device.pageContext.device;
              return (
                <StyledTableRow hover key={selectedDevice.codename} onClick={() => navigate(`${device.path}`)}>
                  <StyledTableCell>{selectedDevice.codename}</StyledTableCell>
                  <StyledTableCell>{selectedDevice.brandNames.join(', ')}</StyledTableCell>
                  <StyledTableCell align="center">
                    {selectedDevice.servingStable?.chromeVersion ?? "No Update"}
                    <PlatformVersion>{selectedDevice.servingStable?.version ?? ""}</PlatformVersion>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {selectedDevice.servingBeta?.chromeVersion ?? "No Update"}
                    <PlatformVersion>{selectedDevice.servingBeta?.version ?? ""}</PlatformVersion>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {selectedDevice.servingDev?.chromeVersion ?? "No Update"}
                    <PlatformVersion>{selectedDevice.servingDev?.version ?? ""}</PlatformVersion>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {selectedDevice.servingCanary?.chromeVersion ?? "No Update"}
                    <PlatformVersion>{selectedDevice.servingCanary?.version ?? ""}</PlatformVersion>
                  </StyledTableCell>
                  <StyledTableCell>{selectedDevice.aueDate}</StyledTableCell>
                </StyledTableRow>
              );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const PageTable = () => {
  return (
    <StaticQuery
      query={graphql`
        {
          allSitePage(filter: {path: {regex: "/^/device//"}}) {
            nodes {
              path
              pageContext
            }
          }
        }
      `}
      render={(data) => <PageTableComponent devices={data.allSitePage.nodes} />}
    />
  );
};

export default PageTable;
