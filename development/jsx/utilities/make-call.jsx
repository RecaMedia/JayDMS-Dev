import $ from './srQuery';

let hostname = window.location.protocol + '//' + (window.location.hostname == "localhost" ? "jdms-dev.local" : window.location.hostname);

var URLs = {
  api_url: hostname+"/cp/core/api/",
  fieldtype_url: hostname+"/cp/core/api/fieldtypes/get/"
}

const processHeaders = function(options = {}) {
  let tempObj;
  tempObj = Object.assign({}, {
    method: "GET",
    mode: "cors"
  }, options);
  return tempObj;
}

const processCall = function(type, path, options) {
  let url = URLs[type + "_url"];
  let rdy_options = processHeaders(options);
  return fetch(url+path, rdy_options).then((response) => {
    return response.json();
  }).catch((error) => {
    console.log(error);
  });
}

export default {
  fieldtype: function(fieldtype) {
    return processCall("fieldtype", fieldtype + '/', {});
  },
  api: function(path, options = {}) {
    return processCall("api", path, options);
  },
  prepdata: function(data) {
    var form_data = new FormData();
    for ( var key in data ) {
      form_data.append(key, data[key]);
    }
    return form_data;
  },
  upload: function(componentObj) {
    var uploadProgress = function(e) {
			if (e.lengthComputable) {
        var percent_complete = (e.loaded / e.total) * 100;
				$(componentObj.progressEle).css('width',percent_complete+'%');
			}
    }
    return new Promise(function(resolve,reject) {
      // Set up the request.
      var xhr = new XMLHttpRequest();
      // Open the connection.
      xhr.open("POST", URLs.api_url + "/file/upload/", true);
      // Set headers.
      xhr.setRequestHeader("api-key", api_key);
      // Set up a handlers.
      xhr.upload.addEventListener("progress", function(e){
        uploadProgress(e);
      }, false);
      // Set up response.
      xhr.onload = function () { 
        let response;
        if (xhr.readyState == 4 && xhr.status === 200) {
          response = JSON.parse(xhr.responseText);
        } else {
          response = {
            success: false,
            message: "Error making request."
          };
        }
        resolve(response);
      };
      // Send the Data.
      xhr.send(componentObj.file);
    });
  }
}