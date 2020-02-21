import React from 'react';
import {
  SortableHandle,
  SortableContainer,
  SortableElement,
  arrayMove
} from 'react-sortable-hoc';
import UILayoutComponent from '../components/ui-layout-component';
import GeneralFunctions from '../utilities/general-functions';

import store from '../utilities/store';

/*
This component mimics the ui-layout-builder component as an input rather than page layout.
With modified adjustments as needed.
*/

const DragHanle = SortableHandle(() => <i className="ui-component-item-handle icon ion-md-menu"></i>);

const SortableItem = SortableElement(({indexKey, data, component, ignoredComponent, removeIgnoredComponent, mergeData, returnFrontend, onRemove, frontendIndex}) => {
  return <div key={indexKey} className="col-12 ui-component-item-wrapper">
    <DragHanle/>
    <button className="ui-component-item-btn btn ui-btn ui-btn-text" onClick={() => onRemove(indexKey)}>
      <i className="icon ion-md-remove-circle-outline"></i>
    </button>
    <UILayoutComponent index={indexKey} data={data} component={component} ignoredComponent={ignoredComponent} removeIgnoredComponent={removeIgnoredComponent} sendBackComponentData={mergeData} sendBackComponentFrontEnd={returnFrontend} frontendIndex={frontendIndex} isFieldtype={true}/>
  </div>
});

const SortableList = SortableContainer(({json, components, removeIgnoredComponent, mergeData, returnFrontend, onRemove}) => {
  return (
    <div className="row">
      {
        json.order.map((component_name, index) => {

          // Get the component data needed for UILayoutComponent
          let component = false;
          components.map((component_location_data, i) => {
            if (component_location_data.slug == component_name) {
              component = component_location_data;
            }
          });
          
          // Proceed only if we've found component
          if (component) {

            // Default data unless found
            let ignoredComponent = null;
            let data = {};
            let frontendIndex = 0;
            
            // Several conditional checks to make sure ignored data exist
            if (json.ignored_data !== undefined) {
              if (json.ignored_data[component.slug] !== undefined && Object.keys(json.ignored_data[component.slug]).length) {
                if (json.ignored_data[component.slug][index] !== undefined) {
                  // Pull and provide ignored data for component
                  ignoredComponent = json.ignored_data[component.slug][index];
                }
              }
            }

            // Several conditional checks to make sure data exist
            if (json.data !== null && typeof json.data === 'object') {
              if (json.data[component.slug] !== undefined && Object.keys(json.data[component.slug]).length) {
                if (json.data[component.slug][index] !== undefined) {
                  // Pull and provide data for component
                  data = json.data[component.slug][index];
                }
              }
            }

            // Several conditional checks to make sure frontend exist
            if (json.frontend !== null) {
              if (json.frontend[component.slug] !== undefined && Object.keys(json.frontend[component.slug]).length) {
                if (json.frontend[component.slug][index] !== undefined) {
                  // Pull and provide data for frontend
                  frontendIndex = json.frontend[component.slug][index].frontendIndex;
                }
              }
            }

            // Return built component with fields
            return <SortableItem key={'item-'+index} index={index} indexKey={index} data={data} component={component} ignoredComponent={ignoredComponent} removeIgnoredComponent={removeIgnoredComponent} mergeData={mergeData} returnFrontend={returnFrontend} onRemove={onRemove} frontendIndex={frontendIndex}/>;
          }
        })
      }
    </div>
  );
});

export default class InputComponents extends React.Component {

  constructor(props) {
    super(props);

    this._removedIgnoredData = this._removedIgnoredData.bind(this);
    this._mergeIntoComponentData = this._mergeIntoComponentData.bind(this);
    this._handleComponentData = this._handleComponentData.bind(this);
    this._handleComponentFrontEnd = this._handleComponentFrontEnd.bind(this);
    this._insertComp = this._insertComp.bind(this);
    this._removeComp = this._removeComp.bind(this);
    this._onSortEnd = this._onSortEnd.bind(this);
    this._processOrder = this._processOrder.bind(this);
    this._onChange = this._onChange.bind(this);
    
		this.state = {
      components: this.props.options.components,
      json: (this.props.value != null ? Object.assign({}, {
        order: [],
        data: null,
        frontend: null
      }, this.props.value) : { // Restore data if provided or start blank
        order: [],
        data: null,
        frontend: null
      })
		}
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.components = nextProps.options.components;
    temp_state.json = Object.assign({}, {
      order: [],
      data: null,
      frontend: null
    }, nextProps.value);
    return temp_state;
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
    this._onChange(json);
  }

  _mergeIntoComponentData(slug, index, data, ignored_data = null) {

    /******* Data Build*******/
    // Create temporary index key
    let temp_index = {};
    if (ignored_data != null && this.state.json.data != null && this.state.json.data[slug] != undefined && this.state.json.data[slug][index] != undefined) {
      data = Object.assign({}, this.state.json.data[slug][index], data);
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

    this._onChange(json);
  }
  
  _handleComponentFrontEnd(component_slug, component_index, component_frontend) {
    this.app_state = store.getState();
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
      // Send data back to components field
      this._onChange(json);
    }
  }

  _insertComp(component) {
    let order = Array.from(this.state.json.order);
    order.push(component);

    let json = Object.assign({}, this.state.json, {
      order
    });

    this._onChange(json);
  }

  _removeComp(index) {
    this._processOrder("remove", {
      index
    })
  }

  _onSortEnd({oldIndex, newIndex}) {
    this._processOrder("reorder", {
      oldIndex,
      newIndex
    })
  }

  _processOrder(process, params) {
    // Create temporary container where data is stored in current order
    let temp_container = [];
    // Duplicate original order array
    let old_order = Array.from(this.state.json.order);
    // Loop through original order to fill temporary container
    old_order.map((component_slug, index) => {
      let value = null;
      // Check if data exist
      if (this.state.json.data[component_slug] != undefined) {
        value = Object.assign({}, this.state.json.data[component_slug][index])
      }
      temp_container.push({
        slug: component_slug,
        value
      });
    })
    // Determine the process taken
    let sorted_container;
    if (process == "reorder") {
      // Reorder original order to new order 
      sorted_container = arrayMove(temp_container, params.oldIndex, params.newIndex);
    } else if (process == "remove") {
      // Remove from original order
      temp_container.splice(params.index, 1);
      sorted_container = temp_container;
    }
    // Blank values to replace within the json object
    let data = {};
    let order = [];
    // User new order to recreate the data and order objects
    sorted_container.map((temp_data, index) => {
      // Create temporary index object
      let index_obj = {};
      index_obj[index] = temp_data.value;
      // Check if component key exist
      if (temp_data.slug in data) {
        // If so, merge data so we do not lose previously added data
        data[temp_data.slug] = Object.assign({}, data[temp_data.slug], index_obj);
      } else {
        // Else, just create the key with the necessary index object and value
        data[temp_data.slug] = index_obj;
      }
      // Add component in it's new order
      order.push(temp_data.slug);
    })
    // Update state object
    let json = Object.assign({}, this.state.json, {
      data,
      order
    });
    // Update parent values which in turn, will update this component
    this._onChange(json);
  }

  _onChange(value) {
    this.app_state = store.getState();

    let return_data;

    if (this.app_state.global.adminView == "stash-editor") {
      // If we're editing an stash, frontend data is not needed
      delete value.frontend;
    }

    if (this.props.useKey) {
      return_data = {};
      return_data[this.props.inputKey] = value;
    } else {
      return_data = value;
    }
    
    if (typeof this.props.returnValue === 'function') {
      this.props.returnValue(return_data);
    }
  }

  render() {

    let list = null;

    if (this.state.json.order.length) {
      list = <SortableList json={this.state.json} components={this.state.components} removeIgnoredComponent={this._removedIgnoredData} mergeData={this._mergeIntoComponentData} returnFrontend={this._handleComponentFrontEnd} onRemove={this._removeComp} useDragHandle={true} onSortEnd={this._onSortEnd}/>;
    } else {
      list = <div className="ui-component-item__message">You have no components listed.</div>
    }

    return (
      <div className="ui-components-wrapper">
        <div className="ui-components-inside-wrapper">
          {list}
          <div className="ui-components-inserter">
            {this.state.components.map((component, i) => {
              return <button key={i} className="btn ui-btn" onClick={() => this._insertComp(component.slug)}>{GeneralFunctions.underscoresToSpacesAndCaps(component.slug)}</button>
            })}
          </div>
        </div>
      </div>
    );
  }
}

