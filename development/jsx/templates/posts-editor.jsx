import React from 'react';
import {InputTagsContainer} from 'react-input-tags';
import MakeCall from '../utilities/make-call';
import UILayoutBuilder from '../components/ui-layout-builder';
import UISlider from '../components/ui-slider';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import generalFunctions from '../utilities/general-functions';

const MySwal = withReactContent(Swal);

export default class PostsEditor extends React.Component {

	constructor(props) {
		super(props);

    this._setFocus = this._setFocus.bind(this);
    this._handlePostMeta = this._handlePostMeta.bind(this);
    this._handleSliders = this._handleSliders.bind(this);
    this._handleContent = this._handleContent.bind(this);
    this._saveType = this._saveType.bind(this);
    this._handleSave = this._handleSave.bind(this);
    
		this.state = {
      mode: "new",
      posttype: null,
      silent_save: null,
      in_saving: false,
      save_loop: false,
      post: {
        title: "",
        slug: "",
        index: true,
        follow: true,
        tags: [],
        description: "",
        publish: false,
        dyComp: false,
        json: null
      }
		}
	}
	
	componentDidMount() {
    this.unsubscribe = this.props.store.subscribe(() => {
      this.app_state = this.props.store.getState();
      if (this.app_state.global.lastAction === "FRONTEND_DATA_RETRIEVED") {
        if (this.state.mode == "edit") {
          this._saveType(true);
        } else {
          this._handleSave();
        }
      }
      if (this.app_state.global.lastAction === "CANCEL_FRONTEND_SAVELOOP") {
        this.setState({
          silent_save: null
        });
      }
		});

    MakeCall.api("posttypes/load/", {
      method: 'POST',
      body: MakeCall.prepdata({
        slug: this.props.match.params.posttype
      })
    }).then((posttypes_response) => {
      if (posttypes_response.success) {
        MakeCall.api("templates/load/", {
          method: 'POST',
          body: MakeCall.prepdata({
            slug: posttypes_response.posttype.template.slug
          })
        }).then((templates_response) => {
          if (templates_response.success) {
            let posttype = Object.assign({}, posttypes_response.posttype, {
              template: templates_response.template
            });
            this.setState({
              posttype
            })
          }
        });
      }
    });

    if (this.props.match.params.hasOwnProperty("slug") && this.props.match.params.slug != undefined) {
      MakeCall.api("posts/load/", {
        method: 'POST',
        body: MakeCall.prepdata({
          posttype: this.props.match.params.posttype,
          slug: this.props.match.params.slug
        })
      }).then((response) => {
        if (response.success) {
          this.setState({
            mode: "edit",
            post: response.data
          })
        }
      });
    }
    
    this.input = document.getElementsByClassName("react-input-tags-input");
  }

  componentWillUnmount() {
		this.unsubscribe();
  }
  
  _setFocus() {
    this.input[0].focus();
  }
  
  _handlePostMeta(value, type) {
    let post;

    switch(type) {
      case "title":
        post = Object.assign({}, this.state.post, {
          title: value,
          slug: value.split(" ").join("-").toLowerCase()
        });
      break;
      case "slug":
        post = Object.assign({}, this.state.post, {
          slug: value.split(" ").join("-").toLowerCase()
        });
      break;
      case "tags":
        post = Object.assign({}, this.state.post, {
          tags: value
        });
      break;
      case "description":
        post = Object.assign({}, this.state.post, {
          description: value
        });
      break;
    }
    
		this.setState({post});
  }

  _handleSliders(key, value) {
    let temp_state = {};
    temp_state[key] = value;

    let post = Object.assign({}, this.state.post, temp_state);

    this.setState({post});
  }

  _handleContent(json) {
    let post = Object.assign({}, this.state.post, {
			json
    });
    
		this.setState({post});
  }

  _saveType(is_silent = false) {
    if (this.state.silent_save == null) {
      this.setState({
        silent_save: is_silent,
        in_saving: false
      }, () => {
        this._handleSave();
      });
    } else {
      this._handleSave();
    }
  }
  
  _handleSave() {
    if (!this.state.post.dyComp && !this.state.save_loop) {
      this.setState({
        save_loop: true
      }, () => {
        this.props.store.dispatch({
          type: "GET_FRONTEND_DATA_BEFORE_SAVE"
        });
      });
    } else if (!this.state.in_saving) {
      this.setState({
        in_saving: true
      }, () => {
        MakeCall.api("posts/save/", {
          method: 'POST',
          body: MakeCall.prepdata({
            posttype: this.props.match.params.posttype,
            json: JSON.stringify(this.state.post)
          })
        }).then((response) => {
          if (response.success) {
            if (!this.state.silent_save) {
              this.props.store.dispatch({
                type: "NEW_ALERT",
                alert: {
                  title: "Saved!",
                  message: generalFunctions.dashesToSpacesAndCaps(this.state.post.slug) + " has been saved.",
                  type: "success"
                }
              });
            }
            this.setState({
              silent_save: null,
              in_saving: false,
              save_loop: false
            }, () => {
              this.props.history.push(this.props.basename + '/pt/'+ this.props.match.params.posttype +'/edit/'+this.state.post.slug);
            });
          } else {
            MySwal.fire({
              title: "Error",
              text: response.message,
              showCloseButton: true
            })
          }
        });
      });
    }
	}

  render() {
    let content = "";
    
    if (this.state.posttype != null) {
      content = <div className="container">
        <h2>{this.state.posttype.title}</h2>
        <div className="row">
          <div className="col-12">
            <div className="ui-card ui-card-post-header">
              <div className="row ui-card__nav">
                <div className="col-12">
                  <UISlider label="Index" value={this.state.post.index} onChange={(value) => {this._handleSliders('index', value)}}/>
                  <UISlider label="Follow" value={this.state.post.follow} onChange={(value) => {this._handleSliders('follow', value)}}/>
                  <UISlider label="Dynamic Components" value={this.state.post.dyComp} onChange={(value) => {this._handleSliders('dyComp', value)}}/>
                  <UISlider label="Publish" value={this.state.post.publish} onChange={(value) => {this._handleSliders('publish', value)}}/>
                  {(this.state.mode == "edit" ? <a className="btn ui-btn" target="_blank" href={"/"+this.props.match.params.posttype+"/"+this.state.post.slug}>Preview</a> : null)}
                  <button className="btn ui-btn" onClick={() => this._saveType(false)}>{(this.state.mode == "edit" ? "Update" : "Save")}</button>
                </div>
              </div>
							<div className="row">
								<div className="col-12 col-sm-6">
									<label>Name</label>
									<input type="text" className="form-control" placeholder={this.state.posttype.title+" Title"} value={this.state.post.title} onChange={(e) => this._handlePostMeta(e.target.value, "title")}/>
								</div>
								<div className="col-12 col-sm-6">
									<label>Slug</label>
									<input type="text" className="form-control" placeholder={this.state.posttype.slug+"-slug"} value={this.state.post.slug} onChange={(e) => this._handlePostMeta(e.target.value, "slue")}/>
								</div>
							</div>
              <div className="row">
								<div className="col-12 col-sm-6" onClick={() => this._setFocus()}>
									<label>Meta Tags</label>
                  <InputTagsContainer id="InputMetaTags" tags={this.state.post.tags} handleUpdateTags={(value) => this._handlePostMeta(value, "tags")}/>
								</div>
								<div className="col-12 col-sm-6">
									<label>Meta Description</label>
									<textarea className="form-control" placeholder="Add a post description." value={this.state.post.description} onChange={(e) => this._handlePostMeta(e.target.value, "description")}/>
								</div>
							</div>
						</div>
            <UILayoutBuilder json={this.state.post.json} dyComp={this.state.post.dyComp} components={this.state.posttype.template.components} handleContent={this._handleContent}/>
          </div>
        </div>
      </div>
    }
      
    return content;
	}
}