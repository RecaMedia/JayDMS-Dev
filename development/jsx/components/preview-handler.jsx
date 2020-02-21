import React from 'react';
import MakeCall from '../utilities/make-call';
import store from '../utilities/store';

export default class Preview extends React.Component { 

  constructor(props) {
    super(props);

    this._loadFrontend = this._loadFrontend.bind(this);
    this._toggle = this._toggle.bind(this);    

    this.app_state = store.getState();
    this.state = Object.assign({}, this.app_state.global.preview, {
      frontend: null,
    });
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.app_state = store.getState();
      if (this.app_state.global.lastAction === "UPDATE_FRONTEND") {
        this._loadFrontend();
      }
      if (this.app_state.global.lastAction === "TOGGLE_PREVIEW") {
        let state = Object.assign({}, this.app_state.global.preview);
        this.setState(state);
      }
      if (this.app_state.global.preview.active && this.app_state.global.lastAction === "UPDATE_PREVIEW") {
        if (this.state.frontend == null) {
          this._loadFrontend(true);
        } else {
          this._getProcessedHTML();
        }
      }
    });

    this._loadFrontend();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  _loadFrontend(pass_through = false) {
    MakeCall.api("general/loadFrontend/", {
      method: 'GET'
    }).then((response) => {
      if (response.success) {
        let frontend = response.frontend;
        this.setState({frontend}, () => {
          if (pass_through) {
            this._getProcessedHTML();
          }
        });
      }
    });
  }

  _getProcessedHTML() {
    let component_package = {
      frontend: this.state.frontend,
      json: this.app_state.global.preview.json,
      menu: this.app_state.global.preview.menu
    }
    MakeCall.api("general/buildPreview/", {
      method: 'POST',
      body: MakeCall.prepdata({
        componentPackage: JSON.stringify(component_package)
      })
    }).then((response) => {
      if (response.success) {
        store.dispatch({
          type: "REFRESH_PREVIEW"
        });
      }
    });
  }

  _toggle() {
    let active = (this.state.active ? false : true);

    store.dispatch({
      type: "TOGGLE_PREVIEW",
      active: (this.state.active ? false : true)
    });

    if (!active) {
      MakeCall.api("general/removePreview/", {
        method: 'GET'
      })
    }
  }

  render() {
    return (
      <button className={"btn ui-btn" + (this.state.active ? " ui-btn--preview-on" : "")} onClick={() => this._toggle()}>Preview</button>
    )
  }
}