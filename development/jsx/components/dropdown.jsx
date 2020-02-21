import React from 'react';
import { Link } from "react-router-dom";
import store from '../utilities/store';

export default class Dropdown extends React.Component {

  constructor(props) {
    super(props);

    this._toggle = this._toggle.bind(this);

    this.state = {
      name: (this.props.name?this.props.name:"Dropdown"),
      list: (this.props.list?this.props.list:[{name:"Item",value:"/"}]),
      toggle: false
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.name = (nextProps.name?nextProps.name:"Dropdown");
    temp_state.list = (nextProps.list?nextProps.list:[{name:"Item",value:"/"}]);
    return temp_state;
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.app_state = store.getState();
      if (this.app_state.global.lastAction === "CLOSE_MENU_DROPDOWNS") {
        this.setState({
          toggle: false
        });
      }
    });
  }

  componentWillUnmount() {
		this.unsubscribe();
	}

  _toggle(setToggle = null) {
    let toggle;

    if (setToggle == null) {
      if (this.state.toggle) {
        toggle = false;
      } else {
        store.dispatch({
          type: "CLOSE_MENU_DROPDOWNS"
        });
        toggle = true;
      }
    } else {
      toggle = setToggle;
    }

    this.setState({toggle});
  }

  render() {
    return (
      <li className={"nav-item dropdown"+(this.state.toggle?" show":"")+(this.props.className!=undefined?" "+this.props.className:"")}>
        <a className="nav-link dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded={this.state.toggle} onMouseEnter={() => this._toggle(true)} onMouseLeave={() => this._toggle(false)} onClick={() => this._toggle()}>{this.state.name}</a>
        <div className={"dropdown-menu"+(this.state.toggle?" show":"")} onMouseEnter={() => this._toggle(true)} onMouseLeave={() => this._toggle(false)}>
          {
            this.state.list.map((item,i) => {
              if (item.anchor) {
                return <a key={i} className="dropdown-item" href={item.value}>{item.name}</a>
              } else {
                return <Link key={i} className="dropdown-item" to={item.value}>{item.name}</Link>
              }
            })
          }
        </div>
      </li>
    )
  }
}