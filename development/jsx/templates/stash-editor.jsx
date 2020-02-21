import React from 'react';
import MakeCall from '../utilities/make-call';
import UILayoutBuilder from '../components/ui-layout-builder';
import store from '../utilities/store';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import generalFunctions from '../utilities/general-functions';

const MySwal = withReactContent(Swal);

export default class StashEditor extends React.Component {

	constructor(props) {
    super(props);
    
    this._processLoad = this._processLoad.bind(this);
    this._handleContent = this._handleContent.bind(this);
    this._handleSave = this._handleSave.bind(this);
    
		this.state = {
      stash: null,
      stashData: {
        title: "",
        slug: "",
        json: null
      }
		}
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.match.params.hasOwnProperty("stashSlug") && prevProps.match.params.stashSlug != this.props.match.params.stashSlug) {
      this._processLoad();
    }
  }
	
	componentDidMount() {
    this._processLoad();
  }

  _processLoad() {
    if (this.props.match.params.hasOwnProperty("stashSlug") && this.props.match.params.stashSlug != undefined) {
      // Get stash slug and create title from it
      let stash_slug = generalFunctions.spacesToUnderscores(generalFunctions.dashesToSpacesAndCaps(this.props.match.params.stashSlug));
      let title = generalFunctions.underscoresToSpacesAndCaps(stash_slug);
      // Set state with with title and slug data in case no data exist yet
      this.setState({
        stashData: Object.assign({}, this.state.stashData, {
          title,
          slug: stash_slug
        })
      }, () => {
        // Now make calls to retrieve stash structure and template data
        MakeCall.api("stashes/load/", {
          method: 'POST',
          body: MakeCall.prepdata({
            stash: stash_slug
          })
        }).then((stashes_response) => {
          if (stashes_response.success) {
            MakeCall.api("templates/load/", {
              method: 'POST',
              body: MakeCall.prepdata({
                slug: stashes_response.stash.template.slug
              })
            }).then((templates_response) => {
              if (templates_response.success) {
                let stash = Object.assign({}, stashes_response.stash, {
                  template: templates_response.template
                });
                this.setState({
                  stash
                })
              }
            });
          }
        });
        // Get stash data if it exist
        MakeCall.api("stashes/loaddata/", {
          method: 'POST',
          body: MakeCall.prepdata({
            stash: stash_slug
          })
        }).then((response) => {
          if (response.success) {
            let json = response.data.json;
            if (json.frontend != undefined) {
              delete json.frontend;
            }
            let stashData = Object.assign({}, response.data, {json});
            this.setState({stashData})
          }
        });
      });
    }
  }

  _handleContent(json) {
    if (json.frontend != undefined) {
      delete json.frontend;
    }
    let stashData = Object.assign({}, this.state.stashData, {json});
		this.setState({stashData});
  }
  
  _handleSave() {
    MakeCall.api("stashes/savedata/", {
      method: 'POST',
      body: MakeCall.prepdata({
        data: JSON.stringify(this.state.stashData)
      })
    }).then((response) => {
      if (response.success) {
        store.dispatch({
          type: "NEW_ALERT",
          alert: {
            title: "Saved!",
            message: generalFunctions.underscoresToSpacesAndCaps(this.state.stashData.slug) + " has been saved.",
            type: "success"
          }
        });
        this.props.history.push(this.props.basename + '/stash/'+this.state.stashData.slug);
      } else {
        MySwal.fire({
          title: "Error",
          text: response.message,
          showCloseButton: true
        })
      }
    });
	}

  render() {
    let content = "";
    
    if (this.state.stash != null) {
      content = <div className="container">
        <h2>{this.state.stash.title}</h2>
        <div className="row">
          <div className="col-12">
            <div className="ui-card ui-card-post-header ui-card-post-header--transparent">
              <div className="row ui-card__nav">
                <div className="col-12">
                  <button className="btn ui-btn" onClick={() => this._handleSave()}>Save</button>
                </div>
              </div>
						</div>
            <UILayoutBuilder json={this.state.stashData.json} dyComp={false} components={this.state.stash.template.components} handleContent={this._handleContent}/>
          </div>
        </div>
      </div>
    }
      
    return content;
	}
}