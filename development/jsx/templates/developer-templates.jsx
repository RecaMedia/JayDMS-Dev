import React from 'react';
import { Link } from "react-router-dom";
import MakeCall from '../utilities/make-call';
import GeneralFunctions from '../utilities/general-functions';
import Loader from '../components/loader';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default class DevTemplates extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = this.props.store.getState();

		this.getTemplates = this.getTemplates.bind(this);
		this.openTemplate = this.openTemplate.bind(this);
		this.deleteTemplate = this.deleteTemplate.bind(this);

		this.state = {
			loading: false,
			templates: []
		}
	}
	
	componentDidMount() {
		this.unsubscribe = this.props.store.subscribe(() => {
			this.app_state = this.props.store.getState();
			this.forceUpdate();
		});

		this.getTemplates();
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	getTemplates() {
		this.setState({
			loading: true
		}, () => {
			MakeCall.api("templates/list/").then((response) => {
				if (response.success) {
					let templates = GeneralFunctions.objectInArraySort(response.list);
					this.setState({
						loading: false,
						templates
					})
				}
			});
		});
	}

	openTemplate(slug) {
		this.props.history.push(this.props.basename + '/developer/templates/edit/'+slug);
	}
	
	deleteTemplate(slug) {
		MySwal.fire({
			title: "Delete template?",
			text: "Are you sure you want to delete this template?",
			showCloseButton: true,
			showCancelButton: true,
			focusConfirm: false,
			confirmButtonText: 'Yes, Delete',
			confirmButtonColor: '#ff0000',
			confirmButtonAriaLabel: 'Confirm Deletion',
			cancelButtonText: 'Cancel',
			cancelButtonAriaLabel: 'Cancel Deletion',
		}).then((response) => {
			if (response.hasOwnProperty("value") && response.value) {
				MakeCall.api("templates/delete/", {
					method: 'POST',
					body: MakeCall.prepdata({
						slug
					})
				}).then((response) => {
					if (response.success) {
						this.getTemplates();
					}
				});
			}
		});
	}

  render() {
		let content = <Loader/>;

		if (!this.state.loading && this.state.templates.length > 0) {
			content = <div className="ui-table">
				<table className="table">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">Template</th>
						</tr>
					</thead>
					<tbody>
						{
							this.state.templates.map((template,i) => {
								return <tr key={i}>
									<th scope="row">{i+1}</th>
									<td className="ui-list__item">
										<button className="btn ui-btn ui-btn-text ui-list__item-button" onClick={() => this.deleteTemplate(template.slug)}><i className="icon ion-md-remove-circle-outline"></i></button>
										<a onClick={() => this.openTemplate(template.slug)}>{GeneralFunctions.dashesToSpacesAndCaps(template.slug)}</a>
									</td>
								</tr>;
							})
						}
					</tbody>
				</table>
			</div>;
		} else {
			content = <div className="ui-table">
				<table className="table">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">Templates</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colSpan="2">
								You have no templates.
							</td>
						</tr>
					</tbody>
				</table>
			</div>;
		}

		return (this.app_state.global.user != null && this.app_state.global.user.role == "administrator" ? 
		<div>
			<div className="container">
				<h2>Templates</h2>
				<p className="lead">Blueprints for your Post Types and Stashes.</p>
				<div className="row">
					<div className="col-12">
						<div className="ui-card">
							<div className="row">
								<div className="col-12 col-sm-6">

								</div>
								<div className="col-12 col-sm-6 text-right">
									<Link className="btn ui-btn" to={this.props.basename + "/developer/templates/add"}><i className="icon ion-md-add"></i> Add New</Link>
								</div>
							</div>
							<div className="row">
								<div className="col-12">
									{content}
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