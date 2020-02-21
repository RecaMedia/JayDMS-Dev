import React from 'react';
import ComponentSelector from '../components/component-selector';
import ComponentSort from '../components/component-sort';

export default class GroupFunc extends React.Component {

  constructor(props) {
    super(props);

		this.process = this.process.bind(this);
		this.handleComponent = this.handleComponent.bind(this);
		this.handleComponentIndexUpdate = this.handleComponentIndexUpdate.bind(this);
		this.handleChange = this.handleChange.bind(this);

    // Clone modified form object data (which is now "data" and has an additiona key called "key")
    // Also add options which will contain the repeated fields
    let form = {}
    form[this.props.data.key] = Object.assign({}, this.props.data, {
      options: (this.props.data.options != undefined ? this.props.data.options : {
        components: []
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
        components: []
      })
    });
    delete form[nextProps.data.key].key;

    temp_state.form = form;
    temp_state.data = nextProps.data;
    
    return temp_state;
  }

  process(components) {
    let form = {};
    form[this.state.data.key] = Object.assign({}, this.state.data, {
      options: Object.assign({}, this.state.data.options, {
        components
      })
    });
    return form;
  }

	handleComponent(component) {
    let pre_components = Array.from(this.state.form[this.state.data.key].options.components);
    pre_components.push(component);
    let form = this.process(pre_components);
    this.handleChange(form);
	}

	handleComponentIndexUpdate(components) {
		let form = this.process(components);
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
        <div className="col-12 col-sm-6"></div>
        <div className="col-12 col-sm-6 text-right">
          <ComponentSelector onSelect={this.handleComponent}/>
        </div>
      </div>
      <div className="ui-inserts-list">
        <ComponentSort components={this.state.form[this.state.data.key].options.components} callback={this.handleComponentIndexUpdate}/>
      </div>
    </div>;
  }
}