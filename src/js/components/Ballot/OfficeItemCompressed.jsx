import React, { Component, PropTypes } from "react";
import { Link, browserHistory } from "react-router";
import StarAction from "../../components/Widgets/StarAction";
import SupportStore from "../../stores/SupportStore";
import { capitalizeString } from "../../utils/textFormat";

export default class OfficeItemCompressed extends Component {
  static propTypes = {
    key: PropTypes.string,
    we_vote_id: PropTypes.string.isRequired,
    kind_of_ballot_item: PropTypes.string.isRequired,
    ballot_item_display_name: PropTypes.string.isRequired,
    link_to_ballot_item_page: PropTypes.bool,
    candidate_list: PropTypes.array
  };
  constructor (props) {
    super(props);
    this.state = {transitioning: false};
  }

  render () {
    let { ballot_item_display_name, we_vote_id } = this.props;
    let officeLink = "/office/" + we_vote_id;
    let goToOfficeLink = function () { browserHistory.push(officeLink); };

    ballot_item_display_name = capitalizeString(ballot_item_display_name);

    return <div className="card__container">
      <div className="card__main office-card">
        <div className="card__content">
            <h2 className="card__display-name">
              { this.props.link_to_ballot_item_page ?
                <Link to={officeLink}>{ballot_item_display_name}</Link> :
                  ballot_item_display_name
              }
            </h2>
            <StarAction we_vote_id={we_vote_id} type="OFFICE"/>

            <div className={ this.props.link_to_ballot_item_page ?
                    "cursor-pointer" : null }
                  onClick={ this.props.link_to_ballot_item_page ?
                    goToOfficeLink : null }>
              { this.props.candidate_list.map( (one_candidate) =>
                <span key={one_candidate.we_vote_id}>{one_candidate.ballot_item_display_name}. </span>)
              }
            </div>
            </div> {/* END .card__content */}
          </div> {/* END .card__main office-card */}
        </div>;
      }
    }
