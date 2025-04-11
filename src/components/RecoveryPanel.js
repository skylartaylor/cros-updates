import React from "react";
import { Grid, Typography, Button, Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/system";

const RecoveryPanelStyled = styled(Accordion)(({ theme }) => ({
  maxWidth: "60%",
  minWidth: "40%",
  margin: "30px 0",
  "& h3": {
    textAlign: "center",
  },
}));

const Heading = styled(Typography)({
  textAlign: "center",
});

const RecoveryButton = styled(Button)({
  margin: "10px 5px",
});

const RecoveryPanel = (props) => {
  const recoveryData = props.recoveryData || {};
  return (
    <RecoveryPanelStyled>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Heading>Recovery Images</Heading>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container justifyContent="center">
          {Object.keys(recoveryData).length === 0 ? (
            <Typography variant="body1">
              Recovery images unavailable
            </Typography>
          ) : (
            Object.entries(recoveryData).map((recovery) => {
              return (
                <RecoveryButton
                  key={recovery[0]}
                  href={recovery[1] || "#"}
                  color="primary"
                  variant="contained"
                >
                  {recovery[0]}
                </RecoveryButton>
              );
            })
          )}
        </Grid>
      </AccordionDetails>
    </RecoveryPanelStyled>
  );
};

export default RecoveryPanel;
