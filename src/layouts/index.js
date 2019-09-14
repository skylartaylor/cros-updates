import React from "react"
import PropTypes from "prop-types"

import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { Box } from '@material-ui/core'

import CustomAppBar from '../components/CustomAppBar'

const theme = createMuiTheme({
    palette: {
      type: 'dark',
      primary: { 500: '#FF3C00' },
    },
  });

const Layout = ({ children }) => {
  return (
    <>
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <CustomAppBar />
            <Box>
                { children }
            </Box>
        </MuiThemeProvider>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
