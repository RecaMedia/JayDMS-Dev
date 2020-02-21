const global_state = {
	adminPath: "/cp",
	lastAction: null,
	adminView: null,
	user: null,
	postTypes: [],
	stashes: [],
	alerts: [],
	preview: {
		active: false,
		json: null,
		menu: null,
		refreshing: false,
	}
}

export default function(state = global_state, action) {

	state = Object.assign({}, state, {
		lastAction: action.type
	})

	switch (action.type) {

		case "TOGGLE_PREVIEW" : {

			state = Object.assign({}, state, {
				preview: Object.assign({}, state.preview, {
					active: (action.active != undefined ? action.active : state.preview.active)
				})
			});

			break;
		}

		case "UPDATE_PREVIEW" : {

			state = Object.assign({}, state, {
				preview: Object.assign({}, state.preview, {
					json: (action.json != undefined ? action.json : state.preview.json),
					menu: (action.menu != undefined ? action.menu : state.preview.menu),
					refreshing: true
				})
			});

			break;
		}

		case "REFRESH_PREVIEW_COMPLETE" : {

			state = Object.assign({}, state, {
				preview: Object.assign({}, state.preview, {
					refreshing: false
				})
			});

			break;
		}

		case "SET_USER" : {
			
			state = Object.assign({}, state, {
				user: action.user
			});

			break;
		}

		case "SET_ADMIN_VIEW" : {
			
			state = Object.assign({}, state, {
				adminView: action.adminView
			});

			break;
		}
		
		case "UPDATE_POSTTYPES" : {
			
			state = Object.assign({}, state, {
				postTypes: action.postTypes
			});

			break;
		}

		case "UPDATE_STASHES" : {
			
			state = Object.assign({}, state, {
				stashes: action.stashes
			});

			break;
		}
		
		case "NEW_ALERT" : {

			// Clone current array
			let prev_alerts = Array.from(state.alerts);
			// Add new alert to array
			prev_alerts.push(action.alert);
			// Get index to remove alert later
			let index = prev_alerts.length - 1;
			// Update state with latest alert
			state = Object.assign({}, state, {
				alerts: prev_alerts
			});
			// Set a 5 second delay before making a call to remove the alert just added
			setTimeout(() => {
				action.asyncDispatch({
					type: "REMOVE_ALERT",
					index
				});
			}, 5000)

			break;
		}
		
		case "REMOVE_ALERT" : {

			// Clone current array
			let prev_alerts = Array.from(state.alerts);
			// If count is greater than one then use splice to remove, else just create blank array
			if (prev_alerts.length > 1) {
				prev_alerts.splice(action.index, 1);
			} else {
				prev_alerts = [];
			}
			// Update state with updated list of alerts
			state = Object.assign({}, state, {
				alerts: prev_alerts
			});

			break;
    }
	}
	
	return state;
}