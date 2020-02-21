import React from 'react';
import ProfileEditor from '../components/profile-editor';

export default class UserAdd extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = this.props.store.getState();
	}

	componentDidMount() {
		this.unsubscribe = this.props.store.subscribe(() => {
			this.app_state = this.props.store.getState();
			this.forceUpdate();
		});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

  render() {

		return (this.app_state.global.user != null && (this.app_state.global.user.role == "administrator" || this.app_state.global.user.role == "manager") ?
		<div className="container">
			<h2>Add User</h2>
			<p className="lead">New member access.</p>
			<div className="row">
				<div className="col-12">
					<div className="ui-card">
						{/* Passing parent props will allow for navigating */}
						<ProfileEditor mode="add" {...this.props}/>
					</div>
				</div>
			</div>
		</div>
		: null)
	}
}