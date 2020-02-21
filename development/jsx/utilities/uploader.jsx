import React from 'react';
import ReactDOM from 'react-dom';

export default function(directory, file_list) {

  // Create upload bar component
  class UploadBar extends React.Component {

    constructor(props) {
      super(props);
      let percent_complete = 0;
      if (this.props.progress != undefined) {
        percent_complete = (this.props.progress.loaded / this.props.progress.total) * 100;
      }
      this.state = {
        percentage: percent_complete
      }
    }
  
    static getDerivedStateFromProps(nextProps, prevState) {
      let temp_state = prevState;
      let percent_complete = 0;
      if (nextProps.progress != undefined) {
        percent_complete = (nextProps.progress.loaded / nextProps.progress.total) * 100;
      }
      temp_state.percentage = percent_complete;
      return temp_state;
    }
  
    render() {
      let style = {
        width: this.state.percentage+'%'
      }
  
      return (
        <div>
          <p>{this.props.name}</p>
          <div className="progress">
            <div className="progress-bar progress-bar-striped" role="progressbar" style={style} aria-valuenow={this.state.percentage} aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
      );
    }
  }
  
  // Create upload dialog box component
  class UploadDialog extends React.Component {
  
    constructor(props) {
      super(props);

      this.init = this.init.bind(this);
      this.processUpload = this.processUpload.bind(this);
      this.checkCompletion = this.checkCompletion.bind(this);
      this.state = {
        files: this.props.files,
        processes: [],
        progresses: {},
        uploads: [],
        completed: false
      }
    }
    
    componentDidMount() {
      this.init();
    }
  
    init() {
      let len = this.props.files.length;
      let uploads = [];
      let files = [];

      // Loop through list of files
      for (let i = 0; i < len; i++) {
        // Add upload bar object for listed item
        let name = this.props.files[i].name;
        uploads.push({
          name,
          progress: 'progress_'+name
        });
        files.push(this.props.files[i]);
      }

      this.setState({
        uploads
      }, () => {
        files.map((file) => {
          // Once added, now begin upload process
          this.processUpload(file.name, file);
        });
      });
    }
  
    processUpload(name, file) {
      // Set Defaults
      let _self = this;
      let xhr = new XMLHttpRequest();

      // Set URL paths
      let hostname = window.location.protocol + '//' + (window.location.hostname == "localhost" ? "jdms-dev.local" : window.location.hostname);
      var url_path = hostname+"/cp/core/api/file/upload/browser/";

      // Open the connection
      xhr.open("POST", url_path, true);
      // Set up progress handler
      xhr.upload.addEventListener("progress", function(e) {
        // Create object that will hold progress value
        let progresses = {};
        progresses['progress_'+name] = e;
        // Update state with progress value
        _self.setState({
          progresses: Object.assign({}, _self.state.progresses, progresses)
        })
      }, false);

      // Create the promise that will hold out until completion
      let this_promise = new Promise((resolve,reject) => {
        // Set up response.
        xhr.onload = function () { 
          let response;
          // Prep response
          if (xhr.readyState == 4 && xhr.status === 200) {
            response = JSON.parse(xhr.responseText);
          } else {
            response = {
              success: false,
              message: "Error making request."
            };
          }
          // Resolve with response
          resolve(response);
          // Then check completion
          _self.checkCompletion();
        };
      });

      // Add promise to list of processes
      this.state.processes.push(this_promise);

      // Create progress object with default value of 0
      let new_progresses = Object.assign({}, this.state.progresses);
      new_progresses['progress_'+name] = 0;

      // Update state with new value prior to starting upload
      this.setState({
        processes: this.state.processes,
        progresses: new_progresses
      }, () => {
        // Start upload
        let formData = new FormData();
        formData.append("files", file);
        formData.append("dir", this.props.directory);
        xhr.send(formData);
      });
    }

    checkCompletion() {
      Promise.all(this.state.processes).then((datalist) => {
        // Send back response
        if (typeof this.props.completedCallback === 'function') {
          this.setState({
            completed: true
          }, () => {
            setTimeout(() => {
              this.props.completedCallback(datalist);
            }, 250);
          });
        }
      });
    }
  
    render() {
      return (
        <div className="ui-modal modal fade show" id="exampleModalCenter" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="false">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalCenterTitle">{(this.completed ? "Upload Complete" : "Uploading")}</h5>
              </div>
              <div className="modal-body">
                {this.state.uploads.map((upload,i) => {
                  // console.log(this.progresses, upload.progress, this.progresses[upload.progress]);
                  return <UploadBar key={i} name={upload.name} progress={this.state.progresses[upload.progress]}/>
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Return promise
  return new Promise((resolve, reject) => {

    function completed(response) {
      ReactDOM.unmountComponentAtNode(document.getElementById('Modal'));
      resolve(response);
    }

    try {
      ReactDOM.render(<UploadDialog directory={directory} files={file_list} completedCallback={completed}/>, document.getElementById('Modal'));
    } catch(error) {
      reject(error);
    }
  });
}