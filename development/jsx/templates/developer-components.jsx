import React from 'react';
import { Link } from "react-router-dom";
import MakeCall from '../utilities/make-call';
import GeneralFunctions from '../utilities/general-functions';
import Loader from '../components/loader';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default class DevComponents extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = this.props.store.getState();

		this.getComponents = this.getComponents.bind(this);
		this.openComponent = this.openComponent.bind(this);
		this.deleteComponent = this.deleteComponent.bind(this);

		this.state = {
			loading: false,
			components: []
		}
	}
	
	componentDidMount() {
		this.unsubscribe = this.props.store.subscribe(() => {
			this.app_state = this.props.store.getState();
			this.forceUpdate();
		});

		this.getComponents();
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	getComponents() {
		this.setState({
			loading: true
		}, () => {
			MakeCall.api("components/list/").then((response) => {
				if (response.success) {
					let components = GeneralFunctions.objectInArraySort(response.list);
					this.setState({
						loading: false,
						components
					})
				}
			});
		});
	}

	openComponent(slug) {
		this.props.history.push(this.props.basename + '/developer/components/edit/'+slug);
	}
	
	deleteComponent(slug) {
		MySwal.fire({
			title: "Delete component?",
			text: "Are you sure you want to delete this component?",
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
				MakeCall.api("components/delete/", {
					method: 'POST',
					body: MakeCall.prepdata({
						slug
					})
				}).then((response) => {
					if (response.success) {
						this.getComponents();
					}
				});
			}
		});
	}

  render() {
		let content = <Loader/>;

		if (!this.state.loading && this.state.components.length > 0) {
			content = <div className="ui-table">
				<table className="table">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">Component</th>
						</tr>
					</thead>
					<tbody>
						{
							this.state.components.map((component,i) => {
								return <tr key={i}>
									<th scope="row">{i+1}</th>
									<td className="ui-list__item">
										<button className="btn ui-btn ui-btn-text ui-list__item-button" onClick={() => this.deleteComponent(component.slug)}><i className="icon ion-md-remove-circle-outline"></i></button>
										<a onClick={() => this.openComponent(component.slug)}>{component.data.title}</a>
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
							<th scope="col">Component</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colSpan="2">
								You have no components.
							</td>
						</tr>
					</tbody>
				</table>
			</div>;
		}

		return (this.app_state.global.user != null && this.app_state.global.user.role == "administrator" ? 
		<div>
			<div className="container">
				<h2>Components</h2>
				<p className="lead">The Components that define your markup.</p>
				<div className="row">
					<div className="col-12">
						<div className="ui-card">
							<div className="row">
								<div className="col-12 col-sm-6">

								</div>
								<div className="col-12 col-sm-6 text-right">
									<Link className="btn ui-btn" to={this.props.basename + "/developer/components/add"}><i className="icon ion-md-add"></i> Add New</Link>
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