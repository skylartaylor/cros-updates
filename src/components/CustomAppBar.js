import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core"
import CancelIcon from '@material-ui/icons/Cancel'
import MenuIcon from '@material-ui/icons/Menu'
import HomeIcon from '@material-ui/icons/Home'
import TableChartIcon from '@material-ui/icons/TableChart'
import { Link as RouterLink} from "gatsby"

const styles = {
  root: {
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '10px 8px',
  },
  drawerPaper: {
    minWidth: "300px"
  },
  link: {
    textDecoration: "none",
    '& h6:hover': {
      opacity: "0.5",
    },
  },
};

function ListItemLink(props) {
  const { icon, primary, to, onClick } = props;

  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} onClick={onClick} />),
    [to, onClick],
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

ListItemLink.propTypes = {
  icon: PropTypes.element,
  primary: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

class CustomAppBar extends React.Component {
  state = { drawerIsOpen: false }

  handleDrawerOpen = () => {
    this.setState({ drawerIsOpen: true });
  };

  handleDrawerClose = () => {
    this.setState({ drawerIsOpen: false });
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton onClick={this.handleDrawerOpen} className={classes.menuButton} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <RouterLink to ="/" className={classes.link}>
              <Typography variant="h6" className={classes.flex}>
                Chrome OS Updates
              </Typography>
            </RouterLink>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="persistent"
          classes={{
            paper: classes.drawerPaper,
          }}
          open={this.state.drawerIsOpen}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={this.handleDrawerClose}>
              <CancelIcon />
            </IconButton>
          </div>
          <div className={classes.drawerInner}>
            <List>
              <ListItemLink to="/" primary="Home" icon={<HomeIcon />} onClick={this.handleDrawerClose}/>
              <ListItemLink to="/table" primary="Table" icon={<TableChartIcon />} onClick={this.handleDrawerClose}/>
            </List>
          </div>
        </Drawer>
      </div>
    );
  }
}

CustomAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CustomAppBar);
