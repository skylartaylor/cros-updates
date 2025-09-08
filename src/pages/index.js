import React from "react"
import { Card, CardContent, Typography, Link } from "@mui/material"
import { styled } from "@mui/system"

import Layout from "../components/Layout"
import IndexSearch from "../components/IndexSearch"

const StyledGrid = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5%",
  height: "calc(100vh - 70px)",
}))

const StyledCard = styled(Card)({
  width: "100%",
  maxWidth: "700px",
  minWidth: "60%",
  paddingBottom: "30px",
})

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
})

const IndexPage = (props) => {
  return (
    <Layout>
      <StyledGrid>
        <StyledCard>
          <HeaderContent>
            <Typography variant="h1">Find your Chrome OS Device</Typography>
            <Typography>
              View Versions, Channels, and Download Recovery Images
            </Typography>
          </HeaderContent>
          <IndexSearch />
          <Typography style={{ textAlign: "center", marginTop: "20px" }}>
            Feeling adventurous?{" "}
            <Link
              href="https://next.cros.tech"
              target="_blank"
              rel="noopener noreferrer"
            >
              Try the new cros.tech ⮕
            </Link>
          </Typography>
        </StyledCard>
      </StyledGrid>
    </Layout>
  )
}

export default IndexPage
