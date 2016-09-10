import React, { Component, PropTypes } from "react";
import CandidateActions from "../../actions/CandidateActions";
import CandidateItem from "../../components/Ballot/CandidateItem";
import CandidateStore from "../../stores/CandidateStore";
import GuideList from "../../components/VoterGuide/GuideList";
import GuideStore from "../../stores/GuideStore";
import GuideActions from "../../actions/GuideActions";
import LoadingWheel from "../../components/LoadingWheel";
import PositionList from "../../components/Ballot/PositionList";
import SupportActions from "../../actions/SupportActions";
import ThisIsMeAction from "../../components/Widgets/ThisIsMeAction";
import VoterStore from "../../stores/VoterStore";
import { exitSearch } from "../../utils/search-functions";

export default class Candidate extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired
  };

  constructor (props) {
    super(props);
    this.state = {
      candidate: {},
      candidate_we_vote_id: this.props.params.candidate_we_vote_id,
      guideToFollowList: GuideStore.toFollowListForBallotItem()

    };
  }

  componentDidMount (){
    this.candidateStoreListener = CandidateStore.addListener(this._onCandidateStoreChange.bind(this));
    var { candidate_we_vote_id } = this.state;
    CandidateActions.retrieve(candidate_we_vote_id);


    // Get the latest guides to follow for this candidate
    this.guideStoreListener = GuideStore.addListener(this._onGuideStoreChange.bind(this));
    GuideActions.retrieveGuidesToFollowByBallotItem(candidate_we_vote_id, "CANDIDATE");

    // Make sure supportProps exist for this Candidate when browser comes straight to candidate page
    SupportActions.retrievePositionsCountsForOneBallotItem(candidate_we_vote_id);

    // Display the candidate's name in the search box
    var { candidate } = this.state;
    var searchBoxText = candidate.ballot_item_display_name || "";  // TODO DALE Not working right now
    exitSearch(searchBoxText);
  }

  componentWillReceiveProps (nextProps) {
    // When a new candidate is passed in, update this component to show the new data
    this.setState({candidate_we_vote_id: nextProps.params.candidate_we_vote_id});

    CandidateActions.retrieve(nextProps.params.candidate_we_vote_id);

    GuideActions.retrieveGuidesToFollowByBallotItem(nextProps.params.candidate_we_vote_id, "CANDIDATE");

    // Display the candidate's name in the search box
    // var { candidate } = this.state;
    // var searchBoxText = candidate.ballot_item_display_name || "";  // TODO DALE Not working right now
    exitSearch("");
  }

  componentWillUnmount () {
    this.candidateStoreListener.remove();
    this.guideStoreListener.remove();
  }

  _onCandidateStoreChange (){
    let { candidate_we_vote_id } = this.state;
    let candidate = CandidateStore.get(candidate_we_vote_id) || {};
    this.setState({ candidate: candidate });
  }

  _onGuideStoreChange (){
    let { candidate_we_vote_id } = this.state;
    this.setState({ guideToFollowList: GuideStore.toFollowListForBallotItem() });
    // When the guideToFollowList changes, trigger an update of the candidate so we can get an updated position_list
    CandidateActions.retrieve(this.state.candidate_we_vote_id);
    // Also update the position count for *just* this candidate, since it might not come back with positionsCountForAllBallotItems
    SupportActions.retrievePositionsCountsForOneBallotItem(candidate_we_vote_id);
  }

  render () {
    const electionId = VoterStore.election_id();
    const NO_VOTER_GUIDES_TEXT = "We could not find any more voter guides to follow about this candidate or measure.";
    var { candidate, guideToFollowList, candidate_we_vote_id } = this.state;

    if (!candidate.ballot_item_display_name){
      // TODO DALE If the candidate we_vote_id is not valid, we need to update this with a notice
      return <div className="container-fluid well u-gutter__top--small fluff-full1">
                <div>{LoadingWheel}</div>
                <br />
            </div>;
    }

    return <span>
        <section className="candidate-card__container">
          <CandidateItem {...candidate} contest_office_name={candidate.contest_office_name} />
          <div className="candidate-card__additional">
            { candidate.position_list ?
              <div>
                <PositionList position_list={candidate.position_list}
                              ballot_item_display_name={candidate.ballot_item_display_name} />
              </div> :
              null
            }
            {guideToFollowList.length === 0 ?
              <p className="candidate-card__no-additional">{NO_VOTER_GUIDES_TEXT}</p> :
              <div><h3 className="candidate-card__additional-heading">{"More opinions about " + candidate.ballot_item_display_name}</h3>
              <GuideList id={electionId} ballotItemWeVoteId={candidate_we_vote_id} organizationsToFollow={guideToFollowList}/></div>
            }
          </div>
        </section>
        <br />
        <ThisIsMeAction twitter_handle_being_viewed={candidate.twitter_handle}
                      name_being_viewed={candidate.ballot_item_display_name}
                      kind_of_owner="POLITICIAN" />
        <br />
      </span>;

  }
}
