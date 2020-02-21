import React from 'react';
import MenuItemInserts from '../components/menu-item-inserts';
import MenuEditor from '../components/menu-editor';
import UISlider from '../components/ui-slider';
import makeCall from '../utilities/make-call';
import generalFunctions from '../utilities/general-functions';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const menuItemCustomURL = {
	title: "Custom URL",
	data: {
		title: "Custom URL",
		classWrapper: "",
		classItem: "",
		classLink: "",
		subtitle: "",
		active: false,
		type: "custom_url",
		target: "_self",
		src: "",
		children: null
	}
}

export default class MenuManager extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = this.props.store.getState();

		this._toggleActive = this._toggleActive.bind(this);
		this._loadMenus = this._loadMenus.bind(this);
		this._getPost = this._getPost.bind(this);
		this._processLoad = this._processLoad.bind(this);
		this._onMenuChange = this._onMenuChange.bind(this);
		this._createNewMenu = this._createNewMenu.bind(this);
		this._closeMenu = this._closeMenu.bind(this);
		this._handleSave = this._handleSave.bind(this);
		this._handleDelete = this._handleDelete.bind(this);

		this.original_current_menu_slug = null;

		this.menus_added_to_items = false;
		this.post_added_to_items = false;

		this.state = {
			paramMenuSlug: (this.props.match.params.menuSlug != undefined ? this.props.match.params.menuSlug : null),
			mode: "add",
			menus: {},
			menuItems: [menuItemCustomURL],
			selectedMenu: null
		}
	}

	static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = Object.assign({}, prevState, {
      paramMenuSlug: (nextProps.match.params.menuSlug != undefined ? nextProps.match.params.menuSlug : null)
    });
    return temp_state;
  }

	componentDidUpdate(prevProps, prevState) {
		// On any update, this flag would trigger a series of events
		if (!this.menus_added_to_items) {
			this._loadMenus([menuItemCustomURL]); // -> this._getPost() -> this._processLoad()
		}
	}
	
	componentDidMount() {
		this.unsubscribe = this.props.store.subscribe(() => {
      this.app_state = this.props.store.getState();
		});
		
		// Load menus
		this._loadMenus([menuItemCustomURL]);
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	_toggleActive() {
		let selectedMenu = Object.assign({}, this.state.selectedMenu, {
			publish: (this.state.selectedMenu.publish ? false : true)
		});
		this.setState({selectedMenu});
	}
	
	_loadMenus(menuItems) {
		if (!this.menus_added_to_items) {
			// Set flag
			this.menus_added_to_items = true;
			// Get menus
			makeCall.api("general/loadMenus/", {
				method: 'GET'
			}).then((menus_response) => {
				if (menus_response.success) {
					let menus = menus_response.menus;
					// Loop through menus to list as menu items
					Object.keys(menus).map((key, i) => {
						let title = menus[key].title;
						menuItems.push({
							title,
							data: {
								title,
								subtitle: title,
								type: "menu",
								target: "_self",
								src: "/",
								children: menus[key].treeData
							}
						});
					});
					// Set loaded menus
					this.setState({
						menus: menus_response.menus
					});
				}
				// Now that menus are loaded, lets load post from all post types
				this._getPost(menuItems);
				// Load any menu the user is trying to edit
				this._processLoad();
			});
		}
	}
	
	_getPost(menuItems) {
		if (!this.post_added_to_items) {
			// Set flag
			this.post_added_to_items = true;
			// Get listed post types within app state
			makeCall.api("posttypes/list/").then((response) => {
				if (response.success) {
					let postTypes = generalFunctions.objectInArraySort(response.list);
					let total_count = postTypes.length - 1; // -1 is used to compare to index within loop
					this.props.store.dispatch({
						type: "UPDATE_POSTTYPES",
						postTypes
					});
					// Loop through all post types to load all their post
					postTypes.map((posttype, count) => {
						makeCall.api("posts/list/", {
							method: 'POST',
							body: makeCall.prepdata({
								posttype: posttype.slug
							})
						}).then((response) => {
							// Add all post as a menu item
							let item = null;
							let children = null;
							if (response.success) {
								children = [];
								response.list.map((post, i) => {
									let title = generalFunctions.dashesToSpacesAndCaps(post.slug);
									children.push({
										title,
										data: {
											title,
											subtitle: title,
											type: "post",
											target: "_self",
											src: "/"+posttype.slug+"/"+post.slug,
											children: null
										}
									});
								});
								item = {
									title: generalFunctions.dashesToSpacesAndCaps(posttype.slug),
									data: null,
									children
								}
								menuItems.push(item);
								// Set state only when loop is completed
								if (total_count === count) {
									this.setState({menuItems});
								}
							}
						});
					});
				}
			});
		}
	}

  _processLoad(menu_slug = false) {
		// This function assumes the menus have been loaded
    if (this.state.paramMenuSlug != null || menu_slug) {
			// Check if a slug is passed through
			if (!menu_slug) {
				// Get menu slug and convert from (url friendly) dash to underscore
				menu_slug = generalFunctions.spacesToUnderscores(generalFunctions.dashesToSpacesAndCaps(this.state.paramMenuSlug));
			}
			// Select menu object using menu slug
			let selectedMenu = this.state.menus[menu_slug];
			// Check if menu object exist
			if (selectedMenu == undefined) {
				// If not, redirect to menu page
				this.props.history.push(this.props.basename + '/global/menu-manager');
			} else {
				this.original_current_menu_slug = selectedMenu.slug;
				this.setState({
					mode: "edit",
					selectedMenu
				}, () => {
					// Redirect to edit menu URL
					let url_param = generalFunctions.spacesToDashes(generalFunctions.underscoresToSpacesAndCaps(selectedMenu.slug));
					this.props.history.push(this.props.basename + '/global/menu-manager/edit/' + url_param);
				});
			}
    } else {
			this.setState({
				mode: "add",
				selectedMenu: null
			});
		}
  }

	_onMenuChange(action, data) {
		if (this.state.selectedMenu != null) {
			let treeData;
			let selectedMenu;
			switch (action) {
				case "add" :
					treeData = Array.from(this.state.selectedMenu.treeData);
					treeData.push(data);
					selectedMenu = Object.assign({}, this.state.selectedMenu, {treeData});
				break;
				case "update" :
					selectedMenu = Object.assign({}, data);
				break;
			}
			this.setState({selectedMenu});
		} else {
			MySwal.fire({
				title: "Select Menu",
				text: "Please select or create a menu.",
				showCloseButton: true
			})
		}
	}

	_createNewMenu() {
		this.setState({
			mode: "add",
			selectedMenu: {
				title: "",
				slug: "",
				classWrapper: "",
				classItem: "",
				classLink: "",
				publish: false,
				frontend: [
					{
						css: "",
						js: "",
					}
				],
				frontendIndex: 0,
				treeData: []
			}
		}, () => {
			this.props.history.push(this.props.basename + '/global/menu-manager');
		});
	}

	_closeMenu() {
		this.setState({
			mode: "add",
			selectedMenu: null
		}, () => {
			this.props.history.push(this.props.basename + '/global/menu-manager');
		});
	}

	_handleSave() {
		// Validation
		if (this.state.selectedMenu.title != "" && this.state.selectedMenu.title != " ") {
			// Clone menu
			let menus = Object.assign({}, this.state.menus);
			// Remove key from menu object if menu has been renamed
			if (this.state.mode == "edit" && this.original_current_menu_slug != this.state.selectedMenu.slug) {
				delete menus[this.original_current_menu_slug];
			}
			// Update menu object
			menus[this.state.selectedMenu.slug] = this.state.selectedMenu;
			// Make call to save menus
			makeCall.api("general/saveMenus/", {
				method: 'POST',
				body: makeCall.prepdata({
					json: JSON.stringify(menus)
				})
			}).then((response) => {
				if (response.success) {
					// On success update the original title name to detect future renames
					this.original_current_menu_slug = this.state.selectedMenu.slug;
					// Alert user that save has been completed
					this.props.store.dispatch({
						type: "NEW_ALERT",
						alert: {
							title: "Saved!",
							message: this.state.selectedMenu.title + " has been saved.",
							type: "success"
						}
					});
					// Only if preview mode is active
					if (this.app_state.global.preview.active) {
						this.props.store.dispatch({
							type: "UPDATE_PREVIEW",
							json: null,
							menu: this.state.selectedMenu
						});
					}
					// Reset flags
					this.menus_added_to_items = false;
					this.post_added_to_items = false;
					// Reset menuItems
					this.setState({
						menus: response.menus
					}, () => {
						// Redirect to edit menu URL
						let url_param = generalFunctions.spacesToDashes(generalFunctions.underscoresToSpacesAndCaps(this.state.selectedMenu.slug));
						this.props.history.push(this.props.basename + '/global/menu-manager/edit/' + url_param);
					});
				} else {
					MySwal.fire({
						title: "Error",
						text: response.message,
						showCloseButton: true
					})
				}
			});
		} else {
			MySwal.fire({
				title: "Validation Error",
				text: "Please enter menu name.",
				showCloseButton: true
			})
		}
	}

	_handleDelete(menu_slug) {
		MySwal.fire({
			title: "Remove Menu",
			text: "Are you sure you would like to remove this menu?",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonColor: '#4dbbde',
		}).then((result) => {
			if (result.value) {
				// Clone menu
				let menus = Object.assign({}, this.state.menus);
				// Remove key from menu object
				delete menus[menu_slug];
				// Make call to save menus
				makeCall.api("general/saveMenus/", {
					method: 'POST',
					body: makeCall.prepdata({
						json: JSON.stringify(menus)
					})
				}).then((response) => {
					if (response.success) {
						// Alert user that save has been completed
						this.props.store.dispatch({
							type: "NEW_ALERT",
							alert: {
								title: "Removed!",
								message: "Menu has been removed.",
								type: "success"
							}
						});
						// Reset flags
						this.menus_added_to_items = false;
						this.post_added_to_items = false;
						// Set menus and reset menuItems which will all the menu items to be added again since flags are set to false
						this.setState({
							menus: response.menus
						}, () => {
							// Redirect if needed
							if (this.state.paramMenuSlug != null) {
								let url_param = generalFunctions.spacesToUnderscores(generalFunctions.dashesToSpacesAndCaps(this.state.paramMenuSlug));
								if (menu_slug == url_param) {
									this.props.history.push(this.props.basename + '/global/menu-manager');
								}
							}
						});
					} else {
						MySwal.fire({
							title: "Error",
							text: response.message,
							showCloseButton: true
						})
					}
				});
			}
		});
	}

  render() {

		return (this.app_state.global.user != null && (this.app_state.global.user.role == "administrator" || this.app_state.global.user.role == "manager") ?
		<div className="container">
			<h2>Menu Manager</h2>
			<p className="lead">Navigate the path to your content.</p>
			<div className="row">
				<div className="col-md-12 col-lg-5 col-xl-4">
					<div className="ui-card">
						<div className="ui-card__title">
							<h3>Menus</h3>
							<div className="ui-card__title__menu">
								<button className="btn ui-btn" onClick={() => this._createNewMenu()}>Add Menu</button>
							</div>
						</div>
						<ul className="ui-navlist ui-navlist--menus list-group">
							{(Object.keys(this.state.menus).length == 0 ? 
								<p>You do not have any menus.</p>
							:
								Object.keys(this.state.menus).map((key, i) => {
									let menu = this.state.menus[key];
									return <li key={i} className="list-group-item">
										<button onClick={() => this._processLoad(menu.slug)}>{menu.title}</button>
										<button onClick={() => this._handleDelete(menu.slug)}><i className="icon ion-md-remove-circle-outline"></i></button>
									</li>
								})
							)}
						</ul>
					</div>
					<div className="ui-card">
						<div className="ui-card__title">
							<h3>Menu Items</h3>
						</div>
						<MenuItemInserts data={this.state.menuItems} onAddCallback={this._onMenuChange}/>
					</div>
				</div>
				<div className="col-md-12 col-lg-7 col-xl-8">
					<div className="ui-card">
						<div className="ui-card__title">
							<h3>Menu Editor</h3>
							<div className="ui-card__title__menu">
								{(this.state.selectedMenu != null ? <UISlider label="Publish" value={this.state.selectedMenu.publish} onChange={() => this._toggleActive()}/> : null)}
								{(this.state.selectedMenu != null ? <button className="btn ui-btn" onClick={() => this._handleSave()}>{(this.state.mode == "add" ? "Save" : "Update")}</button> : null)}
								{(this.state.selectedMenu != null ? <button className="btn ui-btn" onClick={() => this._closeMenu()}>Close</button> : null)}
							</div>
						</div>
						{(this.state.selectedMenu != null ? <MenuEditor menu={this.state.selectedMenu} onUpdate={this._onMenuChange} handleSave={this._handleSave}/> : <p>Please select an existing menu or <a className="btn-link" onClick={() => this._createNewMenu()}>create a new one</a>.</p>)}
					</div>
				</div>
			</div>
		</div>
		: null)
	}
}