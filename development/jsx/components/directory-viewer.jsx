import React from 'react';
import MakeCall from '../utilities/make-call';
import Uploader from '../utilities/uploader';
import store from '../utilities/store';

const LI = ({datatype, datapath, children}) => {
  return <li className="ui-file-manager__directory__list-item" data-type={datatype} data-path={datapath}>
    {children}
  </li>;
}

const ICON = ({icon}) => {
  return <i className={"icon ion-md-" + icon}></i>;
}

const BUTTON = ({action, children}) => {
  return <button className="ui-file-manager__directory__select" onClick={() => action()}>
    {children}
  </button>;
}

class RenameModule extends React.Component { 

  constructor(props) {
    super(props);

    this.toggleEdit = this.toggleEdit.bind(this);
    this.save = this.save.bind(this);
    this.onChange = this.onChange.bind(this);

    this.state = {
      editMode: false,
      value: (this.props.value != undefined ? this.props.value : "")
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.value = (nextProps.value != undefined ? nextProps.value : "");
    return temp_state;
  }

  toggleEdit(mode) {
    if (!mode) {
      this.onChange("");
    }
    this.setState({editMode: mode})
  }

  save() {
    if (typeof this.props.rename === 'function') {
      this.props.rename();
    }
    this.onChange("");
    this.toggleEdit(false);
  }

  onChange(value) {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(value.replace(" ", ""));
    }
  }

  render() {

    let render = (this.state.editMode ? 
      <div className="ui-file-manager__selection__data__form form-inline">
        <div className="form-group">
          <input type="text" className="form-control" value={this.state.value} onChange={(e) => this.onChange(e.target.value)}/>
        </div>
        <button className="btn ui-btn" onClick={() => this.save()}><i className="icon ion-md-checkmark"></i></button>
        <button className="btn ui-btn" onClick={() => this.toggleEdit(false)}><i className="icon ion-md-close"></i></button>
      </div>
    :
      <a className="ui-file-manager__selection__data__btn-action" onClick={() => this.toggleEdit(true)}>Rename</a>
    );

    return render;
  }
}

export default class DirectoryViewer extends React.Component { 

  constructor(props) {
    super(props);

    this.renameUpdate = this.renameUpdate.bind(this);
    this.shortenFileName = this.shortenFileName.bind(this);
    this.imageOrIcon = this.imageOrIcon.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.gotoDirectory = this.gotoDirectory.bind(this);
    this.goBackaDirectory = this.goBackaDirectory.bind(this);
    this.process = this.process.bind(this);
    this.buildList = this.buildList.bind(this);
    this.buildSelection = this.buildSelection.bind(this);
    this.upload = this.upload.bind(this);

    this.uploadRef = React.createRef();

    // This is the intial top directory on load regardless of what becomes the current directory (this.state.dir)
    this.topDir = (this.props.dir != undefined ? this.props.dir : "");

    this.state = {
      dir: (this.props.dir != undefined ? this.props.dir : ""),
      files: (this.props.files != undefined ? this.props.files : {}),
      selected: (this.props.selected != undefined ? this.props.selected : null),
      rename: ""
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.dir = (nextProps.dir != undefined ? nextProps.dir : "");
    temp_state.files = (nextProps.files != undefined ? nextProps.files : {});
    temp_state.selected = (nextProps.selected != undefined ? nextProps.selected : null);
    return temp_state;
  }

  componentDidMount() {
    if (this.uploadRef.current) {
      this.uploadRef.current.onchange = () => {
        this.upload();
      }
    }
  }

  renameUpdate(rename) {
    this.setState({rename});
  }

  shortenFileName(name) {
    if (typeof name === "string") {
      if (name.length > 20) {
        let diff = (name.length - 20);
        diff = (diff <= 3 ? 4 : diff);
        return name.substring(0, 8) + '...' + name.substring(8 + diff);
      } else {
        return name;
      }
    }
  }

  imageOrIcon(info) {
    return (info.icon == 'images' ? 
      <div className="img" style={{backgroundImage: 'url(\'/jdms/content/assets/' + info.path + '\')'}}></div>
    :
      <ICON icon={(info.isfolder ? 'folder' : info.icon)}/>
    )
  }

  setSelection(info) {
    if (typeof this.props.setSelection === 'function') {
      this.props.setSelection(info);
    }
  }

  gotoDirectory(path) {
    if (typeof this.props.gotoDirectory === 'function') {
      this.props.gotoDirectory(path);
    }
  }

  goBackaDirectory() {
    if (typeof this.props.goBackaDirectory === 'function') {
      this.props.goBackaDirectory();
    }
  }

  process(type, location) {

    let data = {location};
    let dir_of_file, selected;
    let update_selected = false;

    // Get path of directory of file to update directory
    let array_paths = location.split("/");
    array_paths.pop();
    if (typeof array_paths === "array" && array_paths.length == 0) {
      dir_of_file = "";
    } else {
      dir_of_file = array_paths.join("/");
    }

    if (type == "rename") {
      // Add newName prop on rename
      data.newName = this.state.rename;
      // Update selected file info
      let path = (dir_of_file != "" ? dir_of_file + "/" + data.newName : data.newName);
      selected = Object.assign({}, this.state.selected, {
        filename: data.newName,
        path,
        url: path
      });
      // Update flag
      update_selected = true;
    } else if (type == "delete") {
      // Remove selected file if deleted
      selected = null;
      // Update flag
      update_selected = true;
    }
    
    // Make file process call
    MakeCall.api("file/" + type + "/", {
      method: "POST",
      body: MakeCall.prepdata(data)
    }).then((response) => {
      if (response.success) {
        this.setState({
          rename: ""
        }, () => {
          this.gotoDirectory(dir_of_file);
          if (update_selected) {
            this.setSelection(selected);
          }
          store.dispatch({
            type: "NEW_ALERT",
            alert: {
              title: "File Processed",
              message: "File " + type + " has been completed.",
              type: "success"
            }
          });
        });        
      }
    });
  }

  buildList() {
    return Object.keys(this.state.files).map((file, i) => {
      let info = this.state.files[file]._info;
      return <LI key={i} datatype={(info.isfolder ? 'folder' : 'file')} datapath={info.path}>
        <BUTTON action={() => (info.isfolder ? this.gotoDirectory(info.path) : this.setSelection(info))}>
          {this.imageOrIcon(info)}
        </BUTTON>
        <span className="ui-file-manager__directory__filename">{this.shortenFileName(info.filename) + (info.isfolder ? '/' : '')}</span>
      </LI>
    });
  }

  buildSelection() {
    let insert_button = null;
    let info = this.state.selected;
    let date_stamp = new Date(info.lastmodified);

    let monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
  
    let day = date_stamp.getDate();
    let monthIndex = date_stamp.getMonth();
    let year = date_stamp.getFullYear();
  
    let date_print = monthNames[monthIndex] + ' ' + day + ', ' + year;

    let url = window.location.protocol + '//' + (window.location.hostname == "localhost" ? "jdms-dev.local" : window.location.hostname) + '/jdms/content/assets/' + info.path;

    // Prepare insert button
    if (typeof this.props.returnInsert === 'function') {
      function checkIfImage(filename) {
        let array_paths = filename.split("/");
        let basename = array_paths[array_paths.length - 1];
        let filename_parts = basename.split(".");
        let found = false;
        ["jpg","jpeg","svg","png","gif"].map((format) => {
          if (filename_parts.includes(format)) {
            found = true;
          }
        });
        return found;
      }
      // Return data
      let return_item = {
        filename: info.filename,
        url,
        path: info.path,
        size: info.size,
        datestamp: date_print,
        type: (info.handler == "file" && checkIfImage(info.filename) ? "image" : "file")
      }
      // Set button
      insert_button = <li><button className="btn ui-btn" onClick={() => {
        this.setSelection(null);
        this.props.returnInsert(return_item);
      }}>Select File</button></li>
    }
    
    return <div className="ui-file-manager__selection__data">
      <div className="ui-file-manager__selection__data__image">
        {this.imageOrIcon(info)}
      </div>
      <ul className="ui-file-manager__selection__data__info">
        <li><strong>Filename:</strong> {this.shortenFileName(info.filename)}</li>
        <li><strong>URL:</strong> <a href={url} target="_blank">{url}</a></li>
        <li><strong>Path:</strong> {this.shortenFileName(info.path)}</li>
        <li><strong>Size:</strong> {info.size}</li>
        <li><strong>Last Modified:</strong> {date_print}</li>
        <li><strong>Type:</strong> {info.handler}</li>
      </ul>
      <ul className="ui-file-manager__selection__data__info">
        <li><RenameModule value={this.state.rename} onChange={this.renameUpdate} rename={() => this.process("rename", info.path)}/></li>
        <li><a className="ui-file-manager__selection__data__btn-action" onClick={() => this.process("copy", info.path)}>Copy</a></li>
        <li><a className="ui-file-manager__selection__data__btn-delete" onClick={() => this.process("delete", info.path)}>Delete</a></li>
        {insert_button}
      </ul>
    </div>;
  }

  upload() {
    Uploader(this.state.dir, this.uploadRef.current.files).then((response) => {
      // Clear input
      this.uploadRef.current.value = '';
      response.map((file) => {
        // Send alert
        store.dispatch({
          type: "NEW_ALERT",
          alert: {
            title: "Upload " + (file.success ? "Successful" : "Failed"),
            message: this.shortenFileName(file.name) + " has" + (file.success ? " " : " not ") + "been uploaded.",
            type: (file.success ? "success" : "danger")
          }
        });
      });
      // Refresh directory
      this.gotoDirectory(this.state.dir);
    });
  }

  render() {

    let files = <ul className="ui-file-manager__directory__list">
      {(this.state.dir != "" && this.topDir != this.state.dir ? 
        <li className="ui-file-manager__directory__list-item" data-type="folder" data-path="">
          <button className="ui-file-manager__directory__select" onClick={() => this.goBackaDirectory()}>
            <i className="icon ion-md-arrow-back"></i>
          </button>
          <span className="ui-file-manager__directory__filename">{"<- Previous Directory"}</span>
        </li>
      : null)}
      {this.buildList()}
    </ul>

    return (
      <div className="ui-file-manager__directory">
        <div className="ui-file-manager__directory__tool-bar">
          <div className="btn ui-btn ui-file-manager__directory__tool-bar__upload">
            <input ref={this.uploadRef} type="file" multiple/>
          </div>
          <span>Directory: /{this.state.dir}</span>
        </div>
        {(this.state.selected != null ?
          <div className="ui-file-manager__directory__columns">
            <div className="ui-file-manager__directory__files">
              {files}
            </div>
            <div className="ui-file-manager__selection">
              <button className="ui-file-manager__selection__btn-close" onClick={() => this.setSelection(null)}><i className="icon ion-md-close"></i></button>
              {this.buildSelection()}
            </div>
          </div>
        :
          <div className="ui-file-manager__directory__files">
            {files}
          </div>
        )}
      </div>
    )
  }
}

