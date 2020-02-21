import React from 'react';
import ComponentSelector from '../components/component-selector';
import ComponentSort from '../components/component-sort';
import MakeCall from '../utilities/make-call';
import GeneralFunctions from '../utilities/general-functions';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default class DevTemplatesEditor extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = this.props.store.getState();

		this.processJSON = this.processJSON.bind(this);
		this.jsonFactory = this.jsonFactory.bind(this);
		this.handleTemplateTitle = this.handleTemplateTitle.bind(this);
		this.handleTemplateSlug = this.handleTemplateSlug.bind(this);
		this.handleComponent = this.handleComponent.bind(this);
		this.handleComponentIndexUpdate = this.handleComponentIndexUpdate.bind(this);
		this.handleSave = this.handleSave.bind(this);

		this.mode = "";
		if (this.props.match.params.hasOwnProperty("mode") && this.props.match.params.mode != undefined) {
			this.mode = GeneralFunctions.capitalize(this.props.match.params.mode);
		}
		
		this.state = {
			title: "My New Template",
			slug: "my-new-template",
			json: {},
			components: []
		}
	}

	componentDidMount() {
		this.unsubscribe = this.props.store.subscribe(() => {
			this.app_state = this.props.store.getState();
			this.forceUpdate();
		});

		if (this.props.match.params.hasOwnProperty("slug") && this.props.match.params.slug != undefined) {
			let slug = this.props.match.params.slug;
			MakeCall.api("templates/load/", {
				method: 'POST',
				body: MakeCall.prepdata({
					slug
				})
			}).then((response) => {
				if (response.success) {
					this.setState({
						title: response.template.title,
						slug,
						components: response.template.components
					}, () => {
						this.jsonFactory();
					});
				}
			});
		} else {
			this.jsonFactory()
		}
	}

	componentDidUpdate() {
		this.mode = "";
		if (this.props.match.params.hasOwnProperty("mode") && this.props.match.params.mode != undefined) {
			this.mode = GeneralFunctions.capitalize(this.props.match.params.mode);
		}
	}

	componentWillUnmount() {
		this.unsubscribe();
	}
	
	processJSON(components) {

		let json = {};
		json = {
			title: this.state.title,
			slug: this.state.slug,
			components
		}

		return json;
	}

	jsonFactory() {
		let json = this.processJSON(this.state.components);
		this.setState({
			json
		});
	}

	handleTemplateTitle(e) {
		let value = e.target.value;
		let title = value;
		let slug = value.split(" ").join("-").toLowerCase();
		this.setState({
			title,
			slug
		}, () => this.jsonFactory());
	}

	handleTemplateSlug(e) {
		let value = e.target.value;
		let slug = value.split(" ").join("-").toLowerCase();
		this.setState({
			slug
		}, () => this.jsonFactory());
	}

	handleComponent(component) {
		let components = Array.from(this.state.components);
		components.push(component);
		let json = this.processJSON(components);
		this.setState({
			json,
			components
		});
	}

	handleComponentIndexUpdate(components) {
		let json = this.processJSON(components);
		this.setState({
			json,
			components
		});
	}

	handleSave() {
		MakeCall.api("templates/save/", {
			method: 'POST',
			body: MakeCall.prepdata({
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
				this.props.history.push(this.props.basename + '/developer/templates/edit/'+this.state.slug);
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
		return (this.app_state.global.user != null && this.app_state.global.user.role == "administrator" ? 
		<div className="container">
			<h2>{this.mode} Template</h2>
			<p className="lead">Create Templates for your Post Types and Stashes.</p>
			<div className="row">
				<div className="col-12">
					<div className="ui-card ui-card-post-header">
						<div className="row">
							<div className="col-12 col-sm-6">
								<label>Name</label>
								<input type="text" className="form-control" placeholder="New Template Name" value={this.state.title} onChange={this.handleTemplateTitle}/>
							</div>
							<div className="col-12 col-sm-6">
								<label>Slug</label>
								<input type="text" className="form-control" placeholder="new-template-name" value={this.state.slug} onChange={this.handleTemplateSlug}/>
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
								<ComponentSelector onSelect={this.handleComponent}/> <button className="btn ui-btn" onClick={() => this.handleSave()}>Save</button>
							</div>
						</div>
						<div className="ui-inserts-list">
							<ComponentSort components={this.state.components} callback={this.handleComponentIndexUpdate}/>
						</div>
					</div>
				</div>
			</div>
		</div>
		: null)
	}
}