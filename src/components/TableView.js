import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Paper from "@material-ui/core/Paper"
import { navigate } from "gatsby"

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    padding: theme.spacing(3),
    overflow: "scroll",
  },
  table: {
    minWidth: 650,
    borderRadius: "20px",
  },
  tableRow: {
    "&:hover": {
      background: "rgb(45, 46, 47)",
      transition: "all 0.2s ease-in",
      cursor: "pointer",
    },
  },
}))

function truncateText(text) {
  return text.slice(0, 100) + "..."
}

export default function TableView(props) {
  const classes = useStyles()
  const data = props.data
  return (
    <Paper className={classes.root}>
      <Table className={classes.table} stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Board Name</TableCell>
            <TableCell>Device Name(s)</TableCell>
            <TableCell align="right">Stable</TableCell>
            <TableCell align="right">Beta</TableCell>
            <TableCell align="right">Dev</TableCell>
            <TableCell align="right">Canary</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(row => (
            <TableRow key={row.name} className={classes.tableRow} onClick={() => navigate("/device/" + row.Codename)}>
              <TableCell component="th" scope="row">
                <div dangerouslySetInnerHTML={{ __html: row.Codename }}></div>
              </TableCell>
              <TableCell className={classes.brandName}>
                {row.Brand_names.length > 200
                  ? truncateText(row.Brand_names)
                  : row.Brand_names}
              </TableCell>
              <TableCell align="right">
                <div dangerouslySetInnerHTML={{ __html: row.Stable }}></div>
              </TableCell>
              <TableCell align="right">
                <div dangerouslySetInnerHTML={{ __html: row.Beta }}></div>
              </TableCell>
              <TableCell align="right">
                <div dangerouslySetInnerHTML={{ __html: row.Dev }}></div>
              </TableCell>
              <TableCell align="right">
                <div dangerouslySetInnerHTML={{ __html: row.Canary }}></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}
