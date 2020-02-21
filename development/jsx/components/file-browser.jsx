import React from 'react';
import MakeCall from '../utilities/make-call';
import store from '../utilities/store';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

class LI extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: (this.props.open != undefined ? this.props.open : false)
    }
  }

  render() {
    return (
      <li id={this.props.id} className={"ui-file-manager__browser__list-item" + (this.state.open ? " ui-file-manager__browser__list-item--open" : "") + (this.props.curDir == this.props.datapath ? " active" : "")} data-type={this.props.datatype} data-path={this.props.datapath}>
        {this.props.children}
      </li>
    )
  }
}

const ICON = ({icon}) => {
  return <i className={"icon ion-md-" + icon}></i>;
}

const BUTTON = ({action,  allowToggle, liRef, back, children}) => {
  
  const toggle = () => {
    liRef.current.state.open = (liRef.current.state.open ? false : true);
  }

  const clickAction = () => {
    if (allowToggle) {
      if (liRef.current.state.open) {
        back();
      } else {
        action();
      }
      toggle();
    } else {
      action();
    }
  }

  return <button className="ui-file-manager__browser__button" onClick={clickAction}>
    {children}
  </button>
}

export default class FileBrowser extends React.Component { 

  constructor(props) {
    super(props);

    this.shortenFileName = this.shortenFileName.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.gotoDirectory = this.gotoDirectory.bind(this);
    this.goBackaDirectory = this.goBackaDirectory.bind(this);
    this.newFolder = this.newFolder.bind(this);
    this.deleteFolder = this.deleteFolder.bind(this);
    this.buildList = this.buildList.bind(this);

    // This is the intial top directory on load regardless of what becomes the current directory (this.state.dir)
    this.topDir = (this.props.dir != undefined ? this.props.dir : "");

    this.state = {
      files: (this.props.files != undefined ? this.props.files : "")
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.files = (nextProps.files != undefined ? nextProps.files : "");
    return temp_state;
  }

  shortenFileName(name) {
    if (typeof name === "string") {
      if (name.length > 30) {
        let diff = (name.length - 30);
        diff = (diff <= 3 ? 4 : diff);
        return name.substring(0, 13) + '...' + name.substring(13 + diff);
      } else {
        return name;
      }
    }
  }

  setSelection(info) {
    if (typeof this.props.setSelection === 'function') {
      this.props.setSelection(info);
    }
  }

  setDirectory(path) {
    if (typeof this.props.setDirectory === 'function') {
      this.props.setDirectory(path);
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

  newFolder() {
    MySwal.fire({
      title: 'New Folder Name',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Create'
    }).then((result) => {
      if (!result.hasOwnProperty("dismiss")) {
        MakeCall.api("file/create/folder/", {
          method: "POST",
          body: MakeCall.prepdata({
            location: this.props.dir,
            name: result.value
          })
        }).then((response) => {
          if (response.success) {
            this.gotoDirectory(this.props.dir);
            store.dispatch({
              type: "NEW_ALERT",
              alert: {
                title: "Created!",
                message: "Folder has been created.",
                type: "success"
              }
            });
          } else {
            store.dispatch({
              type: "NEW_ALERT",
              alert: {
                title: "Error",
                message: response.message,
                type: "danger"
              }
            });
          }
        });
      }
    });
  }

  deleteFolder() {
    MySwal.fire({
      title: "Delete Folder",
      text: "Are you sure you would like to delete this folder?",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonColor: '#4dbbde',
    }).then((result) => {
      if (result.value) {
        MakeCall.api("file/delete/", {
          method: "POST",
          body: MakeCall.prepdata({
            location: this.props.dir
          })
        }).then((response) => {
          if (response.success) {
            this.gotoDirectory(this.topDir);
            store.dispatch({
              type: "NEW_ALERT",
              alert: {
                title: "Deleted!",
                message: "Folder has been deleted.",
                type: "success"
              }
            });
          } else {
            store.dispatch({
              type: "NEW_ALERT",
              alert: {
                title: "Error",
                message: response.message,
                type: "danger"
              }
            });
          }
        })
      }
    });
  }

  buildList(dir_files, path) {

    return <ul className="ui-file-manager__browser__list">
      {Object.keys(dir_files).map((file, i) => {
        let files = dir_files[file]._files;
        let info = dir_files[file]._info;

        // Defaults
        let icon, button, action, open, unique_id;
        let allowToggle = false;
        let children = null;

        if (info.isfolder) {
          // Check if files already have been retrieved
          if (Object.keys(files).length) {
            // Set action to get directory info
            action = () => {this.setDirectory(info.path)};;
            // Create children regardless if active so it's always available
            children = this.buildList(files, path);
            // Files exist so allow toggle action
            allowToggle = true;
          } else {
            // Set action to get directory info
            action = () => {this.gotoDirectory(info.path)};
          }
          // If folder, it's default view is open because toggling the view starts after children exist
          // So if children don't exist, it's the equvilant of being closed
          open = true;
        } else {
          // If file, then action only allows to set as selection
          action = () => {this.setSelection(info)};
          // This is not a folder and should be false
          open = false;
        }

        // This allows button to control state of LI
        unique_id = React.createRef();

        // Set appropriate icon
        icon = <ICON icon={(info.isfolder ? 'folder' : info.icon)}/>;

        // Set button
        button = <BUTTON action={action} allowToggle={allowToggle} liRef={unique_id} back={this.goBackaDirectory}>
          {icon}
          <span className="ui-file-manager__browser__filename">{this.shortenFileName(info.filename) + (info.isfolder ? ' /' : '')}</span>
          {(info.isfolder ? null : <span className="ui-file-manager__browser__info-size">{info.size}</span>)}
        </BUTTON>

        return <LI ref={unique_id} key={i} curDir={this.props.dir} datatype={(info.isfolder ? 'folder' : 'file')} datapath={info.path} open={open}>
          {button}
          {children}
        </LI>
      })}
    </ul>
  }

  render() {
    return (
      <div className="ui-file-manager__browser">
        <div className="ui-file-manager__browser__nav">
          <button className="btn ui-btn" onClick={() => this.newFolder()}>New Folder</button>
          {(this.topDir != this.props.dir ? <button className="btn ui-btn" onClick={() => this.deleteFolder()}>Delete Current Folder</button> : null)}
        </div>
        <ul className="ui-file-manager__browser__list">
          <li className="ui-file-manager__browser__list-item ui-file-manager__browser__list-item--open" data-type="folder" data-path="">
            <button className="ui-file-manager__browser__button" onClick={() => this.setDirectory(this.topDir)}>
              <i className="icon ion-md-folder"></i>
              <span className="ui-file-manager__browser__filename">Content / assets / {(this.topDir != "" ? this.topDir.split('/').join(' / ') + ' /' : '')}</span>
            </button>
            {(Object.keys(this.state.files).length ? this.buildList(this.state.files, this.props.dir) : null)}
          </li>
        </ul>
      </div>
    )
  }
}

