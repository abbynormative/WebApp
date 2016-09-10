import React, { Component, PropTypes } from "react";
import { Modal } from "react-bootstrap";
import CandidateStore from "../../stores/CandidateStore";
import FollowToggle from "../../components/Widgets/FollowToggle";
import ItemActionBar from "../../components/Widgets/ItemActionBar";
import ItemPositionStatementActionBar from "../../components/Widgets/ItemPositionStatementActionBar";
import LoadingWheel from "../../components/LoadingWheel";
import OrganizationCard from "../../components/VoterGuide/OrganizationCard";
import OrganizationPositionItem from "../../components/VoterGuide/OrganizationPositionItem";
import OrganizationStore from "../../stores/OrganizationStore";
import SupportActions from "../../actions/SupportActions";
import SupportStore from "../../stores/SupportStore";
import VoterStore from "../../stores/VoterStore";

export default class EditPositionAboutCandidateModal extends Component {
  static propTypes = {
    params: PropTypes.object,
    organization: PropTypes.object.isRequired,
    position: PropTypes.object.isRequired
  };

  constructor (props) {
    super(props);
    this.state = {candidate: {}};
  }

  componentDidMount () {
    this._onVoterStoreChange();

    this.organizationStoreListener = OrganizationStore.addListener(this._onOrganizationStoreChange.bind(this));
    this.voterStoreListener = VoterStore.addListener(this._onVoterStoreChange.bind(this));

    this.candidateStoreListener = CandidateStore.addListener(this._onCandidateStoreChange.bind(this));
    this.supportStoreListener = SupportStore.addListener(this._onSupportStoreChange.bind(this));

    // let { ballot_item_we_vote_id } = this.props.position;
    // var candidate = CandidateStore.get(ballot_item_we_vote_id) || null;
    // console.log("EditPositionAboutCandidateModal: componentDidMount, ballot_item_we_vote_id: ", ballot_item_we_vote_id, ", candidate: ", candidate);
    // if (candidate === null) {
    //   CandidateActions.retrieve(ballot_item_we_vote_id);
    // } else {
    //   this._onCandidateStoreChange()
    // }

    // this.props.position.ballot_item_we_vote_id is the candidate
    let ballot_item_we_vote_id = this.props.position.ballot_item_we_vote_id;
    let supportProps = SupportStore.get(ballot_item_we_vote_id);

    this.setState({supportProps: supportProps});

    // if supportProps is missing support_count or oppose_count, force a retrieve
    if (supportProps !== undefined) {
      if (supportProps.support_count === undefined || supportProps.oppose_count === undefined) {
        SupportActions.retrievePositionsCountsForOneBallotItem(ballot_item_we_vote_id);
      }
    }
  }

  componentWillUnmount () {
    this.candidateStoreListener.remove();
    this.organizationStoreListener.remove();
    this.voterStoreListener.remove();
    this.supportStoreListener.remove();
  }

  _onVoterStoreChange () {
    this.setState({voter: VoterStore.getVoter()});
  }

  _onOrganizationStoreChange () {
    // let {owner_we_vote_id} = this.props.position;
    // console.log("Entering _onOrganizationStoreChange, owner_we_vote_id: " + owner_we_vote_id);
    // this.setState({
    //   organization: OrganizationStore.get(owner_we_vote_id),
    // });
  }

  _onCandidateStoreChange () {
    // let { ballot_item_we_vote_id } = this.props.position;
    // var candidate = CandidateStore.get(ballot_item_we_vote_id) || {};
    // console.log("_onCandidateStoreChange, ballot_item_we_vote_id: ", ballot_item_we_vote_id, ", candidate: ", candidate);
    // this.setState({
    //   candidate: candidate,
    // });
    //
  }

  _onSupportStoreChange () {
    var ballot_item_we_vote_id = this.props.position.ballot_item_we_vote_id;
    this.setState({ supportProps: SupportStore.get(ballot_item_we_vote_id) });
  }

  render () {
    // This is the position we are editing
    var position = this.props.position;
    // The owner of this position
    var organization = this.props.organization;
    var ballot_item_we_vote_id = this.props.position.ballot_item_we_vote_id;
    var ballot_item_display_name = this.props.position.ballot_item_display_name;

    const { supportProps, voter } = this.state;
    var signed_in_twitter = voter === undefined ? false : voter.signed_in_twitter;
    // var signed_in_with_this_twitter_account = false;
    if (signed_in_twitter) {
      // console.log("In render, voter: ", voter);
      // console.log("this.props.params.twitter_handle: " + this.props.params.twitter_handle);
      // signed_in_with_this_twitter_account = voter.twitter_screen_name.toLowerCase() === this.props.params.twitter_handle.toLowerCase();
    }

    let modal_contents;
    if (position === undefined) {
      // Show a loading wheel while this component's data is loading
      return LoadingWheel;
    // } else if (position.kind_of_ballot_item === "CANDIDATE") {
    //   console.log("this.state.kind_of_owner === CANDIDATE");
    //   this.props.params.we_vote_id = this.state.owner_we_vote_id;
    //   modal_contents = <span>
    //     <section className="candidate-card__container">
    //       <CandidateItem {...candidate} office_name={office.ballot_item_display_name}/>
    //     </section>
    //   </span>;
    } else if (organization !== undefined) {
      modal_contents = <span>
          <div className="card__container">
            <div className="card__main">
              <FollowToggle we_vote_id={organization.organization_we_vote_id}/>
              <OrganizationCard organization={organization} turn_off_description/>
            </div>
            <ul className="list-group">
              <OrganizationPositionItem position={position}
                                        organization={this.props.organization}
                                        link_to_edit_modal_off
                                        stance_display_off
                                        comment_text_off
                                        placement="bottom"/>
            </ul>
          </div>
          <div className="candidate-card__media-object-content">
            <div className="candidate-card__actions">
              <ItemActionBar ballot_item_we_vote_id={ballot_item_we_vote_id}
                             supportProps={supportProps} type="CANDIDATE" />
              <ItemPositionStatementActionBar ballot_item_we_vote_id={ballot_item_we_vote_id}
                                              ballot_item_display_name={ballot_item_display_name}
                                              supportProps={supportProps}
                                              type="CANDIDATE" />
            </div>
          </div>
        </span>;
    }
    return <Modal {...this.props} bsSize="large" aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg"></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        { modal_contents }
      </Modal.Body>
    </Modal>;
  }
}
