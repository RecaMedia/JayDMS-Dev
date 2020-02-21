import React from 'react';
import { Link } from "react-router-dom";
import MakeCall from '../utilities/make-call';
import GeneralFunctions from '../utilities/general-functions';
import Loader from '../components/loader';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default class DevPostTypes extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = this.props.store.getState();

		this.getPostTypes = this.getPostTypes.bind(this);
		this.openPostType = this.openPostType.bind(this);
		this.deletePostType = this.deletePostType.bind(this);

		this.state = {
			loading: false,
			posttypes: []
		}
	}
	
	componentDidMount() {
		this.unsubscribe = this.props.store.subscribe(() => {
			this.app_state = this.props.store.getState();
			this.forceUpdate();
		});
		
		this.getPostTypes();
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	getPostTypes() {
		this.setState({
			loading: true
		}, () => {
			MakeCall.api("posttypes/list/").then((response) => {
				if (response.success) {
					let posttypes = GeneralFunctions.objectInArraySort(response.list);
					this.props.store.dispatch({
						type: "UPDATE_POSTTYPES",
						postTypes: posttypes
					})
					this.setState({
						loading: false,
						posttypes
					})
				}
			});
		});
	}

	openPostType(slug) {
		this.props.history.push(this.props.basename + '/developer/posttypes/edit/'+slug);
	}
	
	deletePostType(slug) {
		MySwal.fire({
			title: "Delete Post Type?",
			text: "Are you sure you want to delete this post type?",
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
				MakeCall.api("posttypes/delete/", {
					method: 'POST',
					body: MakeCall.prepdata({
						slug
					})
				}).then((response) => {
					if (response.success) {
						this.getPostTypes();
					}
				});
			}
		});
	}

  render() {
		let content = <Loader/>;

		if (!this.state.loading && this.state.posttypes.length > 0) {
			content = <div className="ui-table">
				<table className="table">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">Post Types</th>
						</tr>
					</thead>
					<tbody>
						{
							this.state.posttypes.map((posttype,i) => {
								return <tr key={i}>
									<th scope="row">{i+1}</th>
									<td className="ui-list__item">
										<button className="btn ui-btn ui-btn-text ui-list__item-button" onClick={() => this.deletePostType(posttype.slug)}><i className="icon ion-md-remove-circle-outline"></i></button>
										<a onClick={() => this.openPostType(posttype.slug)}>{GeneralFunctions.dashesToSpacesAndCaps(posttype.slug)}</a>
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
							<th scope="col">Post Type</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colSpan="2">
								You have no post types.
							</td>
						</tr>
					</tbody>
				</table>
			</div>;
		}

		return (this.app_state.global.user != null && this.app_state.global.user.role == "administrator" ? 
		<div>
			<div className="container">
				<h2>Post Types</h2>
				<p className="lead">Where content begins.</p>
				<div className="row">
					<div className="col-12">
						<div className="ui-card">
							<div className="row">
								<div className="col-12 col-sm-6">

								</div>
								<div className="col-12 col-sm-6 text-right">
									<Link className="btn ui-btn" to={this.props.basename + "/developer/posttypes/add"}><i className="icon ion-md-add"></i> Add New</Link>
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