import React from 'react';
import FileManager from '../components/file-manager';

export default class FileManagerView extends React.Component {

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
		<div className="ui-file-manager">
			<div className="ui-file-manager__title">
				<h2>File Manager</h2>
				<p className="lead">Manage your files with simplicity.</p>
			</div>
			<FileManager rootDir=""/>
		</div>
		: null)
	}
}