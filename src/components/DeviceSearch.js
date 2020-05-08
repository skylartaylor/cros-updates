import React, { Component } from "react"
import MuiDownshift from "mui-downshift"
import PropTypes from "prop-types"
import { StaticQuery, graphql, navigate } from "gatsby"

class Search extends Component {
  static defaultProps = {
    blurOnSelect: false,
  }

  state = {}

  static getDerivedStateFromProps(props, state) {

    if (state.filtered === true) {
      return state
    } else {
      var splitDevices = []
      const deviceSplit = props.data.allCrosUpdatesJson.nodes.forEach(device => {
        var splitDevice = device.label.split(/,(?![^\(\[]*[\]\)])/).forEach(deviceName => {
          var deviceName = deviceName.trim()
          if (deviceName !== "" && deviceName !== "N/A" && deviceName !== "100e 2nd Gen AMD" && deviceName !== "300e 2nd Gen AMD") {
            splitDevices.push({
                value: device.value,
                label: deviceName
              })
          }
        })
      })
  
      const deviceNames = splitDevices.sort((a, b) => a.label.localeCompare(b.label))
  
      const boardNames = props.data.allCrosUpdatesJson.nodes.map( (device) => {
        return {
          value: device.value,
          label: "board: " + device.value,
        } 
      })
  
      var initialItems = deviceNames.concat(boardNames)
      
      return {
        items: initialItems,
        filteredItems: initialItems,
        filtered: false,
      }
    }
  }

  render() {

    const handleStateChange = changes => {

      if (typeof changes.inputValue === "string") {
        const filterItems = this.state.items.filter(item =>
          item.label.toLowerCase().includes(changes.inputValue.toLowerCase())
        )
        this.setState({ 
          ...this.state,
          filteredItems: filterItems,
          filtered: true, 
        })
      }

      if (this.input && this.props.blurOnSelect) {
        this.input.blur()
      }

      if (changes.type === "__autocomplete_click_item__" || changes.type === "__autocomplete_keydown_enter__" || changes.type === 6 || changes.type === 7) {
        var url = "/device/" + changes.selectedItem.value
        navigate( url, { state: { deviceName: changes.selectedItem.label}})
      }
    }

    return (
      <MuiDownshift
        items={this.state.filteredItems}
        onStateChange={handleStateChange}
        variant="filled"
        {...this.props}
        inputRef={node => {
          this.input = node
        }}
        getInputProps={() => ({
          label: 'Enter a Chrome OS Device or Board',
        })}
      />
    )
  }
}

Search.propTypes = {
  blurOnSelect: PropTypes.bool,
}

export default props => (
  <StaticQuery
    query={graphql`
      query {
        allCrosUpdatesJson(filter: { Brand_names: { ne: null } }) {
          nodes {
            value: Codename
            label: Brand_names
          }
        }
      }
    `}
    render={data => <Search data={data} {...props} />}
  />
)
