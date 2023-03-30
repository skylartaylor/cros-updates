import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { styled } from "@mui/system";

import Layout from "../components/Layout";
import PageTable from "../components/PageTable.js"

const StyledGrid = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: "50px 0",
}));

const StyledCard = styled(Card)({
  maxWidth: "100%",
  minWidth: "80%",
});

const HeaderContent = styled(CardContent)({
  textAlign: "center",
  "& h1": {
    margin: "10px 0px 0px 0px",
    fontSize: "2em",
    fontWeight: "bold",
  },
  "& p": {
    margin: "10px 0 10px 0",
    fontSize: "0.85em",
    fontWeight: "300",
    fontStyle: "italic",
  },
  "& h3": {
    fontWeight: "300",
    fontStyle: "italic",
    fontSize: "0.8em",
    margin: "15px 0px 0px 0px",
  },
});

const IndexPage = (props) => {
  return (
    <Layout>
      <StyledGrid>
        <StyledCard>
          <PageTable />
        </StyledCard>
      </StyledGrid>
    </Layout>
  );
};

export default IndexPage;
