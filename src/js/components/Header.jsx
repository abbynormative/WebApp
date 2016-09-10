import React, { Component, PropTypes } from "react";
import { Link } from "react-router";
import NavigatorInHeader from "./Navigation/NavigatorInHeader";
import FacebookActions from "../actions/FacebookActions";
import SearchAllBox from "./SearchAllBox";
var Icon = require("react-svg-icons");
const ReactBurgerMenu = require("react-burger-menu").push;

var menuStyles = {
  bmMenu: {
    height: "100vh"
  }
};

export default class Header extends Component {
  static propTypes = {
    voter: PropTypes.object,
    pathname: PropTypes.string
  };

  constructor (props) {
    super(props);
    this.state = {};
  }

  componentDidMount () {}

  componentWillUnmount () {}

  hide () {
    const menuButton = document.querySelector(".bm-burger-button > button");
    menuButton.click();
  }

  render () {
    var { pathname } = this.props;
    var { signed_in_facebook, signed_in_personal, signed_in_twitter, twitter_screen_name, voter_photo_url } = this.props.voter;
    const logOut = FacebookActions.appLogout;

    let image_placeholder = "";
    let speaker_type = "V";  // TODO DALE make this dynamic
    if (speaker_type === "O") {
        image_placeholder = <span className="position-statement__avatar"><Icon name="avatar-generic" width={34} height={34} /></span>;
    } else {
        image_placeholder = <span className="position-statement__avatar"><Icon name="avatar-generic" width={34} height={34} /></span>;
    }

    return <header className="page-header">
      {/* The components/MoreMenu code has to be reproduced here for mobile */}
      <ReactBurgerMenu pageWrapId={ "" } outerContainerId={ "app" } styles={ menuStyles }>
        <div className="device-menu--mobile">
          <ul className="nav nav-stacked">
            <li>
              <div><span className="we-vote-promise">We Vote's Promise: We will never sell your email.</span></div>
            </li>
          </ul>
          <h4 className="text-left"></h4>
          <ul className="nav nav-stacked">
            { signed_in_twitter && twitter_screen_name ?
              <li>
                <Link onClick={this.hide.bind(this)} to={"/" + twitter_screen_name}>
                  <div>
                    { voter_photo_url ?
                      <img className="position-statement__avatar"
                            src={voter_photo_url}
                            width="34px"
                      /> :
                      image_placeholder }
                    <span className="header-slide-out-menu-text-left">Your Page</span>
                  </div>
                </Link>
              </li> :
              null
            }
            { !signed_in_twitter && !signed_in_facebook ?
              <li>
                <Link onClick={this.hide.bind(this)} to="/settings/claim">
                  <div>
                    <span className="header-slide-out-menu-text-left">Claim Your Page</span>
                  </div>
                </Link>
              </li> :
              null
            }
            <li>
              <Link onClick={this.hide.bind(this)} to="/settings/location">
                <div>
                  <span className="header-slide-out-menu-text-left">Your Address &amp; Ballot</span>
                </div>
              </Link>
            </li>
           <li>
              <Link onClick={this.hide.bind(this)} to="/opinions">
                <div>
                  <span className="header-slide-out-menu-text-left">Who You Can Follow</span>
                </div>
              </Link>
            </li>
            { signed_in_personal ?
              <li>
                <Link onClick={this.hide.bind(this)} to="/more/sign_in">
                  <div onClick={logOut}>
                    <span className="header-slide-out-menu-text-left">Sign Out</span>
                  </div>
                </Link>
              </li> :
              <li>
                <Link onClick={this.hide.bind(this)} to="/more/sign_in">
                  <div>
                    <span className="header-slide-out-menu-text-left">Sign In</span>
                  </div>
                </Link>
              </li> }
          </ul>
          <h4 className="text-left"></h4>
          <ul className="nav nav-stacked">
            <li>
              <Link onClick={this.hide.bind(this)} to="/more/about">
                <div>
                  <span className="header-slide-out-menu-text-left">About <strong>We Vote</strong></span>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </ReactBurgerMenu>
      <div className="page-header__content">
        <Link to="/ballot" className="page-logo h4">
          We Vote
          <span className="page-logo__version"> demo</span>
        </Link>
        <SearchAllBox />
        <NavigatorInHeader pathname={pathname} />
      </div>
    </header>;
  }
}
