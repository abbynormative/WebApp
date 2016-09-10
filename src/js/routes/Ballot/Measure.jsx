import React, { Component, PropTypes } from "react";
import GuideList from "../../components/VoterGuide/GuideList";
import GuideStore from "../../stores/GuideStore";
import GuideActions from "../../actions/GuideActions";
import LoadingWheel from "../../components/LoadingWheel";
import MeasureItem from "../../components/Ballot/MeasureItem";
import MeasureActions from "../../actions/MeasureActions";
import MeasureStore from "../../stores/MeasureStore";
import PositionList from "../../components/Ballot/PositionList";
import SupportActions from "../../actions/SupportActions";
import VoterStore from "../../stores/VoterStore";
import { exitSearch } from "../../utils/search-functions";


export default class Measure extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired
  };

  constructor (props) {
    super(props);
    this.state = {
      measure: {},
      measure_we_vote_id: this.props.params.measure_we_vote_id,
      guideToFollowList: GuideStore.toFollowListForBallotItem()
    };
  }

  componentDidMount (){
    this.measureStoreListener = MeasureStore.addListener(this._onMeasureStoreChange.bind(this));
    var { measure_we_vote_id } = this.props.params;

    MeasureActions.retrieve(measure_we_vote_id);

    this.guideStoreListener = GuideStore.addListener(this._onGuideStoreChange.bind(this));
    GuideActions.retrieveGuidesToFollowByBallotItem(measure_we_vote_id, "MEASURE");

    // Make sure supportProps exist for this Measure when browser comes straight to measure page
    SupportActions.retrievePositionsCountsForOneBallotItem(measure_we_vote_id);

    exitSearch("");
  }

  componentWillReceiveProps (nextProps) {
    // When a new candidate is passed in, update this component to show the new data
    this.setState({measure_we_vote_id: nextProps.params.measure_we_vote_id});

    MeasureActions.retrieve(nextProps.params.measure_we_vote_id);

    GuideActions.retrieveGuidesToFollowByBallotItem(nextProps.params.measure_we_vote_id, "MEASURE");

    // Display the measure's name in the search box
    // var { measure } = this.state;
    // var searchBoxText = measure.ballot_item_display_name || "";  // TODO DALE Not working right now
    exitSearch("");
  }

  componentWillUnmount () {
    this.measureStoreListener.remove();
    this.guideStoreListener.remove();
  }

  _onGuideStoreChange (){
    this.setState({ guideToFollowList: GuideStore.toFollowListForBallotItem() });
    MeasureActions.retrieve(this.state.measure_we_vote_id);
  }

  _onMeasureStoreChange (){
    var measure = MeasureStore.get(this.state.measure_we_vote_id) || {};
    this.setState({ measure: measure });
  }

  render () {
    const electionId = VoterStore.election_id();
    const NO_VOTER_GUIDES_TEXT = "We could not find any more voter guides to follow about this measure.";
    var { measure, guideToFollowList } = this.state;

    if (!measure.ballot_item_display_name){
      // TODO DALE If the candidate measure_we_vote_id is not valid, we need to update this with a notice
      return <div className="container-fluid well u-gutter__top--small fluff-full1">
                <div>{LoadingWheel}</div>
                <br />
            </div>;
    }

    return <section className="card__container">
          <MeasureItem {...measure} />
          <div className="card__additional">
            { measure.position_list ?
              <div>
                <PositionList position_list={measure.position_list}
                              ballot_item_display_name={measure.ballot_item_display_name} />
              </div> :
              null
            }
            {guideToFollowList.length === 0 ?
              <p className="card__no-additional">{NO_VOTER_GUIDES_TEXT}</p> :
              <div><h3 className="card__additional-heading">{"More opinions about " + measure.ballot_item_display_name}</h3>
              <GuideList id={electionId} ballotItemWeVoteId={this.state.measure_we_vote_id} organizationsToFollow={guideToFollowList}/></div>
            }
          </div>
        </section>;

  }
}
