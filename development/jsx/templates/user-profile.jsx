import React from 'react';
import ProfileEditor from '../components/profile-editor';
import makeCall from '../utilities/make-call';

export default class UserProfile extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = this.props.store.getState();

		this.state = {
			error: false,
			errorMsg: "",
      profile: null
		}
	}

	componentDidMount() {
		this.unsubscribe = this.props.store.subscribe(() => {
			this.app_state = this.props.store.getState();
			if (this.app_state.global.lastAction === "SET_USER") {
				this.setState({profile: this.app_state.global.user});
			}
		});

		if (this.props.match.params.hasOwnProperty("username") && this.props.match.params.username != undefined) {
			if (this.app_state.global.user != null && this.app_state.global.user.username == this.props.match.params.username) {
				makeCall.api("users/get/", {
					method: 'POST',
					body: makeCall.prepdata({
						username: this.props.match.params.username
					})
				}).then((response) => {
					if (response.success) {
						this.setState({profile: response.user});
					} else {
						this.setState({
							error: true,
							errorMsg: response.message
						})
					}
				});
			}
		} else {
			this.app_state = this.props.store.getState();
			this.setState({profile: this.app_state.global.user});
		}
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

  render() {

		return (this.app_state.global.user != null ?
		<div className="container">
			<h2>User Profile</h2>
			<p className="lead">User account information.</p>
			<div className="row">
				<div className="col-12">
					<div className="ui-card">
						{(this.state.profile != null ?
							<ProfileEditor profile={this.state.profile}/>
						: (this.state.error ? <p>{this.state.errorMsg}</p> : null))}
					</div>
				</div>
			</div>
		</div>
		: null)
	}
}