import React from 'react';
import MakeCall from '../utilities/make-call';
import GeneralFunctions from '../utilities/general-functions';
import UIField from './ui-field';
import SyncFields from './sync-fields';
import store from '../utilities/store';

export default class UILayoutComponent extends React.Component {

  constructor(props) {
    super(props);

    this.componentRef = React.createRef();
    
    this._loadComponent = this._loadComponent.bind(this);
    this._updateFieldfromInput = this._updateFieldfromInput.bind(this);
    this._useIgnoredData = this._useIgnoredData.bind(this);
    this._removedIgnoredData = this._removedIgnoredData.bind(this);
    this._buildIgnoreList = this._buildIgnoreList.bind(this);
    this._setABIndex = this._setABIndex.bind(this);
    this._sendBackComponentData = this._sendBackComponentData.bind(this);
    this._updateUnsyncData = this._updateUnsyncData.bind(this);
    this._sendBackComponentFrontEnd = this._sendBackComponentFrontEnd.bind(this);

    // Check if data is being provided to set as a default within state
    let returnJSON = null;
    if (this.props.data != null) {
      returnJSON = this.props.data[this.props.index];
    }

		this.state = {
      checkSync: false,
      synced: true,
      syncUpdate: false,
      getting_component: false,
      index: this.props.index,
      data: this.props.data,
      ignoredComponent: this.props.ignoredComponent,
      missingFields: null,
      component: this.props.component,
      componentJSON: null,
      returnJSON,
      frontendIndex: this.props.frontendIndex
		}
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.index = nextProps.index;
    temp_state.data = nextProps.data;
    temp_state.ignoredComponent = nextProps.ignoredComponent;
    temp_state.component = nextProps.component;
    temp_state.frontendIndex = nextProps.frontendIndex;

    // Check if data is being provided to set as a default within state
    if (nextProps.data != null) {
      temp_state.returnJSON = nextProps.data[nextProps.index];
    }

    return temp_state;
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.app_state = store.getState();
      if (this.app_state.global.lastAction === "GET_FRONTEND_DATA_BEFORE_SAVE") {
        this._loadComponent();
			}
		});

    this._loadComponent();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.componentJSON != null && prevState.componentJSON.slug != this.state.component.slug) {
      this.setState({
        getting_component: false,
        componentJSON: null
      }, () => {
        this._loadComponent();
      });
    }

    if (!this.state.checkSync && !this.state.synced && this.state.syncUpdate) {
      this._loadComponent();
    }
  }

  componentWillUnmount() {
		this.unsubscribe();
  }
  
  // This function checks if data matches curret component structures
  _checkSync(state_updates) {
    // Defaults
    let synced = true;
    let field_list = {};
    let merged_state_updates;

    if (this.state.data != null) {
      // Loop through each field
      Object.keys(this.state.data).map((field_name) => {
        // Field flag
        let field_found_for_data = false;
        // Check if field exist for field data
        state_updates.componentJSON.fields.map((field) => {
          if (field.title == field_name) {
            field_found_for_data = true;
          }
        })
        // If not, lets store the data
        if (!field_found_for_data) {
          // Update flag to let user know data is not synced
          synced = false;
          // Store data
          field_list[field_name] = this.state.data[field_name];
        }
      });
      // Merge with current ignored data, if any
      let missingFields = Object.assign({}, (this.state.missingFields == null || this.state.missingFields == undefined ? {} : this.state.missingFields), field_list);
      // Update state object
      merged_state_updates = Object.assign({}, state_updates, {
        checkSync: true,
        synced,
        syncUpdate: false,
        missingFields
      });
    } else {
      merged_state_updates = Object.assign({}, state_updates, {
        checkSync: true,
        synced,
        syncUpdate: false
      });
    }
    // Update state
    if (this.componentRef.current) {
      this.setState(merged_state_updates);
    }
  }

  _loadComponent() {
    // This process prevents updates while updating
    if (!this.state.getting_component) {
      this.setState({
        getting_component: true
      }, () => {
        // Get component data
        MakeCall.api("components/load/", {
          method: 'POST',
          body: MakeCall.prepdata({
            slug: this.state.component.slug
          })
        }).then((response) => {
          if (response.success) {
            // Clone component data
            let component_data = Object.assign({}, response.component);
            // Check if chosen version for frontend still exist, if not, default to original with index 0
            let frontendIndex;
            if (component_data.frontend[this.state.frontendIndex] != undefined) {
              frontendIndex = this.state.frontendIndex;
            } else {
              frontendIndex = 0;
            }
            // Recreate component data structure that will be sent back to parent component
            let component_frontend = Object.assign({}, component_data.frontend[frontendIndex], {
              frontendIndex
            });
            // Send back frontend component data
            this._sendBackComponentFrontEnd(component_frontend);
            // Check for node element
            if (this.componentRef.current) {
              // Create state object that will get updated within checkSync
              let state_updates = {
                getting_component: false,
                componentJSON: response.component,
              };
              // Check if this ui-layout-component builder is being used as a fieldType
              if (!this.props.isFieldtype) {
                store.dispatch({
                  type: "FRONTEND_DATA_RETRIEVED"
                });
              } else {
                store.dispatch({
                  type: "CANCEL_FRONTEND_SAVELOOP"
                });
              }
              // chech if data is in sync with structure
              this._checkSync(state_updates);
            }
          } else {
            this.setState({getting_component: false});
          }
        });
      });
    }
  }

  _updateFieldfromInput(field, data) {
    // Only allow field updates if checkSync was done
    if (!this.props.syncUpdate) {
      // Clone returnJSON object
      let returnJSON = Object.assign({}, this.state.returnJSON);
      // Update correct field
      returnJSON[field] = data;
      // Merge previous data if it exist
      if (this.state.data != null) {
        returnJSON = Object.assign({}, this.state.data, returnJSON);
      }
      // Send back data
      this._sendBackComponentData(returnJSON);
    }
  }

  _useIgnoredData(select_id, value) {
    let data = Object.assign({}, this.state.data);
    data[document.getElementById(select_id).value] = value;
    this._sendBackComponentData(data);
  }

  _removedIgnoredData(slug, index = null, field_name = null) {
    if (typeof this.props.removeIgnoredComponent === 'function') {
      this.props.removeIgnoredComponent(slug, index, field_name);
    }
  }

  _buildIgnoreList() {
    let ignored_fields = null;
    
    if (this.state.ignoredComponent != null && this.state.componentJSON != null) {
      ignored_fields = <div className="ui-card__ignored-list">
        <strong>Previously Ignored Matching Component Data</strong>
        <div className="ui-card__ignored-group">
          <button className="btn btn-danger" onClick={() => this._removedIgnoredData(this.state.component.slug)}>Delete Group Data</button>
          <ul className="list-group">
            {
              Object.keys(this.state.ignoredComponent).map((field_name, i) => {
                let select_id = field_name+"_"+i;
                let field_value = this.state.ignoredComponent[field_name];
                let string_name = field_value;
                if (typeof field_value === 'object' || typeof field_value === 'array') {
                  string_name = "data";
                }
                return <li key={i} className="list-group-item">
                  <strong>{field_name}:</strong> {string_name}
                  <div className="ui-card__ignored-item-action">
                    <select id={select_id}>
                      <option value="">Select Field</option>
                      {
                        this.state.componentJSON.fields.map((field, i) => {
                          return <option key={i} value={field.slug}>{field.title}</option>
                        })
                      }
                    </select>
                    <button className="btn btn-danger" type="button" onClick={() => this._removedIgnoredData(this.state.component.slug, this.state.index, field_name)}>Delete Data</button>
                    <button className="btn ui-btn" type="button" onClick={() => this._useIgnoredData(select_id, field_value)}>Use Data</button>
                  </div>
                </li>
              })
            }
          </ul>
        </div>
      </div>
    }

    return ignored_fields;
  }

  _setABIndex(frontendIndex) {
    // Recreate component data structure
    let component_frontend = {}
    component_frontend = Object.assign({}, this.state.componentJSON.frontend[frontendIndex], {
      frontendIndex
    });
    // Send back frontend data
    this._sendBackComponentFrontEnd(component_frontend);
  }

  _sendBackComponentData(data, ignored_data = null) {
    // Send back component data
    if (typeof this.props.sendBackComponentData === 'function') {
      this.props.sendBackComponentData(this.state.component.slug, this.state.index, data, ignored_data);
    }
  }

  _updateUnsyncData(data, ignored_data = null) {
    // Reset check sync since we're getting an update from SyncField component
    this.setState({
      checkSync: false,
      synced: false,
      syncUpdate: true,
    }, () => {
      // Send back component data
      if (typeof this.props.sendBackComponentData === 'function') {
        this.props.sendBackComponentData(this.state.component.slug, this.state.index, data, ignored_data);
      }
    });
  }

  _sendBackComponentFrontEnd(frontend) {
    if (typeof this.props.sendBackComponentFrontEnd === 'function') {
      this.props.sendBackComponentFrontEnd(this.state.component.slug, this.state.index, frontend);
    }
  }

  render() {

    // Build UI fields
    let ui_fields = null;
    if (this.state.componentJSON != null) {
      ui_fields = <div className="ui-input-fields row">
        {
          this.state.componentJSON.fields.map((field, i) => {
            // Build return object with keys and values
            let values = (this.state.data != null ? this.state.data[field.title] : null);
            // Build UI items
            // Force full width if "components" field type is found
            return <div key={i} className={"ui-input " + (Object.keys(field.form).includes("components") ? "col-lg-12" : field.meta.ui_size)}>
              <UIField field={field} values={values} updateFieldfromInput={this._updateFieldfromInput}/>
            </div>
          })
        }
      </div>;
    }

    // UI layout
    let content = (this.state.component.slug != undefined ? 
      <div ref={this.componentRef} className="ui-card">
        <h5>
          {GeneralFunctions.underscoresToSpacesAndCaps(this.state.component.slug)}
          {(this.state.componentJSON != null ? 
            <div className="ui-card__version-menu">
              {this.state.componentJSON.frontend.map((data,i) => {
                let attr = {};
                if (this.state.frontendIndex == i) {
                  attr.className = "ui-card__version-menu--selected";
                }
                return <button {...attr} key={i} onClick={() => this._setABIndex(i)}>{(i == 0 ? "Original" : "v"+(i+1))}</button>
              })}
            </div>
          : null)}
        </h5>
        {ui_fields}
        {this._buildIgnoreList()}
      </div>
    : null);

    // Sync field check
    if (this.state.checkSync && !this.state.synced && this.state.componentJSON != null) {
      content = <SyncFields componentIndex={this.state.index} componentData={this.state.missingFields} availableFields={this.state.componentJSON.fields} sendBackComponentData={this._updateUnsyncData}/>
    }

    // Return content
    return content;
  }
}

