import React from 'react';
import { Link } from "react-router-dom";
import makeCall from '../utilities/make-call';
import generalFunctions from '../utilities/general-functions';
import store from '../utilities/store';

import Dropdown from '../components/dropdown'

export default class Menu extends React.Component {

  constructor(props) {
    super(props);

    this.app_state = store.getState();

    this.getPostTypesForMenu = this.getPostTypesForMenu.bind(this);
    this.getStashesForMenu = this.getStashesForMenu.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    
    this.state = {
      showDropdown: false,
      postTypeMenuCount: 0,
      postTypeMenu: null,
      stashMenuCount: 0,
      stashMenu: null
    }
  }

  componentDidMount() {
    makeCall.api("posttypes/list/").then((response) => {
      if (response.success) {
        let postTypes = generalFunctions.objectInArraySort(response.list);
        store.dispatch({
          type: "UPDATE_POSTTYPES",
          postTypes
        })
      }
    });

    makeCall.api("stashes/list/").then((response) => {
      if (response.success) {
        let stashes = generalFunctions.objectInArraySort(response.list);
        store.dispatch({
          type: "UPDATE_STASHES",
          stashes
        })
      }
    });

    this.unsubscribe = store.subscribe(() => {
      this.app_state = store.getState();
      if (this.app_state.global.lastAction === "UPDATE_POSTTYPES") {
        this.getPostTypesForMenu();
      }
      if (this.app_state.global.lastAction === "UPDATE_STASHES") {
        this.getStashesForMenu();
      }
      if (this.app_state.global.lastAction === "CLOSE_MENU") {
        this.setState({
          showDropdown: false
        });
			}
		});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

  componentDidUpdate(prevProps, prevState) {
    if (prevState.postTypeMenuCount != this.state.postTypeMenuCount) {
      this.getPostTypesForMenu();
    }
    if (prevState.stashMenuCount != this.state.stashMenuCount) {
      this.getStashesForMenu();
    }
  }

  getPostTypesForMenu() {
    let posttypes = this.app_state.global.postTypes;

    if (posttypes.length) {
      let menu_list = [];

      posttypes.map((posttype) => {
        menu_list.push({
          name: generalFunctions.dashesToSpacesAndCaps(posttype.slug),
          value: this.props.basename + "/pt/"+posttype.slug
        });
      });

      let postTypeMenu = <Dropdown name={"Post Types"} list={menu_list}/>

      this.setState({
        postTypeMenuCount: posttypes.length,
        postTypeMenu
      });
    } else {
      this.setState({
        postTypeMenuCount: 0,
        postTypeMenu: null
      });
    }
  }

  getStashesForMenu() {
    let stashes = this.app_state.global.stashes;

    if (stashes.length) {
      let menu_list = [];

      stashes.map((stash) => {
        menu_list.push({
          name: generalFunctions.underscoresToSpacesAndCaps(stash.slug),
          value: this.props.basename + "/stash/"+generalFunctions.spacesToDashes(generalFunctions.underscoresToSpacesAndCaps(stash.slug))
        });
      });

      let stashMenu = <Dropdown name={"Stashes"} list={menu_list}/>

      this.setState({
        stashMenuCount: stashes.length,
        stashMenu
      });
    } else {
      this.setState({
        stashMenuCount: 0,
        stashMenu: null
      });
    }
  }

  toggleDropdown() {
    this.setState({
      showDropdown: (this.state.showDropdown ? false : true)
    })
  }

  render() {
    return (
      <nav id="Nav" className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand" href="http://jaydms.com" target="_blank">
          <svg className="ui-logo" version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="429.8px" height="464.2px" viewBox="0 0 429.8 464.2">
            <path className="st0" d="M111.3,203.5c0,0-34.5,15.6-64.8,42.9C15.8,274.1,0,295.5,0,295.5s29.8-3.2,63.8-8.6
              c13.9-2.2,19.3-2.2,25.2-6.8c7.5-5.7,4.9-24.3,10.7-33.6c6.6-10.5,12.7-16,31.4-16.9c29.9-1.4,57.6,20.8,81.8-0.4
              c14.9-13.1,14.7-22.2,18.7-32.5c4.5-11.5,21.3-23.2,21.3-23.2c-28.3,18.9-37.6,25.6-67.4,37c-20.2,7.7-37,11.7-54.8,10.1
              C112.9,219,111.3,203.5,111.3,203.5z"/>
            <path className="st0" d="M303.6,0c18.6,0,46.3,2.4,57.1,7.2c10.8,4.8,18.5,12,23.2,21.5s7,22.4,7,38.4v52c0,10.8,1.4,19.1,4.1,25
              c2.8,5.9,6.8,10,12.2,12.4c5.4,2.4,12.9,3.6,22.5,3.6V175c-9.7,0-17.3,1.2-22.7,3.6c-5.4,2.4-9.5,6.6-12.1,12.5
              c-2.7,5.9-4,14.3-4,24.9v52c0,16.1-2.3,28.9-7,38.4c-4.7,9.5-12.4,16.7-23.2,21.5c-10.8,4.8-38.5,7.2-57.1,7.2h-4.7v-14.6
              c9.5,0,29.6-0.5,34.3-1.5c4.7-1,8.6-2.6,11.5-4.6c2.9-2,5.4-4.7,7.3-7.9c1.9-3.2,3.4-7.7,4.5-13.5s1.6-13.4,1.6-22.9v-34.9
              c0-12.1,1-22.2,3.1-30.3c2.1-8.1,5.9-15.1,11.3-21.1c5.4-5.9,12.8-10.8,22.1-14.7V166c-9.1-3.7-16.5-8.6-22-14.8
              s-9.4-13.3-11.4-21.5c-2-8.2-3.1-18.1-3.1-29.8V65c0-9.5-0.5-17.1-1.6-22.9s-2.6-10.3-4.5-13.5c-1.9-3.2-4.4-5.9-7.3-7.9
              c-2.9-2-6.8-3.6-11.5-4.6c-4.7-1-24.9-1.5-34.3-1.5V0H303.6z"/>
            <path className="st0" d="M330.3,26.5c-12.8-4.5-40-2.7-40-2.7c-34.4,3.5-64.3,16.9-64.3,16.9s17-12.1,35.8-18.5
              c12.2-4.2,21.5-6.1,27.5-7V0c0,0.4-14.3,1.5-36.5,10.7c0,0-53.7,22.7-86.6,56.2c-44.2,45-56.7,106.7-59,119.2
              c0,0,36.7-91.2,125.1-123.2c24-8.7,43.4-13.6,58-16.4c10.3-1.7,10.3-1.7,19.8-2.1c11.3-0.5,35.8,2.8,35.8,2.8S348.1,32.8,330.3,26.5
              z"/>
            <path className="st0" d="M298.9,300.3c-15.2,2.1-32.1,16.4-43.2,25c-32.5,24.8-62,24-90.1,15.4c-46.7-14.2-50.4-55.1-50.4-55.1
              s-9.9,5.6-13.5,16l0,0c0,0-12,25.6-7.8,63.4c1.5,13.2,7.9,40.9,23.1,60.6c18.3,23.7,45.9,38.6,45.9,38.6s-6.3-21.1,13.5-36.8
              c13.5-10.7,30.4-19.3,39.9-23.7c2.5-1.1,4.9-2,7.2-3.1c0,0,0,0.1,0,0.1c21.9-10.5,35.4-21.9,45.6-33.1c-18.1,8.7-33.1,8.7-33.1,8.7
              s22.2-8,33.9-16.3c7.8-5.6,14.3-13.3,19.3-20.9v-17.7c-1,0.4-3.5,0.9-5.5,1.7c-6.6,2.5-14.3,9.6-14.3,9.6s4-6.4,9.9-10.6
              c2.1-1.5,6.5-4.4,10.8-6.6c4-2.1,11.5-3.2,17.5-3.4c8.1-0.2,22,0.3,28.8-2.7s8.9-9.9,8.9-9.9s3.9-8.9,3.3-19.9
              C344.3,302.3,311.6,298.5,298.9,300.3z"/>
            <path className="st0" d="M327,106.8c-6.2-6.5-22.3-15.7-22.3-15.7s4.3-11,18.3-21.3c6.1-4.5,12.1-7.9,17.1-10.4
              c-15.5-2.6-35.6-3.1-59.8,2.1C212,76.1,183,106,167.9,118.7c-20.1,16.9-46.3,57.2-46.3,57.2s54.6-44.6,111.6-52.5
              c45.7-6.3,83.3,0.5,108.2,8.1C339.3,125.4,335,115.2,327,106.8z"/>
          </svg>
          <div>JayDMS</div>
        </a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" onClick={() => this.toggleDropdown()}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={"navbar-collapse collapse " + (this.state.showDropdown ? "show" : "")} id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link className="nav-link" to={this.props.basename + "/"}>Dashboard</Link>
            </li>
            {this.state.stashMenu}
            {this.state.postTypeMenu}
            {(this.app_state.global.user != null && (this.app_state.global.user.role == "administrator" || this.app_state.global.user.role == "manager") ?
              <Dropdown name={"Global"} list={[
                {name:"Menu Manager",value: this.props.basename + "/global/menu-manager"},
                {name:"Front-End",value: this.props.basename + "/global/front-end"},
                {name:"Settings",value: this.props.basename + "/global/settings"},
                {name:"File Manager",value: this.props.basename + "/global/file-manager"},
                {name:"Users",value: this.props.basename + "/users"}
              ]}/>
            :null)}
            {(this.app_state.global.user != null && this.app_state.global.user.role == "administrator" ?
              <Dropdown name={"Developer"} list={[
                {name:"Field Types",value: this.props.basename + "/developer/fieldtypes"},
                {name:"Components",value: this.props.basename + "/developer/components"},
                {name:"Templates",value: this.props.basename + "/developer/templates"},
                {name:"Post Types",value: this.props.basename + "/developer/posttypes"},
                {name:"Stashes",value: this.props.basename + "/developer/stashes"}
              ]}/>
            :null)}
            <Dropdown name={"Account"} list={[
              {name:"Edit",value: this.props.basename + "/users/edit/me"},
              {name:"Sign-Out",value: this.props.basename + "/?signout=true",anchor:true}
            ]}/>
            <li className="nav-item">
              <a className="nav-link donate" href="https://github.com/sponsors/RecaMedia" target="_blank"><i className="icon ion-md-heart"></i> Donate</a>
            </li>
          </ul>
        </div>
      </nav>
    )
  }
}