import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
}));

export default function TableView(props) {
  const classes = useStyles();
  const data = props.data
  console.log(data)
  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Board Name</TableCell>
            <TableCell>Devices</TableCell>
            <TableCell align="right">Stable</TableCell>
            <TableCell align="right">Beta</TableCell>
            <TableCell align="right">Dev</TableCell>
            <TableCell align="right">Canary</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(row => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell>{row.Brand_names}</TableCell>
              <TableCell align="right">{row.Stable}</TableCell>
              <TableCell align="right">{row.Beta}</TableCell>
              <TableCell align="right">{row.Dev}</TableCell>
              <TableCell align="right">{row.Canary}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}