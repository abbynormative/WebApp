import React, { Component, PropTypes } from "react";
import LoadingWheel from "../../components/LoadingWheel";
import VoterPositionItem from "../../components/VoterGuide/VoterPositionItem";

export default class GuidePositionListForVoter extends Component {
  static propTypes = {
    voter: PropTypes.object.isRequired
  };

  constructor (props) {
    super(props);
    this.state = { voter: this.props.voter };
  }

  componentWillReceiveProps (nextProps) {
    // When a new candidate is passed in, update this component to show the new data
    this.setState({voter: nextProps.voter});
  }

  render () {
    if (!this.state.voter){
      return <div>{LoadingWheel}</div>;
    }

    const { position_list_for_one_election, position_list_for_all_except_one_election } = this.state.voter;
    return <span>
        <div className="card__container">
          <ul className="list-group">
            { position_list_for_one_election ?
              position_list_for_one_election.map( item => {
                return <VoterPositionItem key={item.position_we_vote_id}
                                                 position={item}
                                                 organization={this.state.organization}
                                                 popover_off />;
              }) :
              <div>{LoadingWheel}</div>
            }
            { position_list_for_all_except_one_election ?
              <span>
                { position_list_for_all_except_one_election.length ?
                  <span>
                    <br />
                    <h4>Positions for Other Elections</h4>
                  </span> :
                  null
                }
                { position_list_for_all_except_one_election.map( item => {
                  return <VoterPositionItem key={item.position_we_vote_id}
                                                   position={item}
                                                   organization={this.state.organization}
                                                   popover_off />;
                }) }
              </span> :
              <div>{LoadingWheel}</div>
            }
          </ul>
        </div>
        <br />
      </span>;
  }
}
