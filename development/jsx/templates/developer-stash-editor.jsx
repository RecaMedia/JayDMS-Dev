import React from 'react';
import MakeCall from '../utilities/make-call';
import GeneralFunctions from '../utilities/general-functions';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default class DevStashEditor extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = this.props.store.getState();

		this.processJSON = this.processJSON.bind(this);
		this.jsonFactory = this.jsonFactory.bind(this);
		this.handleStashTitle = this.handleStashTitle.bind(this);
		this.handleStashSlug = this.handleStashSlug.bind(this);
		this._handleTemplate = this._handleTemplate.bind(this);
		this.handleSave = this.handleSave.bind(this);

		this.mode = "";
		if (this.props.match.params.hasOwnProperty("mode") && this.props.match.params.mode != undefined) {
			this.mode = GeneralFunctions.capitalize(this.props.match.params.mode);
		}
		
		this.state = {
			title: "My New Post Type",
			slug: "my-new-post-type",
			json: {},
      template: null,
      templates: []
		}
	}

	componentDidMount() {
		this.unsubscribe = this.props.store.subscribe(() => {
			this.app_state = this.props.store.getState();
		});

		if (this.props.match.params.hasOwnProperty("stashSlug") && this.props.match.params.stashSlug != undefined) {
			let stash_slug = this.props.match.params.stashSlug;
			MakeCall.api("stashes/load/", {
				method: 'POST',
				body: MakeCall.prepdata({
					stash: stash_slug
				})
			}).then((response) => {
				if (response.success) {
					this.setState({
						title: response.stash.title,
						slug: stash_slug,
						template: response.stash.template
					}, () => {
						this.jsonFactory()
					})
				}
			});
		} else {
			this.jsonFactory()
		}

		this.getTemplates();
	}

	componentDidUpdate() {
		this.unsubscribe = this.props.store.subscribe(() => {
			this.app_state = this.props.store.getState();
			this.forceUpdate();
		});
		
		this.mode = "";
		if (this.props.match.params.hasOwnProperty("mode") && this.props.match.params.mode != undefined) {
			this.mode = GeneralFunctions.capitalize(this.props.match.params.mode);
		}
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	getTemplates() {
    MakeCall.api("templates/list/").then((response) => {
      if (response.success) {
        let templates = GeneralFunctions.objectInArraySort(response.list);
        this.setState({
          templates
        })
      }
    });
	}

	processJSON(template) {

		let json = {
			title: this.state.title,
			slug: this.state.slug,
			template
		}

		return json;
	}

	jsonFactory() {
		let json = this.processJSON(this.state.template);
		this.setState({
			json
		});
	}

	handleStashTitle(e) {
		let value = e.target.value;
		let title = value;
		let slug = value.split(" ").join("_").toLowerCase();
		this.setState({
			title,
			slug
		}, () => this.jsonFactory());
	}

	handleStashSlug(e) {
		let value = e.target.value;
		let slug = value.split(" ").join("_").toLowerCase();
		this.setState({
			slug
		}, () => this.jsonFactory());
	}

	_handleTemplate(e) {
    let slug = e.target.value;
    let template_obj = null;
    this.state.templates.map((template) => {
      if (template.slug === slug) {
        template_obj = {
					path: template.path,
					slug: template.slug
				}
      }
    });
		let json = this.processJSON(template_obj);
		this.setState({
			json,
			template: template_obj
		});
	}

	handleSave() {
		if (this.state.template != null) {
			MakeCall.api("stashes/save/", {
				method: 'POST',
				body: MakeCall.prepdata({
					stash: this.state.slug,
					json: JSON.stringify(this.state.json)
				})
			}).then((response) => {
				if (response.success) {
					this.props.store.dispatch({
						type: "NEW_ALERT",
						alert: {
							title: "Saved!",
							message: this.state.title + " has been saved.",
							type: "success"
						}
					});
					MakeCall.api("stashes/list/").then((response) => {
						if (response.success) {
							let stashes = GeneralFunctions.objectInArraySort(response.list);
							this.props.store.dispatch({
								type: "UPDATE_STASHES",
								stashes
							})
						}
					});
					this.props.history.push(this.props.basename + '/developer/stashes/edit/'+this.state.slug);
				} else {
					MySwal.fire({
						title: "Error",
						text: response.message,
						showCloseButton: true
					})
				}
			});
		} else {
			MySwal.fire({
				title: "Template Not Selected",
				text: "Please select a template.",
				showCloseButton: true
			})
		}
	}

  render() {
		return (this.app_state.global.user != null && this.app_state.global.user.role == "administrator" ? 
		<div className="container">
			<h2>{this.mode} Stash</h2>
			<p className="lead">Stashes for your data.</p>
			<div className="row">
				<div className="col-12">
					<div className="ui-card ui-card-post-header">
						<div className="row">
							<div className="col-12 col-sm-6">
								<label>Name</label>
								<input type="text" className="form-control" placeholder="New Template Name" value={this.state.title} onChange={this.handleStashTitle}/>
							</div>
							<div className="col-12 col-sm-6">
								<label>Slug</label>
								<input type="text" className="form-control" placeholder="new-template-name" value={this.state.slug} onChange={this.handleStashSlug}/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="row">
				<div className="col-12">
					<div className="ui-card">
						<div className="row">
							<div className="col-12 col-sm-6"></div>
							<div className="col-12 col-sm-6 text-right">
								<button className="btn ui-btn" onClick={() => this.handleSave()}>Save</button>
							</div>
						</div>
						<div className="row">
							<div className="col-12">
								<div className="form-group">
									<label htmlFor="listedTemplates">Choose Template</label>
									<select className="form-control" id="listedTemplates" onChange={this._handleTemplate} value={(this.state.template!=null?this.state.template.slug:"")}>
										<option>Select Template</option>
										{
											this.state.templates.map((template, i) => {
												return <option key={i} value={template.data.slug}>{template.data.title}</option>
											})  
										}
									</select>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		: null)
	}
}