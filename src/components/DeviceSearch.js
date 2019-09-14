import React, { Component } from "react"
import MuiDownshift from "mui-downshift"
import PropTypes from "prop-types"
import { StaticQuery, graphql } from "gatsby"

class Search extends Component {
  static defaultProps = {
    blurOnSelect: false,
  }

  state = {
    filteredItems: this.props.data.allCrosUpdates3Json.nodes,
  }

  render() {
    const { filteredItems } = this.state
    const items = this.props.data.allCrosUpdates3Json.nodes

    const handleStateChange = changes => {
      console.log(changes)
      if (typeof changes.inputValue === "string") {
        const filteredItems = items.filter(item =>
          item.label.toLowerCase().includes(changes.inputValue.toLowerCase())
        )
        this.setState({ filteredItems })
      }
      if (this.input && this.props.blurOnSelect) {
        this.input.blur()
      }
    }

    return (
      <MuiDownshift
        items={this.state.filteredItems}
        onStateChange={handleStateChange}
        // getListItemKey={rowIndex => filteredItems[rowIndex].value}
        // keyMapper={rowIndex => filteredItems[rowIndex] && filteredItems[rowIndex].label}
        {...this.props}
        inputRef={node => {
          this.input = node
        }}
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
        allCrosUpdates3Json {
          nodes {
            value: name
            label: Brand_names
          }
        }
      }
    `}
    render={data => <Search data={data} {...props} />}
  />
)
