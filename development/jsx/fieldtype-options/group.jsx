import React from 'react';
import FieldTypeSelector from '../components/fieldtype-selector';
import FieldtypeInserts from '../components/fieldtype-inserts';

import GeneralFunctions from '../utilities/general-functions';

export default class GroupFunc extends React.Component {

  constructor(props) {
    super(props);

    this.rnd = this.rnd.bind(this);
    this.handleArrayInsert = this.handleArrayInsert.bind(this);
    this.handleArrayItemUpdate = this.handleArrayItemUpdate.bind(this);
    this.handleChange = this.handleChange.bind(this);

    // Clone modified form object data (which is now "data" and has an additiona key called "key")
    // Also add options which will contain the repeated fields
    let form = {}
    form[this.props.data.key] = Object.assign({}, this.props.data, {
      options: (this.props.data.options != undefined ? this.props.data.options : {
        fields: []
      })
    });
    // Delete "key" since this is not from original form object
    delete form[this.props.data.key].key;

    this.state = {
      form,
      data: this.props.data
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;

    let form = {}
    form[nextProps.data.key] = Object.assign({}, nextProps.data, {
      options: (nextProps.data.options != undefined ? nextProps.data.options : {
        fields: []
      })
    });
    delete form[nextProps.data.key].key;

    temp_state.form = form;
    temp_state.data = nextProps.data;
    
    return temp_state;
  }

  rnd(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min );
  }

  handleArrayInsert(field) {
    // Clone array and add newly selected fieldtype
    let fields = Array.from(this.state.form[this.state.data.key].options.fields);
    fields.push(field);

    // Now send to handleArrayItemUpdate method
    this.handleArrayItemUpdate(fields);
  }

  handleArrayItemUpdate(fields) {
    // Recreate the form object with it's updated data
    let form = {};
    form[this.state.data.key] = Object.assign({}, this.state.form[this.state.data.key], {
      options: {
        fields: GeneralFunctions.updateFieldTypeIndex(fields) // One of the array items have been updated with new data, we're now just updating the "ui_index" key meta info
      }
    });
    
    // Now send to HandleChange method
    this.handleChange(form);
  }

  handleChange(obj) {
    if (typeof this.props.handleChange === 'function') {
      this.props.handleChange('value', obj);
    }
  }

  render() {
    return <div className="ui-fieldtype__form-content__extras">
      <div className="row">
        <div className="col-12 text-right">
          <FieldTypeSelector onSelect={this.handleArrayInsert}/>
        </div>
      </div>
      <div className="ui-inserts-list">
        <FieldtypeInserts id={this.rnd(5, 250)} inserts={this.state.form[this.state.data.key].options.fields} callback={this.handleArrayItemUpdate}/>
      </div>
    </div>;
  }
}