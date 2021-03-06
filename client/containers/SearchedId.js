/**
 * Created by ricardodalessandro on 4/22/17.
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { setSearchedIdentity } from '../actions';
import { lookupAccount, getIdentity, isAllowedToAttest, attest } from '../models/blockchain';

import Field from '../components/Field';
import VerifyField from '../components/VerifyField';
import Attestation from '../components/Attestation';
import MyId from './MyId';
import PendingModal from '../components/PendingModal';

class SearchedIdentity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      identity: '',
      isAllowed: false,
      category: null,
      data: null,
      expiration: null,
      isSending: false
    }
  }

  handleAttest() {
    const { identity, data, expiration } = this.state;

    attest(identity, data, expiration, (err, txHash) => {
      if (err) return;

      this.setState({
        isAllowed: '',
        category: '',
        data: '',
        expiration: '',
        isSending: true
      });

      checkForTx.call(this);

      function checkForTx ()
      {
        web3.eth.getTransaction(txHash, (err, res) => {
          console.log(res);
          if ( res.blockNumber ) {
            this.setState({
              isSending: false
            });
            location.reload();
          } else {
            setTimeout(checkForTx.bind(this), 5000);
          }
        });
      }
    })
  }

  componentDidMount() {
    let { identity } = this.props.params;
    const { setSearchedIdentity } = this.props; // actions

    lookupAccount(identity, (err, res) => {
      if (!err && res !== '0x0000000000000000000000000000000000000000' && res !== '0x') identity = res;
      this.setState({ identity });
      getIdentity(identity, (contractData) => setSearchedIdentity(contractData));
    });


    setTimeout(() => {
      const { addresses } = this.props; // redux state

      isAllowedToAttest(identity, addresses.wallet, (err, res) => {
        if (!err) {
          this.setState({ isAllowed: res[1], category: res[0] });
        }
      });
    }, 1000);
  }

  getCategory (category) {
    let type;

    try {
      type = JSON.parse(category).type
    } catch(e) {
      type = category;
    }

    return type;
  }

  getAttestations () {
    let attestations = [];

    let {searchedIdentity} = this.props;

    for ( let i = 0; i < Number(searchedIdentity.numAttestations.toString()); i++) {
      attestations.push(<Attestation key={i} contractAddress={searchedIdentity.address} attestationID={i} />);
    }

    return attestations;
  }

  render() {
    const { isAllowed, category, data, expiration } = this.state;
    const { addresses, searchedIdentity } = this.props;
    const { owner, publicUserData, hashedUserData } = searchedIdentity;

    let hashedUserDataArr = [];
    let publicUserDataArr = [];

    if ( hashedUserData ) {
      let hashedUserDataObj = JSON.parse(hashedUserData);

      for ( let i in hashedUserDataObj ) {
        hashedUserDataArr.push({
          title: i,
          value: hashedUserDataObj[i]
        });
      }
    }

    if ( publicUserData ) {
      let publicUserDataObj = JSON.parse(publicUserData);

      for ( let i in publicUserDataObj ) {
        publicUserDataArr.push({
          title: i,
          value: publicUserDataObj[i]
        });
      }
    }

    if (addresses.wallet === owner) return <MyId />;

    else if (searchedIdentity && owner !== '0x' ) return (
      <div>
        <PendingModal
          text={"Attesting"}
          modalIsOpen={this.state.isSending}
          closeModal={()=>this.setState({isSending:false})}
        />
        <div style={styles.heading}>Contract {this.props.params.identity}</div>

        { isAllowed ?
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title">You have been authorized to write an attestation for { this.getCategory(category) }</h3>
            </div>
            <div className="panel-body">
              <form className="form-inline">
                <div className="form-group">
                  <div htmlFor="data" style={ styles.title }>Data</div>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      style={ styles.input }
                      id="data"
                      placeholder="Data to attest"
                      value={ data }
                      onChange={ (e) => this.setState({ data: e.target.value }) }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div htmlFor="expiration" style={ styles.title }>Expiration Date/Time</div>
                  <div className="input-group">
                    <input
                      type="date"
                      className="form-control"
                      style={ styles.input }
                      id="expiration"
                      placeholder="Timestamp"
                      value={ expiration }
                      onChange={ (e) => this.setState({ expiration: e.target.value }) }
                    />
                  </div>
                </div>
                <div style={ styles.button }>
                  <button onClick={ this.handleAttest.bind(this) } type="button" className="btn btn-default">Attest</button>
                </div>
              </form>
            </div>
          </div>
          : null
        }

        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Public Data</h3>
          </div>
          <div className="panel-body">
            {publicUserDataArr.map(item=><Field key={item.title} title={item.title} value={item.value}/>)}
          </div>
        </div>

        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Private Data</h3>
          </div>
          <div className="panel-body">
            {hashedUserDataArr.map(item=><VerifyField key={item.title} title={item.title} value={item.value}/>)}
          </div>
        </div>

        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Attestations</h3>
          </div>
          <div className="panel-body">
            { searchedIdentity.numAttestations && searchedIdentity.numAttestations.toString() != "0" ?
              this.getAttestations.call(this)
              : <div>There are no attestations on this identity</div>
            }
          </div>
        </div>
      </div>
    );

    else return <div>Not Found</div>;
  }
}

const mapStateToProps = (state) => { return { addresses: state.addresses, searchedIdentity: state.searchedIdentity } };
const mapDispatchToProps = (dispatch) => bindActionCreators({ setSearchedIdentity }, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(SearchedIdentity);

const styles = {
  title: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
    marginTop: 4,
    display: 'block'
  },
  input: {
    width: 560,
    display: 'block'
  },
  button: {
    marginTop: 12
  },
  heading: {
    fontSize: 22,
    fontWeight: 200,
    marginBottom: 10
  }
};
