import React from 'react';
import SizeSelector from './size-selector';

import ComponentsOptions from '../fieldtype-options/components';
import DateOptions from '../fieldtype-options/date';
import EditorOptions from '../fieldtype-options/editor';
import GroupOptions from '../fieldtype-options/group';
import RepeaterOptions from '../fieldtype-options/repeater';
import RadioOptions from '../fieldtype-options/radio';
import SelectOptions from '../fieldtype-options/select';
import FileOptions from '../fieldtype-options/file';

import GeneralFunctions from '../utilities/general-functions';

export default class FieldType extends React.Component {

  constructor(props) {
    super(props);
    
    this._toggle = this._toggle.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._buildOptions = this._buildOptions.bind(this);
    this._handleRemove = this._handleRemove.bind(this);
    this._setSizeOptions = this._setSizeOptions.bind(this);

		this.state = {
      hide_size: false,
      fieldType: this.props.fieldType,
      ui_index: (this.props.fieldType.meta.ui_index==null?0:this.props.fieldType.meta.ui_index),
      ui_size: (this.props.fieldType.meta.ui_size==null?"col-lg-12":this.props.fieldType.meta.ui_size),
      size: "100"
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.fieldType = nextProps.fieldType;
    temp_state.ui_index = (nextProps.fieldType.meta.ui_index==null?0:nextProps.fieldType.meta.ui_index),
    temp_state.ui_size = (nextProps.fieldType.meta.ui_size==null?"col-lg-12":nextProps.fieldType.meta.ui_size);
    return temp_state;
  }

  componentDidMount() {
    // Preform check for "components" input type
    const keys = Object.keys(this.state.fieldType.form);
    if (keys.length == 1) {
      if (this.state.fieldType.form[keys[0]].input == "components") {
        this.setState({hide_size: true});
      }
    } else {
      let hide_size = false;
      keys.map((key, i) => {
        if (this.state.fieldType.form[key].input == "components") {
          hide_size = true;
        }
      });
      if (hide_size) {
        this.setState({hide_size});
      }
    }
  }

  _toggle() {
    this._handleChange('toggle', (this.state.fieldType.meta.ui_toggle?false:true));
  }

  _handleChange(type, value) {
    let fieldType;

    // Update data based on data type within FieldType object
    switch (type) {
      case 'title':
        fieldType = Object.assign({}, this.state.fieldType, {
          title: GeneralFunctions.spacesToUnderscores(value)
        });
      break;
      case 'size':
        this.setState({
          ui_size: value
        });
        fieldType = Object.assign({}, this.state.fieldType, {
          meta: Object.assign({}, this.props.fieldType.meta, {
            ui_size: value
          })
        });
      break;
      case 'value':
        fieldType = Object.assign({}, this.state.fieldType, {
          form: Object.assign({}, this.state.fieldType.form, value)
        });
      break;
      case 'toggle':
        fieldType = Object.assign({}, this.state.fieldType, {
          meta: Object.assign({}, this.props.fieldType.meta, {
            ui_toggle: value
          })
        });
      break;
    }

    // Update FieldType object to parent which in return will update this state
    if (typeof this.props.onMetaUpdate === "function") {
      this.props.onMetaUpdate(fieldType);
    }
  }
  
  _handleRemove() {
    // Let parent know to remove FieldType
    if (typeof this.props.onRemove === "function") {
      this.props.onRemove(this.state.fieldType.meta.ui_index);
    }
  }

  _buildOptions() {
    let response = false;

    // Private function to create a dropdown option within the FieldType
    const createDrop = (data) => {
      let name = null;
      let content = null;

      // Switch based on Options type
      switch(data.input) {
        case "components" :
          name = "Components";
          content = <ComponentsOptions data={data} handleChange={this._handleChange}/>;
        break;
        case "datetime" :
          name = "Date Options";
          content = <DateOptions data={data} handleChange={this._handleChange}/>;
        break;
        case "editor" :
          name = "Editor Options";
          content = <EditorOptions data={data} handleChange={this._handleChange}/>;
        break;
        case "group" :
          name = "Field Types";
          content = <GroupOptions data={data} handleChange={this._handleChange}/>;
        break;
        case "repeater" :
          name = "Field Types";
          content = <RepeaterOptions data={data} handleChange={this._handleChange}/>;
        break;
        case "radio" :
          name = "Selections";
          content = <RadioOptions data={data} handleChange={this._handleChange}/>;
        break;
        case "select" :
          name = "Selections";
          content = <SelectOptions data={data} handleChange={this._handleChange}/>;
        break;
        case "file" :
          name = "File Options";
          content = <FileOptions data={data} handleChange={this._handleChange}/>;
        break;
      }

      // Return dropdown content
      if (name != null && content != null) {
        return {
          name,
          content
        };
      } else {
        return false;
      }
    }

    // Private function to process key and it's data to determine if dropdown option is needed
    const process = (key, obj) => {
      // Create data object used for creating options
      let data = Object.assign({}, obj, {
        key
      });
      // Only create if the following inputs are found
      if (
        (obj.input == "components" && typeof obj.value === 'object') || 
        ((obj.input == "datetime" || obj.input == "datepicker") && typeof obj.value === 'string') || // Legacy input added because of caching issues
        (obj.input == "editor" && typeof obj.value === 'string') || 
        (obj.input == "group" && typeof obj.value === 'object') || 
        (obj.input == "repeater" && Array.isArray(obj.value)) || 
        (obj.input == "radio" && typeof obj.value === 'string') || 
        ((obj.input == "select" || obj.input == "dropdown") && typeof obj.value === 'string') || // Legacy input added because of caching issues
        (obj.input == "file" && typeof obj.value === 'string')
      ) {
        return createDrop(data);
      } else {
        return null;
      }
    }

    // Get keys from FieldType object
    const keys = Object.keys(this.state.fieldType.form);

    // Process every key within FieldType's object
    if (keys.length == 1) {
      response = process(keys[0], this.state.fieldType.form[keys[0]]);
    } else {
      let options_count = 0;
      let mult_content = <div>
        {
          keys.map((key, i) => {
            let option = process(key, this.state.fieldType.form[key]);
            if (option) {
              options_count++;
            }
            return <div key={i} id={key + "_options"}>
              {option}
            </div>
          })
        }
      </div>;
      if (options_count) {
        response = {
          name: "Options",
          content: mult_content
        };
      }
    }

    return response;
  }

  _setSizeOptions() {
    let found = false;
    Object.keys(this.state.fieldType.form).map((key, i) => {
      let sub_field = this.state.fieldType.form[key];
      if (sub_field.input == "group") {
        found = true;
      } else if (sub_field.input == "repeater") {
        found = true;
      } else if (sub_field.input == "code") {
        found = true;
      } else if (sub_field.input == "components") {
        found = true;
      }
    });

    return found;
  }

  render() {
    let options_build = this._buildOptions();
    let options = null;

    if (options_build) {
      options = <div className={"ui-fieldtype__form-content"+(this.state.fieldType.meta.ui_toggle?" open":"")}>
        <button className="ui-fieldtype__form-content__button" onClick={() => this._toggle()}>{options_build.name}</button>
        {options_build.content}
      </div>;
    }

    return (
      <div className={"ui-fieldtype-wrapper"}>
        <div className="row ui-fieldtype">
          <div className="ui-fieldtype__form">
            <div className="ui-fieldtype__form-header">
              <label>Field Type: <span>{GeneralFunctions.capitalize(this.state.fieldType.fieldtype_name)}</span></label>
              <label className="ui-fieldtype__form-header__slug">Slug: <span>{GeneralFunctions.capitalize(this.state.fieldType.title)}</span></label>
              <button className="btn ui-btn ui-btn-text" onClick={() => this._handleRemove()}><i className="icon ion-md-remove-circle-outline"></i></button>
            </div>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input id="title" type="text" className="form-control" placeholder="Field Type Name" value={GeneralFunctions.underscoresToSpacesAndCaps(this.props.fieldType.title).replace(/[\"\'~`*!@#$%^&()={}[\]:;,.<>+\/?\\|]/g, '')} onChange={(e) => this._handleChange('title', e.target.value)}/>
            </div>
            {options}
          </div>
          {(this.state.hide_size ? null :
          <div className="ui-fieldtype__size">
            <SizeSelector currentSize={this.state.ui_size} onSelect={this._handleChange} halfsOnly={this._setSizeOptions()}/>
          </div>
          )}
        </div>
      </div>
    )
  }
}

