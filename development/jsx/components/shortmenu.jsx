import React from 'react';
import makeCall from '../utilities/make-call';
import generalFunctions from '../utilities/general-functions';

import store from '../utilities/store';

export default class ShortMenu extends React.Component { 

  constructor(props) {
    super(props);

    this.app_state = store.getState();

    this._getMenus = this._getMenus.bind(this);
    this._goBack = this._goBack.bind(this);
    this._goToMenu = this._goToMenu.bind(this);
    this._buildMenu = this._buildMenu.bind(this);
    this._insertShortcode = this._insertShortcode.bind(this);

    this.state = {
      menus: [],
      coreMenus: {},
      postTypes: this.app_state.global.postTypes,
      stashes: this.app_state.global.stashes
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return null;
  }

  componentDidMount() {
    // Listen to any updates to stashes
    this.unsubscribe = store.subscribe(() => {
      this.app_state = store.getState();
      if (this.app_state.global.lastAction === "UPDATE_POSTTYPES") {
        let postTypes = this.app_state.global.postTypes;
        this.setState({postTypes});
      }
      if (this.app_state.global.lastAction === "UPDATE_STASHES") {
        let stashes = this.app_state.global.stashes;
        this.setState({stashes});
      }
    });
    
    this._getMenus();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  _getMenus() {
    makeCall.api("general/loadMenus/", {
      method: 'GET'
    }).then((menus_response) => {
      if (menus_response.success) {
        let coreMenus = menus_response.menus;
        // Set loaded menus
        this.setState({coreMenus});
      }
    });
  }

  _goBack() {
    let menus = Array.from(this.state.menus);
    if (menus.length == 0 && typeof this.props.toggle === 'function') {
      // Reset menus before closing
      this.setState({menus:[]}, () => {
        this.props.toggle(false);
      })
    } else {
      menus.pop();
      this.setState({menus});
    }
  }

  _goToMenu(build_type, extra_arg = null) {
    let _self = this;

    /* This will be implemented later */

    // function buildFromPost(list, print) {
    //   return <ul>
    //     {list.map((post, i) => {
    //       print = "{{ " + print + " | raw }}";
    //       print = "{% for post in " + print + "[\"" + post.slug + "\"] %}\n\n{% endfor %}";
    //       return <li key={i}>
    //         <button className="btn ui-btn" onClick={() => _self._insertShortcode(print)}>{generalFunctions.dashesToSpacesAndCaps(post.slug)}</button>
    //       </li>
    //     })}
    //   </ul>;
    // }

    // Private functions
    function buildFromPostOrStashData(json, print) {
      return <ul>
        {json.order.map((component, i) => {
          if (json.data[component] != undefined && json.data[component][i] != undefined) {
            let arg = {
              print: print + "." + component + "." + i,
              data: json.data[component][i]
            };
            return <li key={i}>
              <button className="btn ui-btn" onClick={() => _self._goToMenu("component", arg)}>{i}. {generalFunctions.underscoresToSpacesAndCaps(component)}</button>
            </li>
          }
        })}
      </ul>;
    }

    // Defaults variables
    let latest_menu_item = null;
    let menus = Array.from(this.state.menus);

    switch (build_type) {

      case 'core':

        let arg = {
          print: "menus"
        };

        // Build menu
        latest_menu_item = <ul>
          <li>
            <button className="btn ui-btn" onClick={() => (Object.keys(this.state.coreMenus).length ? this._goToMenu("menu", arg) : console.log("Menus not found."))}>Menus</button>
          </li>
        </ul>
        // Push to menu array
        menus.push(latest_menu_item);
        this.setState({menus});

      break;
      case 'menu':

        // Build menu
        latest_menu_item = <ul>
          {Object.keys(this.state.coreMenus).map((menu_name, i) => {
            let menu = this.state.coreMenus[menu_name];
            let print_menu = "{{ " + extra_arg.print + "." + menu.slug + " | raw }}";
            return <li key={i}>
              <button className="btn ui-btn" onClick={() => this._insertShortcode(print_menu)}>{menu.title}</button>
            </li>
          })}
        </ul>
        // Push to menu array
        menus.push(latest_menu_item);
        this.setState({menus});

      break;
      case 'posttypes':

        // Build menu
        latest_menu_item = <ul>
          {this.state.postTypes.map((posttype, i) => {

            /* This will be implemented later */

            // let arg = {
            //   print: "posttype",
            //   index: i
            // };
            // this._goToMenu("posttype", arg)

            let print_posttype = "{% for post in getPosts('" + posttype.slug + "') %}\n\n" +
              "<!--\n" +
                "{{ post.title }}\n" +
                "{% for tag in post.tags %}\n" +
                "  {{ tag }}\n" +
                "{% endfor %}\n" +
                "{{ post.description }}\n" +
                "{{ post.publish }}\n" +
                "{{ post.values }}\n" +
              "-->\n\n" +
            "{% endfor %}";

            return <li key={i}>
              <button className="btn ui-btn" onClick={() => this._insertShortcode(print_posttype)}>{generalFunctions.underscoresToSpacesAndCaps(posttype.slug)}</button>
            </li>
          })}
        </ul>
        // Push to menu array
        menus.push(latest_menu_item);
        this.setState({menus});

      break;
      case 'posttype':

        // Get stash
        let postTypes = Array.from(this.state.postTypes);
        let postType = postTypes[extra_arg.index];
        // Add to print path
        let print_posttype = extra_arg.print + "." + postType.slug
        // Check if json already exist, if not, make call
        if (postType.list != undefined) {
          // Build menu
          latest_menu_item = buildFromPostTypes(postType.list, print_posttype);
          // Push to menu array
          menus.push(latest_menu_item);
          this.setState({menus});
        } else {
          // Make call
          makeCall.api("posts/list/", {
            method: 'POST',
            body: makeCall.prepdata({
              posttype: postType.slug
            })
          }).then((response) => {
            if (response.success) {
              // Remove frontend since it's not needed for stash data
              let list = response.list;
              // Store data for future use instead of making another call
              postTypes[extra_arg.index] = Object.assign({}, postType, {list})
              // Build menu
              latest_menu_item = buildFromPostTypes(list, print_posttype);
              // Push to menu array
              menus.push(latest_menu_item);
              this.setState({
                menus,
                postTypes
              });
            }
          });
        }

      break;
      case 'stashes':

        // Build menu
        latest_menu_item = <ul>
          {this.state.stashes.map((stash, i) => {
            let arg = {
              print: "stashes",
              index: i
            };
            return <li key={i}>
              <button className="btn ui-btn" onClick={() => this._goToMenu("stash", arg)}>{generalFunctions.underscoresToSpacesAndCaps(stash.slug)}</button>
            </li>
          })}
        </ul>
        // Push to menu array
        menus.push(latest_menu_item);
        this.setState({menus});

      break;
      case 'stash':

        // Get stash
        let stashes = Array.from(this.state.stashes);
        let stash = stashes[extra_arg.index];
        // Add to print path
        let print_stash = extra_arg.print + "." + stash.slug;
        // Check if json already exist, if not, make call
        if (stash.json != undefined) {
          // Build menu
          latest_menu_item = buildFromPostOrStashData(stash.json, print_stash);
          // Push to menu array
          menus.push(latest_menu_item);
          this.setState({menus});
        } else {
          // Make call
          makeCall.api("stashes/loaddata/", {
            method: 'POST',
            body: makeCall.prepdata({
              stash: stash.slug
            })
          }).then((response) => {
            if (response.success) {
              // Remove frontend since it's not needed for stash data
              let json = response.data.json;
              if (json.frontend != undefined) {
                delete json.frontend;
              }
              // Store data for future use instead of making another call
              stashes[extra_arg] = Object.assign({}, stash, {json})
              // Build menu
              latest_menu_item = buildFromPostOrStashData(json, print_stash);
              // Push to menu array
              menus.push(latest_menu_item);
              this.setState({
                menus,
                stashes
              });
            }
          });
        }

      break;
      case 'component':

        // Build menu
        latest_menu_item = <ul>
          {Object.keys(extra_arg.data).map((field, i) => {
            let callback = () => {
              let data = extra_arg.data[field];
              if (typeof data == "object" && data.hasOwnProperty("order") && data.hasOwnProperty("data") && data.hasOwnProperty("frontend")) {
                let arg = {
                  print: extra_arg.print + "." + field + ".data",
                  json: data
                }
                this._goToMenu("componentField", arg);
              } else if (typeof data == "object") {
                let arg = {
                  print: extra_arg.print + "." + field,
                  data
                }
                this._goToMenu("groupField", arg);
              } else {
                let print = "{{ " + extra_arg.print + "." + field + " | raw }}";
                this._insertShortcode(print);
              }
            }
            return <li key={i}>
              <button className="btn ui-btn" onClick={() => callback()}>{generalFunctions.underscoresToSpacesAndCaps(field)}</button>
            </li>
          })}
        </ul>
        // Push to menu array
        menus.push(latest_menu_item);
        this.setState({menus});

      break;
      case 'componentField':

        // Build menu
        latest_menu_item = buildFromPostOrStashData(extra_arg.json, extra_arg.print);
        // Push to menu array
        menus.push(latest_menu_item);
        this.setState({menus});

      break;
      case 'groupField':
        
        // Build menu
        latest_menu_item = <ul>
          {Object.keys(extra_arg.data).map((field, i) => {
            let print_groupfield = "{{ " + extra_arg.print + "." + field + " | raw }}";
            return <li key={i}>
              <button className="btn ui-btn" onClick={() => this._insertShortcode(print_groupfield)}>{generalFunctions.underscoresToSpacesAndCaps(field)}</button>
            </li>
          })}
        </ul>
        // Push to menu array
        menus.push(latest_menu_item);
        this.setState({menus});

      break;
    }
  }

  _buildMenu() {
    let menu;

    if (this.state.menus.length == 0) {
      // Default shortcode menu
      menu = <ul>
        <li>
          <button className="btn ui-btn" onClick={() => this._goToMenu("core")}>Core</button>
        </li>
        {(this.state.postTypes.length ?
          <li>
            <button className="btn ui-btn" onClick={() => this._goToMenu("posttypes")}>Post Types</button>
          </li>
        : null)}
        {(this.state.stashes.length ?
          <li>
            <button className="btn ui-btn" onClick={() => this._goToMenu("stashes")}>Stashes</button>
          </li>
        : null)}
      </ul>
    } else {
      // Else build custom menu based on the last item within array
      menu = this.state.menus[this.state.menus.length - 1];
    }

    return menu;
  }

  _insertShortcode(print) {
    if (typeof this.props.insert === 'function') {
      this.props.insert(print);
      // Reset menus before closing
      this.setState({menus:[]}, () => {
        this.props.toggle(false);
      })
    }
  }

  render() {
    return (
      <div className="ui-shortmenu">
        <div className="ui-shortmenu__header">
          <button className="ui-shortmenu__header__back-btn" onClick={() => this._goBack()}>
            <i className="icon ion-md-arrow-round-back"></i>
          </button>
          Data Inserts
        </div>
        {this._buildMenu()}
      </div>
    )
  }
}

