import React from 'react';
import FileBrowser from './file-browser';
import DirectoryViewer from './directory-viewer';
import MakeCall from '../utilities/make-call';

// Example files object

// _files: {
//   "random-folder": {
//     _files: {
//       "random-folder": {
//         _files: {...}, // Pattern repeats
//         _info: {...}
//       },
//       "random-file.jpx": {
//         _info: {...}
//       },
//     }
//     _info: {...}
//   },
//   "random-file.jpx": {
//     _info: {...}
//   },
// }

export default class FileManager extends React.Component { 

  constructor(props) {
    super(props);

    this.fileManager = React.createRef();

    this.getDataFromLocalstorage = this.getDataFromLocalstorage.bind(this);
    this.updataList = this.updataList.bind(this);
    this.updateFilesThroughPaths = this.updateFilesThroughPaths.bind(this);
    this.getFilesFromPath = this.getFilesFromPath.bind(this);
    this.arrayPathBuilder = this.arrayPathBuilder.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.setDirectory = this.setDirectory.bind(this);
    this.gotoDirectory = this.gotoDirectory.bind(this);
    this.goBackaDirectory = this.goBackaDirectory.bind(this);
    
    this.state = {
      topDir: (this.props.rootDir != undefined ? this.props.rootDir : ""),
      currentDir: (this.props.rootDir != undefined ? this.props.rootDir : ""),
      files: {
        _files: {},
        _info: {}
      },
      selected: null
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.topDir = (nextProps.rootDir != undefined ? nextProps.rootDir : "");
    return temp_state;
  }

  componentDidMount() {
    this.updataList(this.state.currentDir);
  }

  getDataFromLocalstorage(directory) {
    return MakeCall.api("file/directory/", {
      method: "POST",
      body: MakeCall.prepdata({
        dir: directory
      })
    });
  }

  updataList(currentDir) {
    this.getDataFromLocalstorage(currentDir).then((response) => {
      if (response.success) {
        this.updateFilesThroughPaths(response.directory.files, currentDir);
      }
    });
  }

  updateFilesThroughPaths(updated_files, directory_path) {
    // Internal loop for merging data
    function internalUpdate(directory_files, array_path) {
      // Get first path
      let first_path = array_path.shift();
      // Continue through process only if path is found, or assume root
      if (first_path) {
        // Get siblings
        let item_keys = Object.assign({}, directory_files._files)
        // Get specific item data
        let item_data = directory_files._files[first_path];
        // Check if this is the last path from array
        if (array_path.length) {
          // Get return current data
          item_keys[first_path] = Object.assign({}, item_data, {
            _files: internalUpdate(item_data, array_path)
          });
          return item_keys;
        } else {
          // Merge updated data
          item_keys[first_path] = Object.assign({}, item_data, {
            _files: updated_files
          });
          return item_keys;
        }
      } else {
        return updated_files;
      }
    }
    
    // Get array path
    let array_path = this.arrayPathBuilder(directory_path);

    // Update the overall files object
    let files = Object.assign({}, this.state.files, {
      _files: internalUpdate(this.state.files, array_path)
    });

    // Set state
    this.setState({
      currentDir: directory_path,
      files
    });
  }

  getFilesFromPath(files, array_path) {
    // Get first path
    const first_path = array_path.shift();
    // Check if this is the last path from array
    if (array_path.length) {
      return this.getFilesFromPath(files[first_path]._files, array_path);
    } else {
      return files[first_path]._files;
    }
  }

  arrayPathBuilder(directory_path) {
    return directory_path.split("/");
  }

  setSelection(info) {
    this.setState({selected: info});
  }

  setDirectory(path) {
    this.setState({currentDir: path});
  }

  gotoDirectory(directory_name) {
    // Update files object
    this.updataList(directory_name);
  }

  goBackaDirectory() {
    // Remove the max level the user can access provided via path string
    let max_top_level = this.state.currentDir.replace(this.state.topDir, "");
    // Turn string path to array
    let array_path = this.arrayPathBuilder(max_top_level);
    // Go back a directory
    let directory;
    if (array_path.length > 1) {
      array_path.pop();
      directory = array_path.join('/');
    } else {
      directory = "";
    }
    directory = (directory != "" ? (this.state.topDir != "" ? this.state.topDir + '/' : "") + directory : this.state.topDir);
    // Safety net to remove double slashes
    directory = directory.replace('//','/');
    // Update files object
    this.setDirectory(directory);
  }

  render() {

    let file_browser_files;
    let directory_files;

    if (Object.keys(this.state.files._files).length && this.state.topDir != "") {
      let array_path = this.arrayPathBuilder(this.state.topDir);
      file_browser_files = this.getFilesFromPath(this.state.files._files, array_path);
    } else {
      file_browser_files = this.state.files._files;
    }
    
    if (Object.keys(this.state.files._files).length && this.state.currentDir != "") {
      let array_path = this.arrayPathBuilder(this.state.currentDir);
      directory_files = this.getFilesFromPath(this.state.files._files, array_path);
    } else {
      directory_files = this.state.files._files;
    }

    let props = {
      dir: this.state.currentDir,
      goBackaDirectory: this.goBackaDirectory,
      gotoDirectory: this.gotoDirectory,
      selected: this.state.selected,
      setDirectory: this.setDirectory,
      setSelection: this.setSelection
    }

    if (typeof this.props.returnInsert === 'function') {
      props.returnInsert = this.props.returnInsert
    }

    return (
      <div ref={this.fileManager} className="ui-file-manager__view">
        <FileBrowser files={file_browser_files} {...props}/>
        <DirectoryViewer files={directory_files} {...props}/>
      </div>
    )
  }
}

