import React, { Component, PropTypes } from "react";
import { Link } from "react-router";
import ImageHandler from "../../components/ImageHandler";
import FriendsOnlyIndicator from "../../components/Widgets/FriendsOnlyIndicator";
import VoterStore from "../../stores/VoterStore";
import OfficeNameText from "../../components/Widgets/OfficeNameText";
import PositionInformationOnlySnippet from "../../components/Widgets/PositionInformationOnlySnippet";
import PositionRatingSnippet from "../../components/Widgets/PositionRatingSnippet";
import PositionPublicToggle from "../../components/Widgets/PositionPublicToggle";
import PositionSupportOpposeSnippet from "../../components/Widgets/PositionSupportOpposeSnippet";
import StarAction from "../../components/Widgets/StarAction";
import SupportStore from "../../stores/SupportStore";
import { capitalizeString } from "../../utils/textFormat";

export default class OrganizationPositionItem extends Component {
  static propTypes = {
    organization: PropTypes.object.isRequired,
    position: PropTypes.object.isRequired,
    link_to_edit_modal_off: PropTypes.bool,
    stance_display_off: PropTypes.bool,
    comment_text_off: PropTypes.bool,
    popover_off: PropTypes.bool,
    placement: PropTypes.string
  };

  constructor (props) {
    super(props);
    this.state = {};
  }

  componentWillMount () {
    this.setState({
      showEditPositionModal: false,
      supportProps: SupportStore.get(this.props.position.ballot_item_we_vote_id),
      transitioning: false
    });
  }

  componentDidMount () {
    this.supportStoreListener = SupportStore.addListener(this._onSupportStoreChange.bind(this));
    this._onVoterStoreChange();
    this.voterStoreListener = VoterStore.addListener(this._onVoterStoreChange.bind(this));
  }

  componentWillUnmount () {
    this.supportStoreListener.remove();
    this.voterStoreListener.remove();
  }

  _onSupportStoreChange () {
    let position = this.props.position;
    this.setState({
      supportProps: SupportStore.get(position.ballot_item_we_vote_id),
      transitioning: false
    });
  }

  _onVoterStoreChange () {
    this.setState({ voter: VoterStore.getVoter() });
  }

  closeEditPositionModal () {
    this.setState({ showEditPositionModal: false });
  }

  openEditPositionModal () {
    this.setState({ showEditPositionModal: true });
  }

  render (){
    var position = this.props.position;
    let organization = this.props.organization;

    let { stance_display_off, comment_text_off, popover_off, placement } = this.props;
    const { supportProps } = this.state;

    // Manage the control over this organization voter guide
    let organization_twitter_handle_being_viewed = "";
    let organization_facebook_id_being_viewed = 0;
    if (organization !== undefined) {
      organization_twitter_handle_being_viewed = organization.organization_twitter_handle !== undefined ? organization.organization_twitter_handle : "";
      organization_facebook_id_being_viewed = organization.facebook_id !== undefined ? organization.facebook_id : 0;
    }
    var {voter} = this.state;
    var signed_in_twitter = voter === undefined ? false : voter.signed_in_twitter;
    var signed_in_with_this_twitter_account = false;
    if (signed_in_twitter) {
      signed_in_with_this_twitter_account = voter.twitter_screen_name.toLowerCase() === organization_twitter_handle_being_viewed.toLowerCase();
    }
    var signed_in_facebook = voter === undefined ? false : voter.signed_in_facebook;
    var signed_in_with_this_facebook_account = false;
    if (signed_in_facebook) {
      signed_in_with_this_facebook_account = voter.facebook_id === organization_facebook_id_being_viewed;
    }

    var statement_text;
    var is_public_position;
    var is_support;
    var is_oppose;
    // If looking at your own page, update when supportProps change
    if (signed_in_with_this_twitter_account) {
      // console.log("OrganizationPositionItem signed_in_with_this_twitter_account");
      // When component first loads, use the value in the incoming position. If there are any supportProps updates, use those.
      statement_text = supportProps && supportProps.voter_statement_text ? supportProps.voter_statement_text : position.statement_text;
      is_public_position = supportProps && supportProps.is_public_position ? supportProps.is_public_position : position.is_public_position;
      is_support = supportProps && supportProps.is_support ? supportProps.is_support : position.is_support;
      is_oppose = supportProps && supportProps.is_oppose ? supportProps.is_oppose : position.is_oppose;
    } else {
      // console.log("OrganizationPositionItem NOT signed_in_with_this_twitter_account");
      statement_text = position.statement_text;
      is_public_position = position.is_public_position;
      is_support = position.is_support;
      is_oppose = position.is_oppose;
    }

    // TwitterHandle-based link
    let ballot_item_url = position.kind_of_ballot_item === "MEASURE" ? "/measure/" : "/candidate/";
    let ballotItemLink = position.ballot_item_twitter_handle ? "/" + position.ballot_item_twitter_handle : ballot_item_url + position.ballot_item_we_vote_id;
    let position_description = "";
    let is_candidate = position.kind_of_ballot_item === "CANDIDATE";
    let ballot_item_display_name = "";
    if (position.ballot_item_display_name) {
      ballot_item_display_name = capitalizeString(position.ballot_item_display_name);
    }

    const is_on_ballot_item_page = false;
    if (position.vote_smart_rating) {
      position_description = <PositionRatingSnippet {...position}
                                                     popover_off={popover_off}
                                                     placement={placement} />;
    } else if (is_support || is_oppose) {
      // We overwrite the "statement_text" passed in with position
      position_description = <PositionSupportOpposeSnippet {...position}
                                                           statement_text={statement_text}
                                                           is_support={is_support}
                                                           is_oppose={is_oppose}
                                                           is_on_ballot_item_page={is_on_ballot_item_page}
                                                           stance_display_off={stance_display_off}
                                                           comment_text_off={comment_text_off} />;
    } else {
      position_description = <PositionInformationOnlySnippet {...position}
                                                             is_on_ballot_item_page={is_on_ballot_item_page}
                                                             stance_display_off={stance_display_off}
                                                             comment_text_off={comment_text_off} />;
    }

    const onEditPositionClick = this.state.showEditPositionModal ? this.closeEditPositionModal.bind(this) : this.openEditPositionModal.bind(this);
    var contest_office_name;
    var political_party;
    if (position.kind_of_ballot_item === "CANDIDATE") {
      contest_office_name = position.contest_office_name;
      political_party = position.ballot_item_political_party;
    }
    return <li className="position-item">
      <StarAction we_vote_id={position.ballot_item_we_vote_id} type={position.kind_of_ballot_item} />
        <Link to={ ballotItemLink }
              onlyActiveOnIndex={false}>
          {/*<i className="icon-icon-add-friends-2-1 icon-light icon-medium" />*/}
          { is_candidate ?
            <ImageHandler
              className="position-item__avatar"
              imageUrl={position.ballot_item_image_url_https}
              alt="candidate-photo"
              kind_of_ballot_item={position.kind_of_ballot_item}/> :
            null
          }
        </Link>
        <div className="position-item__content">
          <Link to={ ballotItemLink }
                onlyActiveOnIndex={false}>
            <span className="position-rating__candidate-name">{ballot_item_display_name}</span>
          </Link>
          <br />
            { position.kind_of_ballot_item === "CANDIDATE" && contest_office_name !== undefined ?
            <OfficeNameText political_party={political_party} contest_office_name={contest_office_name} /> :
              null
            }
          {/* show explicit position, if available, otherwise show rating */}
          { this.props.link_to_edit_modal_off ?
            position_description :
            <span>
              <span className="edit-position-action"
                    onClick={onEditPositionClick}
                    title="Edit this position">
                { position_description }
              </span>
              {/* GET WORKING WITH MEASURES <EditPositionAboutCandidateModal show={this.state.showEditPositionModal}
                                               onHide={this.closeEditPositionModal.bind(this)}
                                               position={position}
                                               organization={organization}/>*/}
            </span> }
            { signed_in_with_this_twitter_account || signed_in_with_this_facebook_account ?
              <PositionPublicToggle ballot_item_we_vote_id={position.ballot_item_we_vote_id}
                type={position.kind_of_ballot_item}
                supportProps={supportProps}
                className="organization-position-item-toggle"/> :
                <FriendsOnlyIndicator isFriendsOnly={!is_public_position}/>
              }
        </div>
      </ li>;
  }
}
