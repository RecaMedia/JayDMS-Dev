import React from 'react';
import PropTypes from 'prop-types';
import brace from 'brace';
import Jodit from 'jodit';
import Modal from '../utilities/modal';
import FileManager from '../components/file-manager';

import 'brace/theme/idle_fingers';

class JoditEditor extends React.Component {

  constructor(props) {
    super(props);
    this.textArea = React.createRef();
  }

  componentDidMount() {

    const blurHandler = value => {
      this.props.onBlur && this.props.onBlur(value)
    };

    const changeHandler = value => {
      this.props.onChange && this.props.onChange(value)
    };

    this.textArea.current = new Jodit(this.textArea.current, Object.assign({}, this.props.config, {
      extraButtons: this._customButtons()
    }));

    this.textArea.current.value = this.props.value;
    this.textArea.current.events.on('blur', () => blurHandler(this.textArea.current.value));
    this.textArea.current.events.on('change', () => changeHandler(this.textArea.current.value));
    this.textArea.current.workplace.tabIndex = this.props.tabIndex || -1;

    // Pass up access to editor
    if (this.props.returnEditor != undefined && typeof this.props.returnEditor === "function") {
      this.props.returnEditor(this.textArea.current);
    }
  }

  _customButtons() {
    let admin_assets = window.location.protocol + "//" + (window.location.hostname == "localhost" ? "jdms-dev.local" : window.location.hostname) + "/cp/assets/img/";
    
    return [{
      name: 'File Manager',
      iconURL: admin_assets + "ionicons-folder.svg",
      exec: (editor) => {
        Modal.show(<div className="ui-file-manager--lightbox">
          <div className="ui-file-manager">
            <button className="ui-file-manager--lightbox-button" onClick={() => Modal.remove()}><i className="icon ion-md-close"></i></button>
            <FileManager rootDir={this.props.dir} returnInsert={(item) => {
              if (item.type == "image") {
                editor.selection.insertImage(item.url, null, "25%");
              } else {
                editor.selection.insertHTML('<a href="'+item.url+'" target="_blank" style="color:#00F;">'+item.filename+'</a> ');
              }
              Modal.remove();
            }}/>
          </div>
        </div>)
      }
    }]
  }

  render() {
    return (
      <textarea ref={this.textArea} name={this.props.name}></textarea>
    )
  }
}

JoditEditor.propTypes = {
	value: PropTypes.string,
  tabIndex: PropTypes.number,
	config: PropTypes.object,
	onChange: PropTypes.func,
  onBlur: PropTypes.func,
  dir: PropTypes.string
};

export default JoditEditor