import React, { Component } from "react"
import MuiDownshift from "mui-downshift"
import PropTypes from "prop-types"
import { StaticQuery, graphql } from "gatsby"

class Search extends Component {
  static defaultProps = {
    blurOnSelect: false,
  }

  state = {
    filteredItems: this.props.data.allCrosUpdatesJson.nodes,
  }

  render() {
    const { filteredItems } = this.state
    const items = this.props.data.allCrosUpdatesJson.nodes
    const handleStateChange = changes => {
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
        variant="filled"
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
