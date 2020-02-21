import React from 'react';
import MakeCall from '../utilities/make-call';

export default class EditorFunc extends React.Component {

  constructor(props) {
    super(props);
    
    this.getDirectories = this.getDirectories.bind(this);
    this.onChange = this.onChange.bind(this);
    this.processValue = this.processValue.bind(this);
    this.handleChange = this.handleChange.bind(this);

    // Clone modified form object data (which is now "data" and has an additiona key called "key")
    // Also add options which will contain the repeated fields
    let form = {}
    form[this.props.data.key] = Object.assign({}, this.props.data, {
      options: (this.props.data.options != undefined ? this.props.data.options : {
        dir: ""
      })
    });
    // Delete "key" since this is not from original form object
    delete form[this.props.data.key].key;

		this.state = {
      dir_select: null,
      files: [],
      data: this.props.data,
      form
		}
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;

    let form = {}
    form[nextProps.data.key] = Object.assign({}, nextProps.data, {
      options: (nextProps.data.options != undefined ? nextProps.data.options : {
        dir: ""
      })
    });
    delete form[nextProps.data.key].key;

    temp_state.form = form;
    temp_state.data = nextProps.data;
    
    return temp_state;
  }

  componentDidMount() {
    // Get directories
    this.getDirectories();
  }

  getDirectories() {
    MakeCall.api("file/directory/", {
      method: "POST",
      body: MakeCall.prepdata({
        dir: ""
      })
    }).then((data) => {
      if (data.success) {
        this.setState({
          files: data.directory.files
        })
      }
    })
  }

  onChange(value) {
    this.processValue(value);
  }

  processValue(dir = "") {
    let form = {};
    
    form[this.state.data.key] = Object.assign({}, this.state.form[this.state.data.key], {
      options: {
        dir
      }
    });
    
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
        <div className="col-12">
          <div className="form-group ui-fieldtype__form-item">
            <label htmlFor="editormediadir" className="col-form-label">Default Media Directory:</label>
            <select id="editormediadir" className="form-control" value={this.state.form[this.props.data.key].options.dir} onChange={(e) => this.onChange(e.target.value)}>
              <option value="">root</option>
              {
                Object.keys(this.state.files).map((item_name,i) => {
                  let item = this.state.files[item_name]._info;
                  if (item.isfolder) {
                    return <option key={i} value={item.path}>{item.path}</option>
                  }
                })
              }
            </select>
          </div>
        </div>
      </div>
    </div>;
  }
}