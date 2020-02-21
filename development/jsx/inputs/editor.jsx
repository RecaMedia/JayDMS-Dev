import React from 'react';
import JoditEditor from "../vendors/jodit-react";

export default class InputEditor extends React.Component {

  constructor(props) {
    super(props);
    
    this._onChange = this._onChange.bind(this);

    // Set URL paths
    let hostname = window.location.protocol + '//' + (window.location.hostname == "localhost" ? "jdms-dev.local" : window.location.hostname);

    this.url_upload = hostname+"/cp/core/api/file/upload/";
    this.mode = (this.props.options != undefined && this.props.options.hasOwnProperty("mode") ? this.props.options.mode : "slim");
    this.dir = (this.props.options != undefined && this.props.options.hasOwnProperty("dir") ? this.props.options.dir : "");

    let removeButtons;
    switch(this.mode) {
      case "full":
        removeButtons = []
      break;
      case "standard":
        removeButtons = [
          "hr",
          "ol",
          "about",
          "italic",
          "format",
          "fullsize",
          "justify"
        ]
      break;
      case "slim":
      default:
        removeButtons = [
          "hr",
          "ol",
          "about",
          "italic",
          "format",
          "fullsize",
          "justify"
        ]
      break;
    }

    this.state = {
      value: this.props.value,
      removeButtons
    }
  }

  _onChange(value) {
    let return_data;

    if (this.props.useKey) {
      return_data = {};
      return_data[this.props.inputKey] = value;
    } else {
      return_data = value;
    }
    
    this.setState({
      value
    }, () => {
      if (typeof this.props.returnValue === 'function') {
        this.props.returnValue(return_data);
      }
    });
  }

  render() {

    let relativePathURL = '/jdms/content/assets' + (this.dir != '' ? '/' + this.dir : '') + '/';

    // https://xdsoft.net/jodit/v.2/doc/tutorial-uploader-settings.html

    return (
      <JoditEditor
        returnEditor={(editor) => {
          this.editor = editor;
        }}
        value={this.state.value}
        config={{
          enableDragAndDropFileToEditor: true,
          uploader: {
            url: this.url_upload,
            format: 'json',
            data: {
              dir: this.dir
            },
            isSuccess: function(resp) {
              return !resp.error;
            },
            getMsg: function(resp) {
              return resp.msg.join !== undefined ? resp.msg.join(' ') : resp.msg;
            },
            baseurl: relativePathURL,
            process: function(resp) {
              // Use custom response from upload to build expected object on success
              let files = [];
              resp.list.map((file) => {
                files.push(file.name);
              });
              // Passes through to defaultHandlerSuccess as response
              return { 
                files, // {array} The names of uploaded files. Field name uploader.filesVariableName
                path: relativePathURL, // {string} Real relative path 
                baseurl: '/jdms/content/assets', // {string} Base url for filebrowser
                error: (resp.success ? 0 : 1), // {int}
                msg: resp.message // {string}
              };
            },
            error: function(e) {
              console.log(e);
              // this.events.fire('errorPopap', [e.getMessage(), 'error', 4000]);
            },
            defaultHandlerSuccess: function(resp) {  
              if (resp.files && resp.files.length) {
                for (let i = 0; i < resp.files.length; i++) {
                  let full_file_path = resp.path + resp.files[i];
                  this.selection.insertImage(full_file_path, null, 250);
                }
              }
            },
            defaultHandlerError: function (resp) {
              this.events.fire('errorPopap', [this.options.uploader.getMsg(resp)]);
            }
          },
          removeButtons: this.state.removeButtons
        }}
        onChange={this._onChange}
        dir={this.dir}
      />
    );
  }
}