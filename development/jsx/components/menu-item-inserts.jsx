import React from 'react';

export default class MenuItemInserts extends React.Component {

	constructor(props) {
    super(props);

    this._toggleItem = this._toggleItem.bind(this);
    this._add = this._add.bind(this);
    this._createGroup = this._createGroup.bind(this);
    
    this.state = {
      data: this.props.data
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.data = (nextProps.data==undefined?[]:nextProps.data);
    return temp_state;
  }

  _toggleItem(event) {
    let item_element = event.target;
    let open = false;

    if (item_element.classList.contains('ui-navlist__item-parent--open')) {
      open = true;
      item_element.classList.remove('ui-navlist__item-parent--open');
    } else {
      item_element.classList.add('ui-navlist__item-parent--open');
    }

    for (var i = 0; i < item_element.childNodes.length; i++) {
      let icon_element = item_element.childNodes[i];
      let search_for = (open ? "ion-md-arrow-dropup" : "ion-md-arrow-dropdown");
      let change_to = (open ? "ion-md-arrow-dropdown" : "ion-md-arrow-dropup");
      if (icon_element.classList != undefined && icon_element.classList.contains(search_for)) {
        icon_element.classList.remove(search_for);
        icon_element.classList.add(change_to);
        break;
      }        
    }
  }

  _add(data) {
    if (typeof this.props.onAddCallback === 'function') {
      this.props.onAddCallback("add", data);
    }
  }

  _createGroup(menu_data){
    return <ul className="ui-navlist ui-navlist--menu-items list-group">
      {menu_data.map((item,i) => {
        let classes = "";
        let icon = "icon ion-md-add";
        let extra = null;
        if (item.type != null) {
          classes = " list-group-item-action";
        }
        if (item.children != null) {
          classes = " ui-navlist__item-parent";
          icon = "icon ion-md-arrow-dropdown";
          extra = this._createGroup(item.children);
        }
        return <li key={i} className={"list-group-item" + classes} onClick={(e) => (item.children != null ? this._toggleItem(e) : this._add(item.data))}>
          <span>{item.title}</span>
          <i className={icon}></i>
          {extra}
        </li>
      })}
    </ul>
  }

  render() {
		return this._createGroup(this.state.data);
	}
}