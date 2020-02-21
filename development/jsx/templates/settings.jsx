import React from 'react';
import Uploader from '../utilities/uploader';
import makeCall from '../utilities/make-call';
import generalFunctions from '../utilities/general-functions';
import store from '../utilities/store';
import UILayoutComponent from '../components/ui-layout-component';
import Modal from '../utilities/modal';
import FileManager from '../components/file-manager';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default class Settings extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = this.props.store.getState();

		this._getGlobals = this._getGlobals.bind(this);
		this._getPosts = this._getPosts.bind(this);
		this._getComponents = this._getComponents.bind(this);
		this._showDialog = this._showDialog.bind(this);
		this._onChange = this._onChange.bind(this);
		this._uploadImageCallBack = this._uploadImageCallBack.bind(this);
		this._processHeaderFooterData = this._processHeaderFooterData.bind(this);
		this._removedIgnoredData = this._removedIgnoredData.bind(this);
		this._handleComponentFrontEnd = this._handleComponentFrontEnd.bind(this);
		this._saveGlobals = this._saveGlobals.bind(this);

		this.state = {
			posts: [],
			components: null,
			globals: {
				meta: {
					title: "",
					image: "",
					description: "",
					type: "",
					year: ""
				},
				header: {
					slug: "",
					comp: null,
					data: null,
					ignoredData: null
				},
				footer: {
					slug: "",
					comp: null,
					data: null,
					ignoredData: null
				},
				general: {
					homePage: "",
					posttypeListCount: 0
				}
			}
		}
	}

	componentDidMount() {
		this.unsubscribe = store.subscribe(() => {
      this.app_state = store.getState();
      if (this.app_state.global.lastAction === "UPDATE_POSTTYPES") {
        this._getPosts();
      }
		});

		this._getGlobals();
		this._getPosts();
		this._getComponents();
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	_getGlobals() {
		makeCall.api("general/loadGlobals/", {
			method: 'GET'
		}).then((globals_response) => {
			if (globals_response.success) {
				this.setState({
					globals: globals_response.globals
				})
			}
		});
	}

	_getPosts() {
		// Get listed post types within app state
		this.app_state = store.getState();
		// Loop through all post types to load all their post
		this.app_state.global.postTypes.map((posttype) => {
			makeCall.api("posts/list/", {
				method: 'POST',
				body: makeCall.prepdata({
					posttype: posttype.slug
				})
			}).then((response) => {
				if (response.success) {
					let posts = Array.from(this.state.posts);
					response.list.map((post) => {
						let title = generalFunctions.dashesToSpacesAndCaps(posttype.slug) + " - " + generalFunctions.dashesToSpacesAndCaps(post.slug);
						posts.push({
							title,
							path: "/" + posttype.slug + "/" + post.slug
						});
					});
					this.setState({posts});
				}
			});
		});
	}

	_getComponents() {
		makeCall.api("components/list/").then((response) => {
			if (response.success) {
				let list = generalFunctions.objectInArraySort(response.list);
				let components = {};
				list.map((component) => {
					components[component.slug] = component.data;
				})
				this.setState({components});
			}
		});
	}

	_showDialog(sectionKey, itemKey) {
    Modal.show(<div className="ui-file-manager--lightbox">
      <div className="ui-file-manager">
        <button className="ui-file-manager--lightbox-button" onClick={() => Modal.remove()}><i className="icon ion-md-close"></i></button>
        <FileManager rootDir="" returnInsert={(item) => {
          this._onChange(sectionKey, itemKey, item.url);
          Modal.remove();
        }}/>
      </div>
    </div>)
  }
	
	_onChange(sectionKey, itemKey, value) {
		let globals = Object.assign({}, this.state.globals);
		
		if ((sectionKey == "header" || sectionKey == "footer") && itemKey == "slug") {
			let component = this.state.components[value];
			globals[sectionKey][itemKey] = value;
			globals[sectionKey].comp = component;
			globals[sectionKey].data = null;
		} else {
			globals[sectionKey][itemKey] = value;
		}
		
		this.setState({globals});
  }

  _uploadImageCallBack(dir, file) {
    return Uploader(dir, file);
	}
	
	_processHeaderFooterData(comp_data) {
		let select_type = {};
		
		select_type[comp_data.select] = Object.assign({}, this.state.globals[comp_data.select], {
			data: comp_data.data,
			ignoredData: comp_data.ignored_data
		});

		let globals = Object.assign({}, this.state.globals, select_type);

		this.setState({globals});
	}
	
	_removedIgnoredData(comp_data) {
    if (this.state.globals[comp_data.select].ignoredData[comp_data.field_name] != undefined && comp_data.field_name) {

			let ignoredData = Object.assign({}, this.state.globals[comp_data.select].ignoredData);

			delete ignoredData[comp_data.field_name];

			let select_type = {};

			select_type[comp_data.select] = Object.assign({}, this.state.globals[comp_data.select], ignoredData);

			let globals = Object.assign({}, this.state.globals, select_type);

			this.setState({globals});
		}			
	}
	
	_handleComponentFrontEnd(comp_data) {
		let select_type = {}; // Header or Footer object

		let frontendIndex = comp_data.component_frontend.frontendIndex;
		delete comp_data.component_frontend.frontendIndex;

		// Clone Header or Footer with the updated component info
		select_type[comp_data.select] = Object.assign({}, this.state.globals[comp_data.select], {
			comp: Object.assign({}, this.state.globals[comp_data.select].comp, {
				frontend: comp_data.component_frontend,
				frontendIndex
			})
		});

		// Set Globals object with updated data
		let globals = Object.assign({}, this.state.globals, select_type);

		// Set state
		this.setState({globals});
	}
	
	_saveGlobals() {
		makeCall.api("general/saveGlobals/", {
			method: 'POST',
			body: makeCall.prepdata({
				json: JSON.stringify(this.state.globals)
			})
		}).then((response) => {
			if (response.success) {
				store.dispatch({
					type: "NEW_ALERT",
					alert: {
						title: "Saved!",
						message: "Global settings have been saved.",
						type: "success"
					}
				});
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

		return (this.app_state.global.user != null && (this.app_state.global.user.role == "administrator" || this.app_state.global.user.role == "manager") ?
		<div className="container">
			<h2>Settings</h2>
			<p className="lead">General settings for your site.</p>
			<div className="row">
				<div className="col-12">
					<div className="ui-card">
						<div className="row ui-card__nav">
							<div className="col-12">
								<button className="btn ui-btn" onClick={() => this._saveGlobals()}>Update</button>
							</div>
						</div>
						<div className="ui-card__title">
							<h3>General</h3>
						</div>
						<div className="row">
							<div className="col-12 col-sm-6">
								<div className="form-group">
									<label htmlFor="HomePage">Default Home Page</label>
									<select id="HomePage" className="form-control" value={this.state.globals.general.homePage} onChange={(e) => this._onChange("general","homePage",e.target.value)}>
										<option value="">Select Post</option>
										{(this.state.posts.length ?
											this.state.posts.map((post,i) => {
												return <option key={i} value={post.path}>{post.title}</option>
											})
										: null)}
									</select>
								</div>
							</div>
							<div className="col-12 col-sm-6">
								<div className="form-group">
									<label htmlFor="ListCount">Post Type List Count</label>
									<input id="ListCount" type="number" className="form-control" value={this.state.globals.general.posttypeListCount} onChange={(e) => this._onChange("general","posttypeListCount",e.target.value)}/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="row">
				<div className="col-12">
					<div className="ui-card">
						<div className="ui-card__title">
							<h3>Default Meta</h3>
						</div>
						<div className="row">
							<div className="col-12 col-sm-6">
								<div className="row">
									<div className="col-12">
										<div className="form-group">
											<label htmlFor="SiteTitle">Site Title</label>
											<input id="SiteTitle" type="text" className="form-control" value={this.state.globals.meta.title} onChange={(e) => this._onChange("meta","title",e.target.value)}/>
										</div>
									</div>
									<div className="col-12">
										<div className="form-group">
											<label htmlFor="SiteImage">Site Image</label>
											<div className="ui-file-input" onClick={() => this._showDialog("meta","image")}>
												<div className="btn ui-btn">Select File</div>
												<input id="SiteImage" type="text" className="form-control" value={this.state.globals.meta.image} onChange={(imageURL) => this._onChange("meta","image",imageURL)} disabled/>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="col-12 col-sm-6">
								<div className="form-group">
									<label htmlFor="SiteDescription">Site Description</label>
									<textarea id="SiteDescription" className="form-control" rows="4" value={this.state.globals.meta.description} onChange={(e) => this._onChange("meta","description",e.target.value)}/>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="col-12 col-sm-6">
								<div className="form-group">
									<label htmlFor="SiteTitle">Site Type</label>
									<input id="SiteTitle" type="text" className="form-control" value={this.state.globals.meta.type} onChange={(e) => this._onChange("meta","type",e.target.value)}/>
								</div>
							</div>
							<div className="col-12 col-sm-6">
								<div className="form-group">
									<label htmlFor="SiteTitle">Copy Right Year</label>
									<input id="SiteTitle" type="text" className="form-control" value={this.state.globals.meta.year} onChange={(e) => this._onChange("meta","year",e.target.value)}/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="row">
				<div className="col-12">
					<div className="ui-card">
						<div className="ui-card__title">
							<h3>Header & Footer</h3>
						</div>
						<div className="row">
							<div className="col-12">
								<div className="form-group">
									<label htmlFor="HeaderComponent">Header Component</label>
									<select id="HeaderComponent" className="form-control" value={this.state.globals.header.slug} onChange={(e) => this._onChange("header","slug",e.target.value)}>
										<option value="">Select Component</option>
										{(this.state.components != null ?
											Object.keys(this.state.components).map((key,i) => {
												let component = this.state.components[key];
												return <option key={i} value={component.slug}>{component.title}</option>
											})
										: null)}
									</select>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="col-12">
								{(this.state.globals.header.comp != null ?
									<div className="ui-card__cut-out">
										{/*
										A lot of passed params are not needed in updating the global values,
										so we pass all info into an object with additional select data of Header or Footer
										*/}
										<UILayoutComponent index={0} data={this.state.globals.header.data} 
											component={this.state.globals.header.comp} 
											ignoredComponent={this.state.globals.header.ignoredData} 
											removeIgnoredComponent={(slug, index, field_name) => this._removedIgnoredData({select:"header", slug, index, field_name})} 
											sendBackComponentData={(slug, index, data, ignored_data) => this._processHeaderFooterData({select:"header", slug, index, data, ignored_data})} 
											sendBackComponentFrontEnd={(component_slug, component_index, component_frontend) => this._handleComponentFrontEnd({select:"header", component_slug, component_index, component_frontend})} 
											frontendIndex={this.state.globals.header.comp.frontendIndex} isFieldtype={false}
										/>
									</div>
								: null)}
							</div>
						</div>
						<div className="row">
							<div className="col-12">
								<div className="form-group">
									<label htmlFor="FooterComponent">Footer Component</label>
									<select id="FooterComponent" className="form-control" value={this.state.globals.footer.slug} onChange={(e) => this._onChange("footer","slug",e.target.value)}>
										<option value="">Select Component</option>
										{(this.state.components != null ?
											Object.keys(this.state.components).map((key,i) => {
												let component = this.state.components[key];
												return <option key={i} value={component.slug}>{component.title}</option>
											})
										: null)}
									</select>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="col-12">
								{(this.state.globals.footer.comp != null ?
									<div className="ui-card__cut-out">
										<UILayoutComponent index={0} data={this.state.globals.footer.data} 
											component={this.state.globals.footer.comp} 
											ignoredComponent={this.state.globals.footer.ignoredData} 
											removeIgnoredComponent={(slug, index, field_name) => this._removedIgnoredData({select:"footer", slug, index, field_name})} 
											sendBackComponentData={(slug, index, data, ignored_data) => this._processHeaderFooterData({select:"footer", slug, index, data, ignored_data})} 
											sendBackComponentFrontEnd={(component_slug, component_index, component_frontend) => this._handleComponentFrontEnd({select:"footer", component_slug, component_index, component_frontend})} 
											frontendIndex={this.state.globals.footer.comp.frontendIndex} isFieldtype={false}
										/>
									</div>
								: null)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		: null)
	}
}