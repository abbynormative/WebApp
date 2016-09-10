import React, { Component, PropTypes } from "react";
import CandidateList from "../../components/Ballot/CandidateList";
import MeasureItem from "../../components/Ballot/MeasureItem";
import StarAction from "../../components/Widgets/StarAction";

const TYPES = require("keymirror")({
  OFFICE: null,
  MEASURE: null
});

export default class BallotItem extends Component {
  static propTypes = {
    kind_of_ballot_item: PropTypes.string.isRequired,
    we_vote_id: PropTypes.string.isRequired,
    ballot_item_display_name: PropTypes.string.isRequired,
    candidate_list: PropTypes.array
  };

  isMeasure () {
    return this.props.kind_of_ballot_item === TYPES.MEASURE;
  }

  render () {
    return <div className="ballot-section" id={this.props.we_vote_id}>
        { this.isMeasure() ?
          <div className="card__container">
            <MeasureItem {...this.props}
                     link_to_ballot_item_page />
          </div> :
          <span>
            <h2 className="ballot-section__display-name">
              { this.props.ballot_item_display_name }
            </h2>
            <StarAction
              we_vote_id={ this.props.we_vote_id }
              type={ this.props.kind_of_ballot_item } />
            <CandidateList children={this.props.candidate_list}
                           contest_office_name={this.props.ballot_item_display_name}/>
          </span>
        }

      </div>;
  }
}
