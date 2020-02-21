import React from 'react';

export default class DateFunc extends React.Component {

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.handleChange = this.handleChange.bind(this);

    // Clone modified form object data (which is now "data" and has an additiona key called "key")
    // Also add options which will contain the repeated fields
    let form = {}
    form[this.props.data.key] = Object.assign({}, this.props.data, {
      options: (this.props.data.options != undefined ? this.props.data.options : {
        mode: 'date'
      })
    });
    // Delete "key" since this is not from original form object
    delete form[this.props.data.key].key;

    console.log(form[this.props.data.key].options);

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
        mode: 'date'
      })
    });
    delete form[nextProps.data.key].key;

    temp_state.form = form;
    temp_state.data = nextProps.data;
    
    return temp_state;
  }

  componentDidMount() {
    this.props.handleChange('value', this.state.form);
  }

  onChange(mode) {
    let form = Object.assign({}, this.state.form);

    form[this.state.data.key].options.mode = mode;
    
    this.handleChange(form);
  }

  handleChange(form) {
    if (typeof this.props.handleChange === 'function') {
      this.props.handleChange('value', form);
    }
  }

  render() {    
    return <div className="ui-fieldtype__form-content__extras">
      <div className="row">
        <div className="col-md-12 col-lg-6">
          <div className="form-group ui-fieldtype__form-item">
            <label htmlFor="editormode" className="col-form-label">Mode:</label>
            <select id="editormode" className="form-control" value={this.state.form[this.state.data.key].options.mode} onChange={(e) => this.onChange(e.target.value)}>
              <option value="date">Date</option>
              <option value="time">Time</option>
              <option value="both">Date and TIme</option>
            </select>
          </div>
        </div>
      </div>
    </div>;
  }
}