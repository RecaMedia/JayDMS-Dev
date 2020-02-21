import React from 'react';
import GlobalEditors from '../components/global-editors';

export default class FrontEnd extends React.Component {

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
			<h2>Front-End</h2>
			<p className="lead">The snippets of code that architech your site.</p>
			<div className="row">
				<div className="col-12">
					<div className="ui-card">
						<GlobalEditors/>
					</div>
				</div>
			</div>
		</div>
		: null)
	}
}