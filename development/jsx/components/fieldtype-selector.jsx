import React from 'react';
import MakeCall from '../utilities/make-call';
import GeneralFunctions from '../utilities/general-functions';

const default_fieldtypes = [
  "checkbox",
  "code",
  "colorpicker",
  "components",
  "datetime",
  "editor",
  "file",
  "group",
  "radio",
  "repeater",
  "select",
  "text",
  "textarea",
]

export default class FieldTypeSelector extends React.Component {

	constructor(props) {
		super(props);
    
    this._checkAllowedFieldtypes = this._checkAllowedFieldtypes.bind(this);
    this._getFieldtypes = this._getFieldtypes.bind(this);
    this._toggle = this._toggle.bind(this);
    this._handlePress = this._handlePress.bind(this);

		this.state = {
      toggle: false,
			fieldtypes: []
		}
	}
	
	componentDidMount() {
    this._getFieldtypes();
  }

  _checkAllowedFieldtypes(data) {
    Object.keys(data.form).map((key, i) => {
      let input_obj = data.form[key];
      if (default_fieldtypes.indexOf(input_obj.input) === -1) {
        return true;
      }
    });
    return false;
  }

  _getFieldtypes() {
		if (this.state.fieldtypes.length == 0) {
      // Get fieldtypes
			MakeCall.api("fieldtypes/list/").then((response) => {
				if (response.success) {
          /*
          // "response.list" provides the necessary data, however, since PHP doesn't provide arrays and objects together
          // we're looping through list and calling the fieldtypes json file directly to enforce the value type
          */
          let list = GeneralFunctions.objectInArraySort(response.list);
          let fieldtypes = []
          let count = 0;
          // Loop through list
          list.map((field,i) => {
            // Determine path for fieldtype
            let path = "defaults/";
            if (field.path.indexOf('modified') > -1) {
              path = "modified/";
            }
            // Make fieldtype call
            MakeCall.fieldtype(path + field.filename).then((response) => {
              let skip = false;
              // Check if allowed fieldtype inputs are being used
              skip = this._checkAllowedFieldtypes(response.data);
              if (!skip && response.success) {
                // Push updated data
                fieldtypes.push(Object.assign({}, field, {data: response.data}));
                count++;
              } else {
                list.splice(i, 1);
              }
              // When count matches set state
              if (count == list.length) {
                this.setState({fieldtypes});
              }
            });
          });
				}
			});
		}
  }
  
  _toggle() {
    let toggle = (this.state.toggle?false:true);
    this.setState({toggle});
  }

  _handlePress(content) {
    if (typeof this.props.onSelect === "function") {
      // Add to fieldtype object with addition data
      this.props.onSelect(Object.assign({}, content, {
        title: "",
        meta: {
          ui_index: null,
          ui_size: "col-lg-12"
        }
      }));
      this.setState({toggle:false});
    }
  }

  render() {
    return (
      <div className={"btn ui-btn ui-selector"+(this.state.toggle?" open":"")}>
        <div className="ui-selector__items">
          <button className="btn ui-btn ui-btn-white ui-selector__close-btn" onClick={() => this._toggle()}><i className="icon ion-md-close"></i></button>
          {
            this.state.fieldtypes.map((fieldtype, i) => {
              return <button key={i} className="btn ui-btn ui-btn-white" onClick={() => this._handlePress(fieldtype.data)}>{GeneralFunctions.capitalize(fieldtype.data.fieldtype_name)}</button>
            })
          }
        </div>
        <button className="btn ui-btn ui-selector__btn" onClick={() => this._toggle()}><i className="icon ion-md-add"></i> Add Field Type</button>
      </div>
    )
	}
}