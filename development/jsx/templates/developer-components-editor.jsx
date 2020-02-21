import React from 'react';
import FieldTypeSelector from '../components/fieldtype-selector';
import Editor from '../components/editor';
import GlobalEditors from '../components/global-editors';
import FieldtypeInserts from '../components/fieldtype-inserts';
import Preview from '../components/preview-handler';
import MakeCall from '../utilities/make-call';
import UISlider from '../components/ui-slider';
import GeneralFunctions from '../utilities/general-functions';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default class DevComponentsEditor extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = this.props.store.getState();

		this.buffer = null;

		this.componentTabs = this.componentTabs.bind(this);
		this.editorTabs = this.editorTabs.bind(this);
		this.showFrontend = this.showFrontend.bind(this);
		this.processJSON = this.processJSON.bind(this);
		this.jsonFactory = this.jsonFactory.bind(this);
		this.handleComponentTitle = this.handleComponentTitle.bind(this);
		this.handleComponentSlug = this.handleComponentSlug.bind(this);
		this.handleFieldType = this.handleFieldType.bind(this);
		this.handleInsertsUpdate = this.handleInsertsUpdate.bind(this);
		this.setABIndex = this.setABIndex.bind(this);
		this.removeABData = this.removeABData.bind(this);
		this.copyABData = this.copyABData.bind(this);
		this.handleCode = this.handleCode.bind(this);
		this.handleSave = this.handleSave.bind(this);
		
		this.mode = "";
		if (this.props.match.params.hasOwnProperty("mode") && this.props.match.params.mode != undefined) {
			this.mode = GeneralFunctions.capitalize(this.props.match.params.mode);
		}

		this.state = {
			componentTabs: 0,
			editorTabs: 0,
			showFrontend: false,
			showJSON: false,
			title: "My New Component",
			slug: "my-new-component",
			changes: [],
			json: {},
			inserts: [],
			frontendIndex: 0,
			frontend: [{
				css: {
					standalone: false,
					code: ""
				},
				js: {
					standalone: false,
					code: ""
				},
				html: ""
			}]
		}
	}

	componentDidMount() {
		this.unsubscribe = this.props.store.subscribe(() => {
			this.app_state = this.props.store.getState();
			if (this.app_state.global.lastAction === "SET_USER") {
				this.setState({profile: this.app_state.global.user});
			}
		});
		
		if (this.props.match.params.hasOwnProperty("slug") && this.props.match.params.slug != undefined) {
			let slug = this.props.match.params.slug;
			MakeCall.api("components/load/", {
				method: 'POST',
				body: MakeCall.prepdata({
					slug
				})
			}).then((response) => {
				if (response.success) {
					this.setState({
						showFrontend: (response.component.showFrontend ? response.component.showFrontend : false),
						title: response.component.title,
						slug,
						json: response.component,
						inserts: response.component.fields,
						frontendIndex: response.component.frontendIndex,
						frontend: response.component.frontend
					})
				}
			});
		} else {
			this.jsonFactory()
		}
	}

	componentDidUpdate() {	
		this.mode = "";
		if (this.props.match.params.hasOwnProperty("mode") && this.props.match.params.mode != undefined) {
			this.mode = GeneralFunctions.capitalize(this.props.match.params.mode);
		}
	}
	
	componentWillUnmount() {
		this.unsubscribe();
	}

	componentTabs(index) {
		this.setState({componentTabs:index});
	}

	editorTabs(index) {
		this.setState({editorTabs:index});
	}

	showFrontend() {
		let showFrontend = (this.state.showFrontend ? false : true);
		let json = Object.assign({}, this.state.json, {
			showFrontend
		});
		this.setState({
			json,
			showFrontend
		})
	}
	
	processJSON(inserts) {
		let json = {};
		json = {
			showFrontend: this.state.showFrontend,
			title: this.state.title,
			slug: this.state.slug,
			fields: inserts,
			frontendIndex: this.state.frontendIndex,
			frontend: this.state.frontend
		}
		return json;
	}

	jsonFactory() {
		let inserts = GeneralFunctions.updateFieldTypeIndex(this.state.inserts);
		let json = this.processJSON(inserts);
		this.setState({
			json
		});
	}

	handleComponentTitle(e) {
		let value = e.target.value;
		let title = value;
		let slug = value.split(" ").join("_").toLowerCase();
		this.setState({
			title,
			slug
		}, () => this.jsonFactory());
	}

	handleComponentSlug(e) {
		let value = e.target.value;
		let slug = value.split(" ").join("_").toLowerCase();
		this.setState({
			slug
		}, () => this.jsonFactory());
	}

	handleFieldType(content) {
		let inserts = Array.from(this.state.inserts);
		inserts.push(content);
		inserts = GeneralFunctions.updateFieldTypeIndex(inserts);
		let json = this.processJSON(inserts);
		this.setState({
			json,
			inserts
		});
	}

	handleInsertsUpdate(inserts) {
		inserts = GeneralFunctions.updateFieldTypeIndex(inserts);

		let json = this.processJSON(inserts);
		this.setState({
			json,
			inserts
		});
	}

	setABIndex(frontendIndex) {
		let json = Object.assign({}, this.state.json, {
			frontendIndex
		});
		this.setState({
			json,
			frontendIndex
		})
	}

	removeABData(index) {
		if (index > 0) {
			let frontendIndex = (this.state.frontendIndex == index ? 0 : this.state.frontendIndex);
			let frontend = Array.from(this.state.frontend);
			frontend.splice(index,1);
			let json = Object.assign({}, this.state.json, {
				frontendIndex,
				frontend
			});
			this.setState({
				json,
				frontendIndex,
				frontend
			});
		}
	}

	copyABData(index) {
		let frontend = Array.from(this.state.frontend);
		let new_item = Object.assign({}, frontend[index]);
		frontend.push(new_item);
		let frontendIndex = this.state.frontendIndex + 1;
		let json = Object.assign({}, this.state.json, {
			frontendIndex,
			frontend
		});
		this.setState({
			json,
			frontendIndex,
			frontend
		})
	}

	handleCode(editor, value, type) {
		// Temp state object
		let temp_state_obj = {};
		// Check if update is for HTML
		if (editor == 'html') {
			// Set value to key
			temp_state_obj[editor] = value;
		} else {
			// Prepare code object for CSS or JS
			let code_obj = {}
			code_obj[type] = value;
			// Set value to key
			temp_state_obj[editor] = Object.assign({}, this.state.frontend[this.state.frontendIndex][editor], code_obj);
		}
		// Update state
		let frontend = Array.from(this.state.frontend);
		frontend[this.state.frontendIndex] = Object.assign({}, this.state.frontend[this.state.frontendIndex], temp_state_obj);
		this.setState({frontend}, () => this.jsonFactory());
	}

	handleSave() {
		MakeCall.api("components/save/", {
			method: 'POST',
			body: MakeCall.prepdata({
				json: JSON.stringify(this.state.json)
			})
		}).then((response) => {
			if (response.success) {
				// Let user know updates have been saved
				this.props.store.dispatch({
					type: "NEW_ALERT",
					alert: {
						title: "Saved!",
						message: this.state.title + " has been saved.",
						type: "success"
					}
				});
				// Only if preview mode is active
				if (this.app_state.global.preview.active) {
					this.props.store.dispatch({
						type: "UPDATE_PREVIEW",
						json: this.state.json,
						menu: null
					});
				}
				// Redirect if coming from new post
				let is_already_in_edit_mode = this.props.location.pathname.match(/\/cp\/developer\/components\/edit/g);
				if (is_already_in_edit_mode == null) {
					this.props.history.push(this.props.basename + '/developer/components/edit/'+this.state.slug);
				}
			} else {
				MySwal.fire({
					title: "Error",
					text: response.message,
					showCloseButton: true
				})
			}
		});
	}

  render() {

		let component_builder = <div className="container">
			<h2>{this.mode} Component</h2>
			<p className="lead">Create Components for your Templates.</p>
			<div className="row">
				<div className="col-12">
					<div className="ui-card ui-card-post-header">
						<div className="row">
							<div className="col-12 col-sm-6">
								<label>Name</label>
								<input type="text" className="form-control" placeholder="New Component Name" value={this.state.title} onChange={this.handleComponentTitle}/>
							</div>
							<div className="col-12 col-sm-6">
								<label>Slug</label>
								<input type="text" className="form-control" placeholder="new-component-name" value={this.state.slug} onChange={this.handleComponentSlug}/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="row">
				<div className="col-12">
					<div className="ui-card">
						<div className="row">
							<div className="col-12 col-sm-6"></div>
							<div className="col-12 col-sm-6 text-right">
								<button className="btn ui-btn" onClick={() => {
									this.setState({
										showJSON:(this.state.showJSON?false:true)
									})
								}}>{"{...}"}</button> <FieldTypeSelector onSelect={this.handleFieldType}/> <button className="btn ui-btn" onClick={() => this.handleSave()}>Save</button>
							</div>
						</div>
						<div className="ui-inserts-list">
							<FieldtypeInserts inserts={this.state.inserts} callback={this.handleInsertsUpdate}/>
						</div>
					</div>
				</div>
			</div>
			<div className="row">
				<div className="col-12 text-right">
					<div className="ui-editor-manager-menu">
						<UISlider label="Front-End" value={this.state.showFrontend} onChange={(value) => this.showFrontend()}/>
					</div>
				</div>
			</div>
			{(this.state.frontend.length ?
			<div id="FrontEndEditors" className={"ui-editor-manager" + (this.state.showFrontend ? " ui-editor-manager--active" : "")}>
				<div className="row">
					<div className="col-12">
						<div className="ui-card">
							<div className="ui-editor-manager-tabs">
								<ul className="nav nav-tabs">
									<li className="nav-item">
										<button className={"nav-link" + (this.state.editorTabs == 0 ? " active" : "")} onClick={() => this.editorTabs(0)}>Component</button>
									</li>
									<li className="nav-item">
										<button className={"nav-link" + (this.state.editorTabs == 1 ? " active" : "")} onClick={() => this.editorTabs(1)}>Global</button>
									</li>
								</ul>
							</div>
							<div className="ui-editor-manager-views">
								<div className={"ui-editor-manager-views__view" + (this.state.editorTabs == 0 ? " ui-editor-manager-views__view--active" : "")}>
									{/* AB Testing */}
									<div className="ui-ab-test-menu">
										<label className="ui-ab-test-menu__title">A/B Testing</label>
										<ul className="nav nav-tabs">
											{this.state.frontend.map((data,i) => {
												return <li key={i} className="nav-item">
													<div className={"ui-ab-test-menu__label" + (i == this.state.frontendIndex ? " ui-ab-test-menu__label--active" : "")}>
														<button onClick={() => this.setABIndex(i)}>{(i == 0 ? "Original" : "v"+(i+1))}</button>
														{(i != 0 ? <button onClick={() => this.removeABData(i)}><i className="icon ion-md-trash"></i></button> : null)}
														<button onClick={() => this.copyABData(i)}><i className="icon ion-md-copy"></i></button>
													</div>
												</li>
											})}
										</ul>
									</div>
									{/* Editors */}
									<div className="ui-frontend-editor ui-frontend-editor--ab-testing">
										<ul className="nav nav-tabs">
											<li className="nav-item">
												<button className={"nav-link" + (this.state.componentTabs == 0 ? " active" : "")} onClick={() => this.componentTabs(0)}>HTML</button>
											</li>
											<li className="nav-item">
												<button className={"nav-link" + (this.state.componentTabs == 1 ? " active" : "")} onClick={() => this.componentTabs(1)}>SCSS</button>
											</li>
											<li className="nav-item">
												<button className={"nav-link" + (this.state.componentTabs == 2 ? " active" : "")} onClick={() => this.componentTabs(2)}>JS</button>
											</li>
											<li className="nav-item ui-frontend-editor__preview-button">
												<Preview/>
											</li>
											<li className="nav-item ui-frontend-editor__preview-button">
												<button className="btn ui-btn" onClick={() => this.handleSave()}>Save</button>
											</li>
										</ul>
										<div className="ui-frontend-editor__tabs">
											{/* Tab One */}
											<div className={"ui-frontend-editor__tab" + (this.state.componentTabs == 0 ? " ui-frontend-editor__tab--active" : "")}>
												<div className="row">
													<div className="col-12">
														<Editor id="ComponentHTMLEditor" mode="html" width="100%" height="210px" code={this.state.frontend[this.state.frontendIndex].html} component={this.state.json} componentSlug={this.state.slug} onChange={(code) => this.handleCode('html', code, 'code')} shortMenu={true}/>
													</div>
												</div>
											</div>
											{/* Tab Two */}
											<div className={"ui-frontend-editor__tab" + (this.state.componentTabs == 1 ? " ui-frontend-editor__tab--active" : "")}>
												<div className="row ui-card__nav">
													<div className="col-12 ui-frontend-editor__tools">
														<UISlider label="Standalone CSS" value={this.state.frontend[this.state.frontendIndex].css.standalone} onChange={(value) => {this.handleCode('css', value, 'standalone')}}/>
													</div>
												</div>
												<div className="row">
													<div className="col-12 ui-frontend-editor__editor">
														<Editor id="ComponentCSSEditor" mode="scss" width="100%" height="160px" code={this.state.frontend[this.state.frontendIndex].css.code} component={this.state.json} componentSlug={this.state.slug} onChange={(code) => this.handleCode('css', code, 'code')} shortMenu={true}/>
													</div>
												</div>
											</div>
											{/* Tab Three */}
											<div className={"ui-frontend-editor__tab" + (this.state.componentTabs == 2 ? " ui-frontend-editor__tab--active" : "")}>
												<div className="row ui-card__nav">
													<div className="col-12 ui-frontend-editor__tools">
														<UISlider label="Standalone JS" value={this.state.frontend[this.state.frontendIndex].js.standalone} onChange={(value) => {this.handleCode('js', value, 'standalone')}}/>
													</div>
												</div>
												<div className="row">
													<div className="col-12 ui-frontend-editor__editor">
														<Editor id="ComponentJSEditor" mode="javascript" width="100%" height="160px" code={this.state.frontend[this.state.frontendIndex].js.code} component={this.state.json} componentSlug={this.state.slug} onChange={(code) => this.handleCode('js', code, 'code')} shortMenu={true}/>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className={"ui-editor-manager-views__view" + (this.state.editorTabs == 1 ? " ui-editor-manager-views__view--active" : "")}>
									<GlobalEditors/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			: null)}
		</div>;

		let builder;
		if (this.state.showJSON) {
			builder = <div className="row">
				<div className="col-8">
					{component_builder}
				</div>
				<div className="col-4">
					<div className="ui-sticky-wrapper">
						<Editor id="ComponentJSONEditor" mode="json" width="100%" height="calc(100vh - 110px)" code={JSON.stringify(this.state.json, undefined, 2)}/>
					</div>
				</div>
			</div>
		} else {
			builder = component_builder;
		}

		return (this.app_state.global.user != null && this.app_state.global.user.role == "administrator" ? builder : null)
	}
}