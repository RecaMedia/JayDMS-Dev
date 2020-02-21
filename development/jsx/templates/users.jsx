import React from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/loader';
import generalFunctions from '../utilities/general-functions';
import makeCall from '../utilities/make-call';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default class Users extends React.Component {

	constructor(props) {
    super(props);
    
		this.app_state = this.props.store.getState();
		
		this._getUsers = this._getUsers.bind(this);
		this._deleteUser = this._deleteUser.bind(this);

		this.state = {
      loading: false,
      users: null,
      currentUser: this.app_state.global.user
		}
	}

	componentDidMount() {
    this.unsubscribe = this.props.store.subscribe(() => {
      this.app_state = this.props.store.getState();
      if (this.app_state.global.lastAction === "SET_USER") {
        this.setState({
          currentUser: this.app_state.global.user
        });
      }
		});

		this._getUsers();
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	_getUsers() {
    this.setState({
			loading: true
		}, () => {
      makeCall.api("users/all/", {
        method: 'GET'
      }).then((response) => {
        if (response.success) {
          this.setState({
            loading: false,
            users: response.users
          });
        }
      });
    });
  }

	_deleteUser(username) {
		if (this.state.currentUser != null && this.state.currentUser.role == "administrator") {
			MySwal.fire({
				title: "Remove User",
				text: "Are you sure you would like to remove this user?",
				showConfirmButton: true,
				showCancelButton: true,
				confirmButtonColor: '#4dbbde',
			}).then((result) => {
				if (result.value) {
					makeCall.api("users/delete/", {
						method: 'POST',
						body: makeCall.prepdata({
							username
						})
					}).then((response) => {
						if (response.refresh) {
							// Receiving refresh would indicate user deleted self
							// Refresh is needed to check for session
							location.reload();
						} else {
							if (response.success) {
								this._getUsers();
								this.props.store.dispatch({
									type: "NEW_ALERT",
									alert: {
										title: "Removed!",
										message: "User has been removed.",
										type: "success"
									}
								});
							} else {
								this.props.store.dispatch({
									type: "NEW_ALERT",
									alert: {
										title: "Failed.",
										message: response.message,
										type: "danger"
									}
								});
							}
						}
					});
				}
			});
		} else {
			MySwal.fire({
        title: "Access Denied",
        text: "You need to have administrator privileges to remove user.",
        showCloseButton: true
      });
		}
	}

  render() {
    let content = <Loader/>;
  
		if (!this.state.loading && this.state.users != null) {
			content = <div className="ui-table">
				<table className="table">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">Users</th>
						</tr>
					</thead>
					<tbody>
						{
							Object.keys(this.state.users).map((username,i) => {
                let user = this.state.users[username];
								return <tr key={i}>
									<th scope="row">{i+1}</th>
									<td className="ui-list__item">
										<button className="btn ui-btn ui-btn-text ui-list__item-button" onClick={() => this._deleteUser(username)}><i className="icon ion-md-remove-circle-outline"></i></button>
										<Link to={this.props.basename + "/users/edit/" + (this.state.currentUser != null && this.state.currentUser.username == username ? "me" : username)}>{generalFunctions.dashesToSpacesAndCaps(user.firstname)} {generalFunctions.dashesToSpacesAndCaps(user.lastname)}{(this.state.currentUser != null && this.state.currentUser.username == username ? " - You" : null)}</Link>
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
							<th scope="col">Users</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colSpan="2">
								You have no users.
							</td>
						</tr>
					</tbody>
				</table>
			</div>;
		}

		return (this.app_state.global.user != null && (this.app_state.global.user.role == "administrator" || this.app_state.global.user.role == "manager") ?
		<div>
			<div className="container">
				<h2>Users</h2>
				<div className="row">
					<div className="col-12">
						<div className="ui-card">
							<div className="row">
								<div className="col-12 col-sm-6">

								</div>
								<div className="col-12 col-sm-6 text-right">
									<Link className="btn ui-btn" to={this.props.basename + "/users/add/"}><i className="icon ion-md-add"></i> Add New</Link>
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