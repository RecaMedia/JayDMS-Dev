import React from 'react';
import { Link } from "react-router-dom";
import MakeCall from '../utilities/make-call';
import GeneralFunctions from '../utilities/general-functions';
import Loader from '../components/loader';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default class Posts extends React.Component {

	constructor(props) {
		super(props);

		this.getPostTypes = this.getPostTypes.bind(this);
		this.openPostType = this.openPostType.bind(this);
		this.deletePostType = this.deletePostType.bind(this);

		this.state = {
			loading: false,
			posttype: this.props.match.params.posttype,
			posts: []
		}
	}
	
	componentDidUpdate() {
		if (!this.state.loading && this.props.match.params.hasOwnProperty("posttype") && this.props.match.params.posttype != undefined && this.props.match.params.posttype != this.state.posttype) {
			this.getPostTypes();
		}
	}
	
	componentDidMount() {
		this.getPostTypes();
	}

	getPostTypes() {
		this.setState({
			loading: true
		}, () => {
			MakeCall.api("posts/list/", {
				method: 'POST',
				body: MakeCall.prepdata({
					posttype: this.props.match.params.posttype
				})
			}).then((response) => {
				if (response.success) {
					this.setState({
						loading: false,
						posttype: this.props.match.params.posttype,
						posts: response.list
					})
				}
			});
		});
	}

	openPostType(slug) {
		this.props.history.push(this.props.basename + '/pt/'+ this.props.match.params.posttype +'/edit/'+slug);
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
				MakeCall.api("posts/delete/", {
					method: 'POST',
					body: MakeCall.prepdata({
						posttype: this.props.match.params.posttype,
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

		if (!this.state.loading && this.state.posts.length > 0) {
			content = <div className="ui-table">
				<table className="table">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">{GeneralFunctions.dashesToSpacesAndCaps(this.props.match.params.posttype)}</th>
						</tr>
					</thead>
					<tbody>
						{
							this.state.posts.map((post,i) => {
								return <tr key={i}>
									<th scope="row">{i+1}</th>
									<td className="ui-list__item">
										<button className="btn ui-btn ui-btn-text ui-list__item-button" onClick={() => this.deletePostType(post.slug)}><i className="icon ion-md-remove-circle-outline"></i></button>
										<a onClick={() => this.openPostType(post.slug)}>{GeneralFunctions.dashesToSpacesAndCaps(post.slug)}</a>
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
							<th scope="col">{GeneralFunctions.dashesToSpacesAndCaps(this.props.match.params.posttype)}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colSpan="2">
								You have no {GeneralFunctions.dashesToSpacesAndCaps(this.props.match.params.posttype)}s.
							</td>
						</tr>
					</tbody>
				</table>
			</div>;
		}

		return (
			<div>
				<div className="container">
					<h2>{GeneralFunctions.dashesToSpacesAndCaps(this.props.match.params.posttype)}</h2>
					<div className="row">
            <div className="col-12">
							<div className="ui-card">
								<div className="row">
									<div className="col-12 col-sm-6">

									</div>
									<div className="col-12 col-sm-6 text-right">
										<Link className="btn ui-btn" to={this.props.basename + "/pt/"+ this.props.match.params.posttype +"/add"}><i className="icon ion-md-add"></i> Add New</Link>
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
		)
	}
}