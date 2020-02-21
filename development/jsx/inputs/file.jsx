import React from 'react';
import Modal from '../utilities/modal';
import FileManager from '../components/file-manager';

export default class InputFile extends React.Component {

  constructor(props) {
    super(props);

    this._showDialog = this._showDialog.bind(this);
    this._onChange = this._onChange.bind(this);

    this.dir = (this.props.options != undefined && this.props.options.hasOwnProperty("dir") ? this.props.options.dir : "");
    
		this.state = {
      value: this.props.value
		}
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.value = nextProps.value;
    return temp_state;
  }

  _showDialog() {
    Modal.show(<div className="ui-file-manager--lightbox">
      <div className="ui-file-manager">
        <button className="ui-file-manager--lightbox-button" onClick={() => Modal.remove()}><i className="icon ion-md-close"></i></button>
        <FileManager rootDir={this.dir} returnInsert={(item) => {
          this._onChange(item.url);
          Modal.remove();
        }}/>
      </div>
    </div>)
  }

  _onChange(value) {
    let return_data;

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
    return (
      <div>
        <button className="ui-file-input" onClick={() => this._showDialog()}>
          <div className="btn ui-btn">Select File</div>
          <input type="text" className="form-control" value={this.state.value} onChange={this._onChange} disabled/>
        </button>
      </div>
    );
  }
}

