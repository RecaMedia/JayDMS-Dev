import React from 'react';
import { Link } from "react-router-dom";
import MakeCall from '../utilities/make-call';
import GeneralFunctions from '../utilities/general-functions';
import Loader from '../components/loader';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default class DevStashes extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = this.props.store.getState();

		this.getStashes = this.getStashes.bind(this);
		this.openStash = this.openStash.bind(this);
		this.deleteStash = this.deleteStash.bind(this);

		this.state = {
			loading: false,
			stashes: []
		}
	}
	
	componentDidMount() {
		this.unsubscribe = this.props.store.subscribe(() => {
			this.app_state = this.props.store.getState();
			this.forceUpdate();
		});
		
		this.getStashes();
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	getStashes() {
		this.setState({
			loading: true
		}, () => {
			MakeCall.api("stashes/list/").then((response) => {
				if (response.success) {
					let stashes = GeneralFunctions.objectInArraySort(response.list);
					this.props.store.dispatch({
						type: "UPDATE_STASHES",
						stashes: stashes
					})
					this.setState({
						loading: false,
						stashes
					})
				}
			});
		});
	}

	openStash(stash_slug) {
		this.props.history.push(this.props.basename + '/developer/stashes/edit/'+stash_slug);
	}
	
	deleteStash(stash_slug) {
		MySwal.fire({
			title: "Delete Stash?",
			text: "Are you sure you want to delete this stash?",
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
				MakeCall.api("stashes/delete/", {
					method: 'POST',
					body: MakeCall.prepdata({
						stash: stash_slug
					})
				}).then((response) => {
					if (response.success) {
						this.getStashes();
					}
				});
			}
		});
	}

  render() {
		let content = <Loader/>;

		if (!this.state.loading && this.state.stashes.length > 0) {
			content = <div className="ui-table">
				<table className="table">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">Stashes</th>
						</tr>
					</thead>
					<tbody>
						{
							this.state.stashes.map((stash,i) => {
								return <tr key={i}>
									<th scope="row">{i+1}</th>
									<td className="ui-list__item">
										<button className="btn ui-btn ui-btn-text ui-list__item-button" onClick={() => this.deleteStash(stash.slug)}><i className="icon ion-md-remove-circle-outline"></i></button>
										<a onClick={() => this.openStash(stash.slug)}>{GeneralFunctions.underscoresToSpacesAndCaps(stash.slug)}</a>
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
							<th scope="col">Stashes</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colSpan="2">
								You have no stashes.
							</td>
						</tr>
					</tbody>
				</table>
			</div>;
		}

		return (this.app_state.global.user != null && this.app_state.global.user.role == "administrator" ? 
		<div>
			<div className="container">
				<h2>Stashes</h2>
				<p className="lead">Where data is stashed.</p>
				<div className="row">
					<div className="col-12">
						<div className="ui-card">
							<div className="row">
								<div className="col-12 col-sm-6">

								</div>
								<div className="col-12 col-sm-6 text-right">
									<Link className="btn ui-btn" to={this.props.basename + "/developer/stashes/add"}><i className="icon ion-md-add"></i> Add New</Link>
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