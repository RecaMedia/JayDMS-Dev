import React from 'react';
import { Link } from "react-router-dom";
import MakeCall from '../utilities/make-call';
import GeneralFunctions from '../utilities/general-functions';

import Loader from '../components/loader';

export default class DevFieldTypes extends React.Component {

	constructor(props) {
		super(props);
		
		this.app_state = this.props.store.getState();
		
		this.state = {
			fieldtypes: []
		}
	}
	
	componentDidMount() {
		this.unsubscribe = this.props.store.subscribe(() => {
			this.app_state = this.props.store.getState();
			this.forceUpdate();
		});

		if (this.state.fieldtypes.length == 0) {
			MakeCall.api("fieldtypes/list/").then((response) => {
				if (response.success) {
					let fieldtypes = GeneralFunctions.objectInArraySort(response.list);
					this.setState({
						fieldtypes
					})
				}
			});
		}
	}
	
	componentWillUnmount() {
		this.unsubscribe();
	}

  render() {
		let content = <Loader/>;

		if (this.state.fieldtypes.length) {
			content = <div className="ui-table">
				<table className="table">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">Field Type</th>
						</tr>
					</thead>
					<tbody>
						{
							this.state.fieldtypes.map((fieldtype,i) => {
								return <tr key={i}>
									<th scope="row">{i+1}</th>
									<td>{GeneralFunctions.capitalize(fieldtype.data.fieldtype_name)}</td>
								</tr>;
							})
						}
					</tbody>
				</table>
			</div>;
		}

		return (this.app_state.global.user != null && this.app_state.global.user.role == "administrator" ? 
		<div>
			<div className="container">
				<h2>Field Types</h2>
				<p className="lead">Build your Components with Field Types.</p>
				<div className="row">
					<div className="col-12">
						<div className="ui-card">
							{/* <div className="row">
								<div className="col-12 col-sm-6">

								</div>
								<div className="col-12 col-sm-6 text-right">
									<Link className="btn ui-btn" to="/developer/fieldtypes/add"><i className="icon ion-md-add"></i> Add New</Link>
								</div>
							</div> */}
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