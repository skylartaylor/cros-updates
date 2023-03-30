import React from "react";
import { Container, ThemeProvider, createTheme, CssBaseline } from "@mui/material";

import ResponsiveAppBar from "../components/AppBar";

const customTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: "#303030",
    },
    primary: { main: "#FF3C00" },  
  },
});

const Layout = ( {children} ) => {
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <ResponsiveAppBar />
      <Container maxWidth="false">
        {children}
      </Container>
    </ThemeProvider>
  );
};

export default Layout;