const portal_state = {
  container: {}
}

export default function(state = portal_state, action) {

	switch (action.type) {

		case "PORTAL_FRONTEND" : {
      
      let frontend = action.frontend;

      state = Object.assign({}, state, {
        container: {
          frontend
        }
      })

			break;
    }
    
    case "PORTAL_CLEAR" : {

      state = Object.assign({}, state, {
        container: {}
      })

			break;
		}
	}
	
	return state;
}