import React from 'react';
import Menu from '../components/menu';
import generalFunctions from './general-functions';
import makeCall from './make-call';
import store from './store';

const AlertBox = ({title, message, type, index}) => {

  const remove = function() {
    store.dispatch({
      type: "REMOVE_ALERT",
      index
    });
  }

  return <div className={"alert alert-dismissible "+type} role="alert">
    <strong>{title}</strong> {message}
    <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => remove()}>
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
}

export default class Wrapper extends React.Component {

  constructor(props) {
    super(props);

    this.app_state = store.getState();

    this.within_nav = false;

    this.checkForNav = this.checkForNav.bind(this);
    this.checkDevPath = this.checkDevPath.bind(this);
    this._refreshPreview = this._refreshPreview.bind(this);

    this.props.history.listen((location, action) => {
      let adminView = "";
      if (location.pathname.match(/\/ex\//g) != null) {
        adminView = "stash-editor";
      }
      if (location.pathname.match(/\/pt\//g) != null) {
        adminView = "posttype-editor";
      }
      if (location.pathname.match(/\/developer\/fieldtypes/g) != null) {
        adminView = "developer-fieldtypes";
      }
      if (location.pathname.match(/\/developer\/components/g) != null) {
        adminView = "developer-components";
      }
      if (location.pathname.match(/\/developer\/templates/g) != null) {
        adminView = "developer-templates";
      }
      if (location.pathname.match(/\/developer\/posttypes/g) != null) {
        adminView = "developer-posttypes";
      }
      if (location.pathname.match(/\/developer\/stashes/g) != null) {
        adminView = "developer-stashes";
      }
      store.dispatch({
        type: "SET_ADMIN_VIEW",
        adminView
      });
      store.dispatch({
        type: "CLOSE_MENU_DROPDOWNS"
      });
      store.dispatch({
        type: "CLOSE_MENU"
      });
    });
    
    this.state = {
      devMode: this.checkDevPath(this.props.location.pathname),
      alerts: [],
      preview: this.app_state.global.preview
    }
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.app_state = store.getState();
      if (this.app_state.global.lastAction === "NEW_ALERT" || this.app_state.global.lastAction === "REMOVE_ALERT") {
        this.setState({
          alerts: this.app_state.global.alerts
        });
      }
      if (this.app_state.global.lastAction === "TOGGLE_PREVIEW") {
        this.setState({
          preview: this.app_state.global.preview
        });
      }
      if (this.app_state.global.lastAction === "REFRESH_PREVIEW") {
        this._refreshPreview();
      }
    });

    // Check if in development
    if (generalFunctions.inDevelopment()) {
      // Create a fake user account when in development
      // In production, this will not work as the PHP session would prevent reaching the JS
      store.dispatch({
        type: "SET_USER",
        user: {
          datetime: "",
          email: "test@test.com",
          encryptedPassword: "",
          firstname: "Dev",
          lastname: "Mode",
          role: "administrator",
          username: "developer"
        }
      });
    } else {
      // In production, user data is retrieved via usertoken/php/session
      makeCall.api("users/current/", {
        method: 'GET'
      }).then((response) => {
        if (response.success) {
          store.dispatch({
            type: "SET_USER",
            user: response.user
          });
        }
      });
    }
	}

	componentWillUnmount() {
    this.unsubscribe();
	}

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location.pathname != this.props.location.pathname) {
      let devMode = this.checkDevPath(this.props.location.pathname);
      if (this.state.devMode != devMode) {
        this.setState({devMode});
      }
    }
  }

  // This function works similar to $.closest( selector )
  checkForNav(target) {
    if (!target.classList.contains("ui-nav-id")) {
      console.log("not on nav");
      this.within_nav = false;
    } else {
      console.log("on nav");
      this.within_nav = true;
    }

    if (!this.within_nav) {
      store.dispatch({
        type: "CLOSE_MENU"
      });
      store.dispatch({
        type: "CLOSE_MENU_DROPDOWNS"
      });
    }
  }

  checkDevPath(path) {
    if(path.indexOf("developer") > -1) {
      return true;
    } else {
      return false;
    }
  }

  _refreshPreview() {
    if (this.app_state.global.preview.refreshing) {
      store.dispatch({
        type: "REFRESH_PREVIEW_COMPLETE"
      });
      let iframe = document.getElementById('PreviewFrame');
      let src = iframe.src.split("?");
      iframe.src = src[0] + '?timestamp=' + Date.now();
    }
  }

  render() {

    if (this.state.devMode) {
      document.body.classList.add("ui-dev-mode");
    } else {
      document.body.classList.remove("ui-dev-mode");
    }

    let iframe_url = window.location.protocol + "//" + (window.location.hostname == "localhost" ? "jdms-dev.local" : window.location.hostname);

    let reverse_array = [];
    this.state.alerts.map((alert,i) => {
      reverse_array.push(<AlertBox key={i} title={alert.title} message={alert.message} type={alert.type} index={i} />);
    });
    let alerts = reverse_array.reverse().map((alert,i) => {
      return alert;
    });

    let content = <div>
      <div className="ui-nav">
        <div className="ui-nav__bar-wrapper">
          <Menu basename={this.props.basename}/>
        </div>
      </div>
      {this.props.children}
      <div id="Modal" className="ui-modal"></div>
      <div id="Alert" className="ui-alert">
        {(this.state.alerts.length ? alerts : null)}
      </div>
    </div>

    if (this.state.preview.active) {
      content = <div className="ui-preview-wrapper">
        <div className="ui-preview-wrapper__view">
          {content}
        </div>
        <div className="ui-preview-wrapper__view">
          <iframe id="PreviewFrame" src={iframe_url + "/cp/preview-room"}></iframe>
        </div>
      </div>
    }

    return content;
  }
}