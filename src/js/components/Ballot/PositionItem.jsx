import React, { Component, PropTypes } from "react";
import { Link } from "react-router";
import ImageHandler from "../../components/ImageHandler";
import EditPositionAboutCandidateModal from "../../components/VoterGuide/EditPositionAboutCandidateModal";
import FriendsOnlyIndicator from "../../components/Widgets/FriendsOnlyIndicator";
import PositionRatingSnippet from "../../components/Widgets/PositionRatingSnippet";
import PositionInformationOnlySnippet from "../../components/Widgets/PositionInformationOnlySnippet";
import PositionSupportOpposeSnippet from "../../components/Widgets/PositionSupportOpposeSnippet";
const moment = require("moment");

export default class PositionItem extends Component {
  static propTypes = {
    ballot_item_display_name: PropTypes.string.isRequired,
    organization: PropTypes.object,  //.isRequired,
    position: PropTypes.object.isRequired
  };

  constructor (props) {
    super(props);
    this.state = { showEditPositionModal: false };
  }

  closeEditPositionModal () {
    this.setState({ showEditPositionModal: false });
  }

  openEditPositionModal () {
    this.setState({ showEditPositionModal: true });
  }

  render () {
    var position = this.props.position;
    var dateStr = position.last_updated;
    var dateText = moment(dateStr).startOf("day").fromNow();
    // TwitterHandle-based link
    var speakerLink = position.speaker_twitter_handle ? "/" + position.speaker_twitter_handle : "/voterguide/" + position.speaker_we_vote_id;

    let image_placeholder = "";
    if (position.speaker_type === "O") {
        image_placeholder = <i className="icon-org-lg icon-icon-org-placeholder-6-2 icon-org-resting-color position-item__avatar" />;
    } else if (position.speaker_type === "V") {
        image_placeholder = <i className="icon-org-lg icon-icon-person-placeholder-6-1 icon-org-resting-color position-item__avatar" />;
    }

    let position_description = "";
    const is_on_ballot_item_page = true;
    if (position.vote_smart_rating) {
        position_description =
          <PositionRatingSnippet {...position} />;
    } else if (position.is_support || position.is_oppose) {
      position_description = <PositionSupportOpposeSnippet {...position} is_on_ballot_item_page={is_on_ballot_item_page} />;
    } else if (position.is_information_only) {
      position_description = <PositionInformationOnlySnippet {...position} is_on_ballot_item_page={is_on_ballot_item_page} />;
    } else if (position.speaker_type === "V") {
        position_description = <p className="">
          <span>{this.props.ballot_item_display_name}</span>
          <span className="small"> { dateText }</span>
          </p>;
    }

    var show_position = true;
    // For now, do not show the voter's position. We will show a voter's position when can have comments.
    if (position.speaker_type === "V")
        show_position = false;

    var nothing_to_display = null;

    var edit_mode = false;  // TODO DALE Convert this to be dynamically set
    const onEditPositionClick = this.state.showEditPositionModal ? this.closeEditPositionModal.bind(this) : this.openEditPositionModal.bind(this);
    // Only allow editing if the position we are passing in has a we_vote_id
    // TODO DALE I need to think through passing in organization below
    const edit_position_description = edit_mode && position !== undefined ?
      <span>
        <span className="edit-position-action"
              onClick={onEditPositionClick}
              title="Edit this position">
          { position_description }
        </span>
        <EditPositionAboutCandidateModal show={this.state.showEditPositionModal}
                                         onHide={this.closeEditPositionModal.bind(this)}
                                         position={position}
                                         organization={this.props.organization}/>
      </span> :
      null;

    var one_position_on_this_candidate = <li className="position-item">
      {/* One Position on this Candidate */}
        <Link to={speakerLink}>
          { position.speaker_image_url_https ?
            <ImageHandler className="img-square position-item__avatar"
                  imageUrl={position.speaker_image_url_https}
            /> :
          image_placeholder }
        </Link>
        <div className="position-item__content">
          <h4 className="position-item__display-name">
            <Link to={speakerLink}>
              { position.speaker_display_name }
            </Link>
          </h4>
          { edit_mode ?
            edit_position_description :
            position_description }
          <FriendsOnlyIndicator isFriendsOnly={!position.is_public_position} />
        </div>
        {/* Likes coming in a later version
        <br />
        23 Likes<br />
        */}
      </li>;

      if (show_position) {
          return one_position_on_this_candidate;
      } else {
          return nothing_to_display;
      }
  }
}
