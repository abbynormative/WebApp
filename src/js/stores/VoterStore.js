import Dispatcher from "../dispatcher/Dispatcher";
import FluxMapStore from "flux/lib/FluxMapStore";
import VoterActions from "../actions/VoterActions";
import FacebookActions from "../actions/FacebookActions";
import FacebookStore from "../stores/FacebookStore";
const cookies = require("../utils/cookies");

class VoterStore extends FluxMapStore {

  getInitialState () {
    return {
      voter: {},
      address: {}
    };
  }

  getVoter (){
    return this.getState().voter;
  }

  election_id (){
    return this.getState().address.google_civic_election_id;
  }

  getAddress (){
    return this.getState().address.text_for_map_search || "";
  }

  getTwitterHandle (){
    return this.getState().voter.twitter_handle || "";
  }

  getFacebookPhoto (){
    return this.getState().voter.facebook_profile_image_url_https;
  }

  getFullName (){
    return this.getState().voter.full_name;
  }

  // Could be either Facebook photo or Twitter photo
  getVoterPhotoUrl (){
    return this.getState().voter.voter_photo_url;
  }

  voterDeviceId () {
    return this.getState().voter.voter_device_id || cookies.getItem("voter_device_id");
  }

  setVoterDeviceIdCookie (id){
    cookies.setItem("voter_device_id", id, Infinity, "/");
  }

  reduce (state, action) {

    switch (action.type) {
      case "organizationSave":
        // If an organization saves, we want to check to see if it is tied to this voter. If so,
        // refresh the voter data so we have the value linked_organization_we_vote_id in the voter object.
        if (action.res.success) {
          if (action.res.facebook_id === state.voter.facebook_id) {
            VoterActions.voterRetrieve();
          } else {
            let organization_twitter_handle = action.res.organization_twitter_handle !== undefined ? action.res.organization_twitter_handle : "";
            let twitter_screen_name = state.voter.twitter_screen_name !== undefined ? state.voter.twitter_screen_name : "";
            if (organization_twitter_handle && organization_twitter_handle.toLowerCase() === twitter_screen_name.toLowerCase()) {
              VoterActions.voterRetrieve();
            }
          }
        }
        return state;

      case "positionListForVoter":
        if (action.res.show_only_this_election) {
          var position_list_for_one_election = action.res.position_list;
          return {
            ...state,
            voter: {
              ...state.voter,
              position_list_for_one_election: position_list_for_one_election
            }
          };
        } else if (action.res.show_all_other_elections) {
          var position_list_for_all_except_one_election = action.res.position_list;
          return {
            ...state,
            voter: {
              ...state.voter,
              position_list_for_all_except_one_election: position_list_for_all_except_one_election
            }
          };
        } else {
          var position_list = action.res.position_list;
          return {
            ...state,
            voter: {
              ...state.voter,
              position_list: position_list
            }
          };
        }
        return {
          ...state
        };

      case "voterRetrieve":
        let voter_device_id = action.res.voter_device_id;
        this.setVoterDeviceIdCookie(voter_device_id);
        VoterActions.retrieveAddress(voter_device_id);
        const url = action.res.facebook_profile_image_url_https;
        if (action.res.signed_in_facebook && (url === null || url === "")){
          const userId = FacebookStore.userId;
          FacebookActions.getFacebookProfilePicture(userId);
        }

        return {
          ...state,
          voter: action.res
      };

      case "voterAddressRetrieve":
        return {
          ...state,
          address: action.res
      };

      case "voterAddressSave":
        return {
          ...state,
          address: { text_for_map_search: action.res.text_for_map_search,
                    google_civic_election_id: action.res.google_civic_election_id }
        };

      case "voterPhotoSave":
        return {
          ...state,
          voter: {...state.voter, facebook_profile_image_url_https: action.res.facebook_profile_image_url_https}
        };

      case "voterUpdate":
        const {first_name, last_name, email} = action.res;
        return {
          ...state,
          voter: {...state.voter,
            first_name: first_name ? first_name : state.voter.first_name,
            last_name: last_name ? last_name : state.voter.last_name,
            facebook_email: email ? email : state.voter.email,
          }
        };

      case "error-voterRetrieve" || "error-voterAddressRetrieve" || "error-voterAddressSave":
        console.log(action);
        return state;

      default:
        return state;
    }
  }
}

module.exports = new VoterStore(Dispatcher);
