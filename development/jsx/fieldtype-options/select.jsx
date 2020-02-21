import React from 'react';

export default class SelectFunc extends React.Component {

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.buffer = null;

    // Clone modified form object data (which is now "data" and has an additional key called "key")
    // Also add options which will contain the repeated fields
    let form = {}
    form[this.props.data.key] = Object.assign({}, this.props.data, {
      options: (this.props.data.options != undefined ? this.props.data.options : {
        selections: []
      })
    });
    // Delete "key" since this is not from original form object
    delete form[this.props.data.key].key;

    let text = "";
    if (form[this.props.data.key].options != undefined && form[this.props.data.key].options.selections != undefined) {
      let list = form[this.props.data.key].options.selections
      list.map((line,i) => {
        text += line.name + " : " + line.value + "\n";
      });
    }

    this.state = {
      text,
      form,
      data: this.props.data
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Current form date always gets updated
    // We exclude the text value since onchange event handles these updates
    let temp_state = prevState;

    let form = {}
    form[nextProps.data.key] = Object.assign({}, nextProps.data, {
      options: (nextProps.data.options != undefined ? nextProps.data.options : {
        selections: []
      })
    });
    delete form[nextProps.data.key].key;

    temp_state.form = form;
    temp_state.data = nextProps.data;
    
    return temp_state;
  }

  onChange(event) {
    // Store orignal text for setting state
    let text = event.target.value;
    // Defaults
    let selections = [];
    let arrayOfLines = text.split('\n');
    // Loop through each line
    arrayOfLines.map((line,i) => {
      // Separate each line accordingly to what is found
      let data = line.split(':')
      let value = "";
      if (data.length > 1) {
        value = data[1].trim();
      }
      // Create item object
      let item = {
        name: data[0].trim(),
        value
      }
      // Store item as a selection
      selections.push(item);
    });
    // Recreate the form object with it's updated data
    let form = {};
    form[this.state.data.key] = Object.assign({}, this.state.form[this.state.data.key], {
      options: {
        selections
      }
    });      
    // Set state
    this.setState({text}, () => {
      // Now send to HandleChange method
      this.handleChange(form);
    });  
  }

  handleChange(obj) {
    if (typeof this.props.handleChange === 'function') {
      this.props.handleChange('value', obj);
    }
  }

  render() {
    return <div className="ui-fieldtype__form-content__extras ui-fieldtype__form-content__extras--select">
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label htmlFor="radioList">Example for adding a selection "name : value".</label>
            <textarea className="form-control" id="radioList" rows="5" value={this.state.text} onChange={this.onChange}/>
          </div>
        </div>
      </div>
    </div>;
  }
}