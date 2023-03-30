import React, { useState } from "react";
import { useStaticQuery, graphql, navigate } from "gatsby";
import { Autocomplete, TextField, Popper, Box, Typography } from "@mui/material";

const IndexSearch = () => {
  const data = useStaticQuery(graphql`
    query DeviceNames {
      allSitePage(filter: {path: {regex: "/^/(device|board)//"}}) {
          nodes {
              pageContext
              path
          }
      }
    }
  `);

  const devices = data.allSitePage.nodes.flatMap((device) => {
    const brandNames = device.pageContext.device.brandNames
      ? device.pageContext.device.brandNames[0]
      : null;
    const values = [];
  
    if (brandNames) {
      brandNames.split(/,(?![^([[]*[\])])/).forEach((name) => {
        let value = device.path;
  
        values.push({ label: name.trim(), value, id: device.pageContext.device.id });
      });
  
      // Add Codename entry only if brandNames exists and doesn't include 'Board:'
      if (brandNames && !brandNames.startsWith("Board:")) {
        values.push({
          label: `Codename: ${device.pageContext.device.codename}`,
          value: device.path,
          id: `codename-${device.pageContext.device.codename}`,
        });
      }
    }
    return values;
  });

  devices.sort((a, b) => {
    const isBoardA = a.label.startsWith("Board:");
    const isBoardB = b.label.startsWith("Board:");
    const isCodenameA = a.label.startsWith("Codename:");
    const isCodenameB = b.label.startsWith("Codename:");
  
    if (isBoardA && !isBoardB) return 1;
    if (!isBoardA && isBoardB) return -1;
    if (isCodenameA && !isCodenameB) return 1;
    if (!isCodenameA && isCodenameB) return -1;
  
    const labelA = a.label.toUpperCase();
    const labelB = b.label.toUpperCase();
  
    if (labelA < labelB) {
      return -1;
    }
    if (labelA > labelB) {
      return 1;
    }
    return 0;
  });
  
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const handleSelect = (event, value) => {
    if (value) {
      setSelectedDevice(value);
      navigate(value.value);
    }
  };

return (
  <Box sx={{ width: "90%", margin: "0 auto" }}>
    <Autocomplete
      id="search-box"
      options={devices}
      getOptionLabel={(option) => option.label}
      value={selectedDevice}
      inputValue={inputValue}
      onChange={handleSelect}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      onInputChange={(event, value) => setInputValue(value)}
      renderInput={(params) => (
        <TextField {...params} label="Search for a Device, Board, or Codename" />
      )}
      renderOption={(props, option) =>
        option.label ? (
          <li {...props} key={option.id}>
            <Typography>{option.label}</Typography>
          </li>
        ) : undefined
      }
      renderValue={(value) => (value ? value.label : "")}
      popperComponent={({ children, ...props }) => (
        <Popper {...props} placement="bottom-start" disablePortal>
          {children}
        </Popper>
      )}
      ListboxProps={{
        sx: {
          maxHeight: 200,
          overflow: "auto",
        },
      }}
    />
  </Box>
);

};

export default IndexSearch;
