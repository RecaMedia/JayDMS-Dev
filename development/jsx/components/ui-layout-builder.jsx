import React from 'react';
import GeneralFunctions from '../utilities/general-functions';
import history from '../utilities/history';
import UILayoutComponent from './ui-layout-component';
import SyncComponents from './sync-components';

import store from '../utilities/store';

export default class UILayoutBuilder extends React.Component {

  constructor(props) {
    super(props);

    this.app_state = store.getState();
    
    this._checkSync = this._checkSync.bind(this);
    this._buildOrder = this._buildOrder.bind(this);
    this._removedIgnoredData = this._removedIgnoredData.bind(this);
    this._mergeIntoComponentData = this._mergeIntoComponentData.bind(this);
    this._handleComponentData = this._handleComponentData.bind(this);
    this._handleComponentFrontEnd = this._handleComponentFrontEnd.bind(this);
    this._sendBackContent = this._sendBackContent.bind(this);
    this._buildOrder = this._buildOrder.bind(this);

		this.state = {
      checkSync: false,
      synced: true,
      components: this.props.components,
      dyComp:(this.props.dyComp != undefined ? this.props.dyComp : false),
      json: (this.props.json != null ? this.props.json : { // Restore data if provided or start blank
        order: [],
        data: null,
        frontend: null
      })
		}
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.components = nextProps.components;

    if (nextProps.dyComp != undefined) {
      temp_state.dyComp = nextProps.dyComp;
    }
    if (nextProps.json != null) {
      temp_state.json = nextProps.json;
    }
    
    return temp_state;
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.app_state = store.getState();
      if (this.app_state.global.lastAction === "PORTAL_FRONTEND") {
        this._handleComponentFrontEnd(this.app_state.portal.container.frontend);
        store.dispatch({type: "PORTAL_CLEAR"});
			}
    });
    
    this._checkSync();
  }

  componentDidUpdate(prevProps, prevState) {
    
    if (this.state.json != null && !prevState.checkSync) {
      // Check if template and post are synced
      this._checkSync();
    }
  }

  componentWillUnmount() {
		this.unsubscribe();
	}

  // This function checks if data matches curret component structures
  _checkSync() {
    if (this.state.json.data != null) {
      let synced = true;

      Object.keys(this.state.json.data).map((slug) => {
        Object.keys(this.state.json.data[slug]).map((field) => {
          if (this.state.components[field] != undefined) {
            if (this.state.components[field].slug !== slug) {
              synced = false;
            }
          }
        });
      });

      this.setState({
        checkSync: true,
        synced
      }, () => {
        this._buildOrder();
      });
    }
  }

  _buildOrder() {
    // Defaults
    let order = [];

    this.state.components.map((component, i) => {
      // Push component slug into order list
      order.push(component.slug);
    });

    // Set order list
    let json = Object.assign({}, this.state.json, {
      order
    });

    this._sendBackContent(json);
  }

  _removedIgnoredData(slug, index = null, field_name = null) {
    let json;
    // Clone existing ignored data
    let ignored_data = Object.assign({}, this.state.json.ignored_data);
    // Field is provided, so this is a detailed removal
    if (index != null || field_name != null) {
      // Check if component slug exist
      if (ignored_data[slug] != undefined) {
        // Check if index exist
        if (ignored_data[slug][index] != undefined) {
          // Check if field exist
          if (ignored_data[slug][index][field_name] != undefined) {
            // Delete data
            delete ignored_data[slug][index][field_name];
          }
          // If no more data exist for specified field, delete component slug
          if (Object.keys(ignored_data[slug][index]).length == 0) {
            delete ignored_data[slug];
          }
        }
      }
    } else {
      // Check if component slug exist
      if (ignored_data[slug] != undefined) {
        delete ignored_data[slug];
      }
    }

    // Check if other component slugs exist, if so, merge current data
    if (Object.keys(ignored_data).length) {
      json = Object.assign({}, this.state.json, {
        ignored_data
      });
    // Else, delete ignored_data key
    } else {
      json = Object.assign({}, this.state.json);
      delete json.ignored_data;
    }

    // Send back json data
    this._sendBackContent(json);
  }

  _mergeIntoComponentData(slug, index, data, ignored_data = null) {

    /******* Data Build*******/
    // Create temporary index key
    let temp_index = {};
    if (ignored_data != null && this.state.json.data != null && this.state.json.data[slug] != undefined && this.state.json.data[slug][index] != undefined) {
      data = Object.assign({}, this.state.json.data[slug][index], data);
      // Removing existing data that is considered ignored
      Object.keys(ignored_data).map((slug) => {
        delete data[slug];
      });
    }
    temp_index[index] = data
    // Merge existing index data or just pass up the new object
    let merged_slug;
    if (this.state.json.data != null && this.state.json.data[slug] != undefined) {
      merged_slug = Object.assign({}, this.state.json.data[slug], temp_index);
    } else {
      merged_slug = temp_index
    }
    // Put into slug
    let temp_slug = {}
    temp_slug[slug] = merged_slug
    let merged_data = Object.assign({}, this.state.json.data, temp_slug);

    /******* Ignore Build*******/
    let merged_ignored_data = null;
    // Check for empty ignore object
    if (ignored_data != null && Object.keys(ignored_data).length > 0) {
      // Create temporary index key
      let ig_temp_index = {};
      ig_temp_index[index] = ignored_data
      // Merge existing index data or just pass up the new object
      let ig_merged_slug;
      if (this.state.json.ignored_data != null && this.state.json.ignored_data[slug] != undefined) {
        ig_merged_slug = Object.assign({}, this.state.json.ignored_data[slug], ig_temp_index);
      } else {
        ig_merged_slug = ig_temp_index
      }
      // Put into slug
      let ig_temp_slug = {}
      ig_temp_slug[slug] = ig_merged_slug
      merged_ignored_data = Object.assign({}, this.state.json.ignored_data, ig_temp_slug);
    }

    this._handleComponentData(merged_data, merged_ignored_data);
  }

  _handleComponentData(data, ignored_data = null) {
    
    let json = Object.assign({}, this.state.json, {
      data
    });

    if (ignored_data != null) {
      json = Object.assign({}, json, {
        ignored_data: Object.assign({}, (this.state.json.ignored_data != undefined ? this.state.json.data.ignored_data : {}), ignored_data)
      });
    }

    this.setState({
      checkSync: false,
      synced: true
    }, () => {
      this._sendBackContent(json);
    });
  }

  _handleComponentFrontEnd(component_slug, component_index, component_frontend) {
    // Only send frontend data for post types only
    if (this.app_state.global.adminView != "stash-editor") {
      // Merge existing frontend data for specified component slug and index if found
      if (this.state.json.frontend != null && this.state.json.frontend[component_slug] != undefined && this.state.json.frontend[component_slug][component_index] != undefined) {
        component_frontend = Object.assign({}, this.state.json.frontend[component_slug][component_index], component_frontend);
      }
      // Create temp index-key data
      let temp_index = {};
      temp_index[component_index] = component_frontend;
      let temp_component_slug = temp_index
      // Merge existing index data for specified component slug if found
      if (this.state.json.frontend != null && this.state.json.frontend[component_slug] != undefined) {
        temp_component_slug = Object.assign({}, this.state.json.frontend[component_slug], temp_index);
      }
      // Create temp slug-key
      let temp_components = {};
      temp_components[component_slug] = temp_component_slug;
      // Merge existing frontend or just pass up the new object
      let frontend;
      if (this.state.json.frontend != null) {
        frontend = Object.assign({}, this.state.json.frontend, temp_components);
      } else {
        frontend = temp_components
      }
      // Merge into JSON object
      let json = Object.assign({}, this.state.json, {frontend});
      // Send data back to post editor
      this._sendBackContent(json);
    }
  }

  _sendBackContent(json) {
    if (typeof this.props.handleContent === 'function') {
      this.props.handleContent(json)
    }
  }

  _buildUI() {
    let content = <div>
      {
        this.state.components.map((component, i) => {

          let ignoredComponent = null;
          let data = null;
          let frontendIndex = 0;
          
          // Several conditional checks to make sure ignored data exist
          if (this.state.json.ignored_data !== undefined) {
            if (this.state.json.ignored_data[component.slug] !== undefined && Object.keys(this.state.json.ignored_data[component.slug]).length) {
              if (this.state.json.ignored_data[component.slug][i] !== undefined) {
                // Pull and provide ignored data for component
                ignoredComponent = this.state.json.ignored_data[component.slug][i];
              }
            }
          }

          // Several conditional checks to make sure data exist
          if (this.state.json.data !== null) {
            if (this.state.json.data[component.slug] !== undefined && Object.keys(this.state.json.data[component.slug]).length) {
              if (this.state.json.data[component.slug][i] !== undefined) {
                // Pull and provide data for component
                data = this.state.json.data[component.slug][i];
              }
            }
          }

          // Several conditional checks to make sure frontend exist
          if (this.state.json.hasOwnProperty("frontend") && this.state.json.frontend !== null) {
            if (this.state.json.frontend[component.slug] !== undefined && Object.keys(this.state.json.frontend[component.slug]).length) {
              if (this.state.json.frontend[component.slug][i] !== undefined) {
                // Pull and provide data for frontend
                frontendIndex = this.state.json.frontend[component.slug][i].frontendIndex;
              }
            }
          }

          // Return built component with fields
          return <UILayoutComponent key={i} index={i} data={data} component={component} ignoredComponent={ignoredComponent} removeIgnoredComponent={this._removedIgnoredData} sendBackComponentData={this._mergeIntoComponentData} sendBackComponentFrontEnd={this._handleComponentFrontEnd} frontendIndex={frontendIndex} isFieldtype={false}/>
        })
      }
    </div>

    if (this.state.checkSync && !this.state.synced) {   
      content = <SyncComponents data={this.state.json.data} components={this.state.components} sendBackComponentData={this._handleComponentData}/>
    }
    
    return content;
  }

  render() {
    return this._buildUI();
  }
}

