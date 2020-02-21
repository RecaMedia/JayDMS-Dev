import React from 'react';
import Loader from './loader';
import makeCall from '../utilities/make-call';
import store from '../utilities/store';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default class ProfileEditor extends React.Component {

	constructor(props) {
    super(props);

    this.app_state = store.getState();

    this._onChange = this._onChange.bind(this);
    this._emailValidation = this._emailValidation.bind(this);
    this._addHiddenInputs = this._addHiddenInputs.bind(this);
    this._updateProfile = this._updateProfile.bind(this);

    // If mode prop is add, we provide blank user object
    let profile = (this.props.mode == "add" ? {
      confirmPassword: "",
      datetime: "",
      email: "",
      firstname: "",
      lastname: "",
      password: "",
      role: "",
      username: ""
    } : Object.assign({}, this.props.profile, {
      password: "",
      confirmPassword: "",
      originalUsername: this.props.profile.username
    }));

		this.state = {
      profile,
      currentUser: this.app_state.global.user
		}
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.app_state = store.getState();
      if (this.app_state.global.lastAction === "SET_USER") {
        this.setState({
          currentUser: this.app_state.global.user
        });
      }
    });
  }

  componentWillUnmount() {
		this.unsubscribe();
	}

  _onChange(itemKey, value) {
    // Clone profile object
    let profile = Object.assign({}, this.state.profile);
    // Input filters
    if (itemKey == "firstname" || itemKey == "lastname") {
      value = value.replace(/[^a-z0-9 ]/gi,'');
    }
    if (itemKey == "username") {
      value = value.replace(/[^A-Za-z0-9!@#$%^&*_-]/gi,'');
    }
    // Set key
    profile[itemKey] = value;
    this.setState({profile});
  }

  _emailValidation(email) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return true;
    } else {
      return false;
    }
  }

  _addHiddenInputs(theForm, key, value) {
    // Create a hidden input element, and append it to the form:
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = key; // 'the key/name of the attribute/field that is sent to the server
    input.value = value;
    theForm.appendChild(input);
  }

  _updateProfile() {
    let form_errors = false;
    let form_error_msg = "";

    // Validation process
    if (this.state.profile.username == "" || this.state.profile.username.length < 6) {
      form_errors = true;
      form_error_msg = "Username must not be empty and at least 6 characters long. ";
    }
    if (!this._emailValidation(this.state.profile.email)) {
      form_errors = true;
      form_error_msg += "Email is not valid. ";
    }
    if (this.state.profile.firstname.length < 3) {
      form_errors = true;
      form_error_msg += "First name must be at least 3 characters long. ";
    }
    if (this.state.profile.lastname.length < 3) {
      form_errors = true;
      form_error_msg += "Last name must be at least 3 characters long. ";
    }
    if (this.state.profile.role == "") {
      form_errors = true;
      form_error_msg += "User role must be selected. ";
    }
    if (this.state.profile.password.length && this.state.profile.password.length < 6) {
      form_errors = true;
      form_error_msg += "New password must be at least 6 characters long. ";
    }
    if (this.state.profile.password.length && this.state.profile.password !== this.state.profile.confirmPassword) {
      form_errors = true;
      form_error_msg += "New password mismatch. ";
    }

    if (!form_errors) {
      makeCall.api("users/" + (this.props.mode == "add" ? "add/" : "update/"), {
        method: 'POST',
        body: makeCall.prepdata({
          json: JSON.stringify(this.state.profile)
        })
      }).then((response) => {
        if (response.success) {
          if (this.props.mode == "add") {
            // Go back to users list
            this.props.history.push(this.props.basename + '/users');
          } else {
            // Simply reload if just updating
            // This will allow for the session var to update user data within the JS
            location.reload();
          }
        } else {
          store.dispatch({
            type: "NEW_ALERT",
            alert: {
              title: "Failed.",
              message: response.message,
              type: "danger"
            }
          });
        }
      });
    } else {
      MySwal.fire({
        title: "Validation Error",
        text: form_error_msg,
        showCloseButton: true
      });
    }
  }

  render() {
    let content = <Loader/>;

    // Current user is required to access form
    if (this.state.currentUser != null) {
      content = <div>
        <div className="row">
          <div className="col-12 col-sm-6">
            <div className="form-group">
              <label htmlFor="Username">Username</label>
              <input id="Username" type="text" className="form-control" value={this.state.profile.username} onChange={(e) => this._onChange("username", e.target.value)} required/>
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="form-group">
              <label htmlFor="Email">Email</label>
              <input id="Email" type="email" className="form-control" value={this.state.profile.email} onChange={(e) => this._onChange("email", e.target.value)} required/>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-sm-6">
            <div className="form-group">
              <label htmlFor="FirstName">First Name</label>
              <input id="FirstName" type="text" className="form-control" value={this.state.profile.firstname} onChange={(e) => this._onChange("firstname", e.target.value)} required/>
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="form-group">
              <label htmlFor="LastName">Last Name</label>
              <input id="LastName" type="text" className="form-control" value={this.state.profile.lastname} onChange={(e) => this._onChange("lastname", e.target.value)} required/>
            </div>
          </div>
        </div>
        {(this.app_state.global.user != null && this.app_state.global.user.role == "administrator" ?
          <div className="row">
            <div className="col-12 col-sm-6">
              <div className="form-group">
                <label htmlFor="Role">Role</label>
                <select id="Role" className="form-control" value={this.state.profile.role} onChange={(e) => this._onChange("role",e.target.value)} required>
                  <option value="">Select Role</option>
                  <option value="administrator">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
            </div>
          </div>
        : null)}
        <hr/>
        <div className="row">
          <div className="col-12 col-sm-6">
            <div className="form-group">
              <label htmlFor="Password">New Password</label>
              <input id="Password" type="password" className="form-control" value={this.state.profile.password} onChange={(e) => this._onChange("password", e.target.value)}/>
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="form-group">
              <label htmlFor="ConfirmPassword">Confirm Password</label>
              <input id="ConfirmPassword" type="password" className="form-control" value={this.state.profile.confirmPassword} onChange={(e) => this._onChange("confirmPassword", e.target.value)}/>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12 text-right">
            <button className="btn ui-btn" onClick={() => this._updateProfile()}>{(this.props.mode == "add" ? "Add" : "Update")}</button>
          </div>
        </div>
      </div>;
    }

    return content;
	}
}