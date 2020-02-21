import React from 'react';
import MakeCall from '../utilities/make-call';
import Editor from './editor';
import store from '../utilities/store';

export default class GlobalEditors extends React.Component {

  constructor(props) {
    super(props);
    
    this._loadFrontend = this._loadFrontend.bind(this);
    this._saveFrontend = this._saveFrontend.bind(this);
    this._tabs = this._tabs.bind(this);
    this._handleCode = this._handleCode.bind(this);

		this.state = {
      tabs: 0,
      frontend: {
        head: {
          top: "",
          bottom: ""
        },
        body: {
          top: "",
          bottom: "",
        },
        css: "",
        js: ""
      }
		}
  }

  componentDidMount() {
    this._loadFrontend();
  }

  _loadFrontend() {
    MakeCall.api("general/loadFrontend/", {
      method: 'GET'
    }).then((response) => {
      if (response.success) {
        let frontend = response.frontend;
        this.setState({frontend});
      }
    });
  }

  _saveFrontend() {
    MakeCall.api("general/saveFrontend/", {
      method: 'POST',
      body: MakeCall.prepdata({
        json: JSON.stringify(this.state.frontend)
      })
    }).then((response) => {
      if (response.success) {
        store.dispatch({
          type: "NEW_ALERT",
          alert: {
            title: "Saved!",
            message: "Global front-end has been saved.",
            type: "success"
          }
        });
        store.dispatch({
          type: "UPDATE_FRONTEND",
        });
      }
    });
  }
  
  _tabs(index) {
		this.setState({tabs:index});
  }
  
  _handleCode(editor, value, headOrBody = false) {
		// Temp state object
    let temp_state_obj = {};
    // Set value to key
    if (headOrBody) {
      let sub_obj = {};
      sub_obj[editor] = value;
      temp_state_obj[headOrBody] = Object.assign({}, this.state.frontend[headOrBody], sub_obj)
    } else {
      temp_state_obj[editor] = value
    }
		// Update state
		let frontend = Object.assign({}, this.state.frontend, temp_state_obj);
		this.setState({frontend});
	}

  render() {
    return (
      <div className="ui-global-editors">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button className={"nav-link" + (this.state.tabs == 0 ? " active" : "")} onClick={() => this._tabs(0)}>Head</button>
          </li>
          <li className="nav-item">
            <button className={"nav-link" + (this.state.tabs == 1 ? " active" : "")} onClick={() => this._tabs(1)}>Body</button>
          </li>
          <li className="nav-item">
            <button className={"nav-link" + (this.state.tabs == 2 ? " active" : "")} onClick={() => this._tabs(2)}>SCSS</button>
          </li>
          <li className="nav-item">
            <button className={"nav-link" + (this.state.tabs == 3 ? " active" : "")} onClick={() => this._tabs(3)}>JS</button>
          </li>
        </ul>
        <div className="ui-global-editor">
          <div className="ui-global-editor__tabs">
            {/* Tab One */}
            <div className={"ui-global-editor__tab" + (this.state.tabs == 0 ? " ui-global-editor__tab--active" : "")}>
              <div className="row ui-card__nav">
                <div className="col-12 ui-global-editor__tools">
                  <div className="ui-global-editor__tools__text">Head Top</div>
                  <button className="btn ui-btn" onClick={() => this._saveFrontend()}>Save</button>
                </div>
              </div>
              <div className="row">
                <div className="col-12 ui-global-editor__editor">
                  <Editor id="ComponentCSSEditor" mode="html" width="100%" height="100%" code={this.state.frontend.head.top} component={{fields:[]}} componentSlug={""} onChange={(code) => this._handleCode('top', code, 'head')}/>
                </div>
                <div className="col-12 ui-global-editor__editor">
                  <div className="ui-global-editor__midbar">Head Bottom</div>
                  <Editor id="ComponentCSSEditor" mode="html" width="100%" height="100%" code={this.state.frontend.head.bottom} component={{fields:[]}} componentSlug={""} onChange={(code) => this._handleCode('bottom', code, 'head')}/>
                </div>
              </div>
            </div>
            {/* Tab Two */}
            <div className={"ui-global-editor__tab" + (this.state.tabs == 1 ? " ui-global-editor__tab--active" : "")}>
              <div className="row ui-card__nav">
                <div className="col-12 ui-global-editor__tools">
                  <div className="ui-global-editor__tools__text">Body Top</div>
                  <button className="btn ui-btn" onClick={() => this._saveFrontend()}>Save</button>
                </div>
              </div>
              <div className="row">
                <div className="col-12 ui-global-editor__editor">
                  <Editor id="ComponentCSSEditor" mode="html" width="100%" height="100%" code={this.state.frontend.body.top} component={{fields:[]}} componentSlug={""} onChange={(code) => this._handleCode('top', code, 'body')}/>
                </div>
                <div className="col-12 ui-global-editor__editor">
                  <div className="ui-global-editor__midbar">Body Bottom</div>
                  <Editor id="ComponentCSSEditor" mode="html" width="100%" height="100%" code={this.state.frontend.body.bottom} component={{fields:[]}} componentSlug={""} onChange={(code) => this._handleCode('bottom', code, 'body')}/>
                </div>
              </div>
            </div>
            {/* Tab Three */}
            <div className={"ui-global-editor__tab" + (this.state.tabs == 2 ? " ui-global-editor__tab--active" : "")}>
              <div className="row ui-card__nav">
                <div className="col-12 ui-global-editor__tools">
                  <div className="ui-global-editor__tools__text"></div>
                  <button className="btn ui-btn" onClick={() => this._saveFrontend()}>Save</button>
                </div>
              </div>
              <div className="row">
                <div className="col-12 ui-global-editor__editor">
                  <Editor id="ComponentCSSEditor" mode="scss" width="100%" height="100%" code={this.state.frontend.css} component={{fields:[]}} componentSlug={""} onChange={(code) => this._handleCode('css', code)}/>
                </div>
              </div>
            </div>
            {/* Tab Four */}
            <div className={"ui-global-editor__tab" + (this.state.tabs == 3 ? " ui-global-editor__tab--active" : "")}>
              <div className="row ui-card__nav">
                <div className="col-12 ui-global-editor__tools">
                  <div className="ui-global-editor__tools__text"></div>
                  <button className="btn ui-btn" onClick={() => this._saveFrontend()}>Save</button>
                </div>
              </div>
              <div className="row">
                <div className="col-12 ui-global-editor__editor">
                  <Editor id="ComponentJSEditor" mode="javascript" width="100%" height="100%" code={this.state.frontend.js} component={{fields:[]}} componentSlug={""} onChange={(code) => this._handleCode('js', code)}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

