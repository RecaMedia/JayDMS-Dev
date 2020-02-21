import React from 'react';
import MakeCall from '../utilities/make-call';
import generalFunctions from '../utilities/general-functions';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default class DevPostTypeEditor extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = this.props.store.getState();

		this.processJSON = this.processJSON.bind(this);
		this.jsonFactory = this.jsonFactory.bind(this);
		this.handlePostTypeTitle = this.handlePostTypeTitle.bind(this);
		this.handlePostTypeSlug = this.handlePostTypeSlug.bind(this);
		this._handleTemplate = this._handleTemplate.bind(this);
		this.handleSave = this.handleSave.bind(this);

		this.mode = "";
		if (this.props.match.params.hasOwnProperty("mode") && this.props.match.params.mode != undefined) {
			this.mode = generalFunctions.capitalize(this.props.match.params.mode);
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
			this.forceUpdate();
		});
		
		if (this.props.match.params.hasOwnProperty("slug") && this.props.match.params.slug != undefined) {
			let slug = this.props.match.params.slug;
			MakeCall.api("posttypes/load/", {
				method: 'POST',
				body: MakeCall.prepdata({
					slug
				})
			}).then((response) => {
				if (response.success) {
					this.original_slug = slug;
					this.setState({
						title: response.posttype.title,
						slug,
						template: response.posttype.template
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
		this.mode = "";
		if (this.props.match.params.hasOwnProperty("mode") && this.props.match.params.mode != undefined) {
			this.mode = generalFunctions.capitalize(this.props.match.params.mode);
		}
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	getTemplates() {
    MakeCall.api("templates/list/").then((response) => {
      if (response.success) {
        let templates = generalFunctions.objectInArraySort(response.list);
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

	handlePostTypeTitle(e) {
		let usingReservedWord = false;
		let value = e.target.value;

		if (generalFunctions.reservedWords(value)) {
			usingReservedWord = true;
		}
		
		if (!usingReservedWord) {
			let title = value;
			let slug = value.split(" ").join("-").toLowerCase();
			this.setState({
				title,
				slug
			}, () => this.jsonFactory());
		} else {
			MySwal.fire({
				title: "Invalid",
				text: "You can't use " + value + " which is a reserve word within the JayDMS system.",
				showCloseButton: true
			})
		}
	}

	handlePostTypeSlug(e) {
		let value = e.target.value;
		let slug = value.split(" ").join("-").toLowerCase();
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
		let usingReservedWord = false;

		if (generalFunctions.reservedWords(this.state.title)) {
			usingReservedWord = true;
		}
		
		if (!usingReservedWord) {
			// Create post data
			let post_data = {
				json: JSON.stringify(this.state.json)
			}
			// Check if a rename happened
			if (this.original_slug != this.state.json.slug) {
				// If so, add additional renameFrom param
				post_data.renameFrom = this.original_slug;
				// Update original to check for future rename events
				this.original_slug = this.state.json.slug;
			}
			// Make sure a template is selected prior to saving
			if (this.state.template != null) {
				MakeCall.api("posttypes/save/", {
					method: 'POST',
					body: MakeCall.prepdata(post_data)
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
						MakeCall.api("posttypes/list/").then((response) => {
							if (response.success) {
								let postTypes = generalFunctions.objectInArraySort(response.list);
								this.props.store.dispatch({
									type: "UPDATE_POSTTYPES",
									postTypes
								})
							}
						});
						this.props.history.push(this.props.basename + '/developer/posttypes/edit/'+this.state.slug);
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
		} else {
			MySwal.fire({
				title: "Invalid",
				text: "You can't use " + this.state.title + " which is a reserve word within the JayDMS system.",
				showCloseButton: true
			})
		}
	}

  render() {
		return (this.app_state.global.user != null && this.app_state.global.user.role == "administrator" ? 
		<div className="container">
			<h2>{this.mode} Post Type</h2>
			<p className="lead">Post Types for your content.</p>
			<div className="row">
				<div className="col-12">
					<div className="ui-card ui-card-post-header">
						<div className="row">
							<div className="col-12 col-sm-6">
								<label>Name</label>
								<input type="text" className="form-control" placeholder="New Template Name" value={this.state.title} onChange={this.handlePostTypeTitle}/>
							</div>
							<div className="col-12 col-sm-6">
								<label>Slug</label>
								<input type="text" className="form-control" placeholder="new-template-name" value={this.state.slug} onChange={this.handlePostTypeSlug}/>
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
										<option value="">Select Template</option>
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