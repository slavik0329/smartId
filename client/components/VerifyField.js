/**
 * Created by stevedakh on 4/22/17.
 */

'use strict';

import React, { Component, PropTypes } from 'react';
import {getTypeData} from '../models/typeList';

class VerifyField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputValue : ''
    }
  }

  static propTypes = {
    title: PropTypes.string,
    value: PropTypes.string,
  };

  verify() {
    return web3.sha3(this.state.inputValue) == this.props.value;
  }

  render() {
    const { inputValue } = this.state;
    let inputStyle = {};
    let checkStyle = {};

    if (inputValue && this.verify.call(this)) {
      inputStyle.backgroundColor = "#dff0d8";
      checkStyle.visibility = "visible";
    }

    if (inputValue && !this.verify.call(this)) {
      inputStyle.backgroundColor = "#f2dede";
    }

    return (
      <div style={ styles.container } >
        <div style={styles.title}>{getTypeData(this.props.title).title}</div>

        <form className="form-inline">
          <div className="form-group">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder={getTypeData(this.props.title).placeholder?getTypeData(this.props.title).placeholder:"Value to verify"}
                onChange={res=>this.setState({inputValue: res.target.value})}
                onClick={this.verify.bind(this)}
                style={{...styles.input, ...inputStyle}}
              />
            </div>
          </div>
          {/*<button type="button" className="btn btn-primary">Verify</button>*/}
          <i
            className="fa fa-check-circle-o"
            style={{...styles.checkIcon, ...checkStyle}}
          />

        </form>
      </div>
    );
  }
}

export default VerifyField;

const styles = {
  title: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
    marginTop: 4,
  },
  input: {
    width: 560
  },
  checkIcon: {
    visibility: "hidden",
    left: 6,
    fontSize: 26,
    top: 7,
    position: "relative",
    color: "#5db13a"
  }
};