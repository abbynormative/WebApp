import React, { Component, PropTypes } from "react";
import { Button, ButtonToolbar } from "react-bootstrap";
import { browserHistory } from "react-router";
import LoadingWheel from "../components/LoadingWheel";
import VoterActions from "../actions/VoterActions";
import VoterStore from "../stores/VoterStore";

export default class AddressBox extends Component {
  static propTypes = {
    saveUrl: PropTypes.string.isRequired
  };

  constructor (props) {
      super(props);
      this.state = { loading: false };
  }

  componentDidMount () {
    this.setState({ voter_address: VoterStore.getAddress() });
    this.voterStoreListener = VoterStore.addListener(this._onVoterStoreChange.bind(this));
  }

  componentWillUnmount (){
    this.voterStoreListener.remove();
  }

  _onVoterStoreChange () {
    if (this.state.voter_address){
      browserHistory.push(this.props.saveUrl);
    } else {
      this.setState({ voter_address: VoterStore.getAddress(), loading: false });
    }
  }

  _ballotLoaded (){
    browserHistory.push(this.props.saveUrl);
  }

  updateVoterAddress (e) {
    this.setState({
      voter_address: e.target.value
    });
  }

  saveVoterAddress (e) {
    e.preventDefault();
    var { voter_address } = this.state;
    VoterActions.saveAddress(voter_address);
    this.setState({loading: true});
  }

  render () {
    var { loading, voter_address } = this.state;
    if (loading){
      return LoadingWheel;
    }
    var floatRight = {
        float: "right"
    };
    return <div>
        <form onSubmit={this.saveVoterAddress.bind(this)}>
        <input
          type="text"
          onChange={this.updateVoterAddress.bind(this)}
          name="address"
          value={voter_address}
          className="form-control"
          placeholder="Enter address where you are registered to vote"
        />
        </form>

        <div className="u-gutter__top--small">
          <ButtonToolbar bsClass="btn-toolbar">
            <span style={floatRight}>
              <Button
                onClick={this.saveVoterAddress.bind(this)}
                bsStyle="primary">
                Go to Ballot for this Address</Button>
            </span>
          </ButtonToolbar>
        </div>
      </div>;
  }
}
