import React from 'react';
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from 'react-sortable-hoc';
import Component from '../components/component';

const SortableItem = SortableElement(({index, indexKey, component, onRemove}) => {
  return <div className="col-12"><Component index={indexKey} component={component} onRemove={onRemove}/></div>
});

const SortableList = SortableContainer(({components, onRemove}) => {
  return (
    <div className="row">
      {
        components.map((component, index) => {
          return <SortableItem key={`item-${index}`} index={index} indexKey={index} component={component} onRemove={onRemove}/>
        })
      }
    </div>
  );
});

export default class ComponentSort extends React.Component {

  constructor(props) {
    super(props);

    this._onRemove = this._onRemove.bind(this);
    this._onSortEnd = this._onSortEnd.bind(this);

    this.state = {
      components: Array.from(this.props.components),
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.components = (nextProps.components==undefined?[]:nextProps.components);
    return temp_state;
  }

  _onRemove(index) {
    let new_components;
    if (this.state.components.length > 1) {
      new_components = Array.from(this.state.components);
      new_components.splice(index, 1);
    } else {
      new_components = [];
    }
    if (typeof this.props.callback === "function") {
      this.props.callback(new_components);
    }
  }

  _onSortEnd({oldIndex, newIndex}) {
    if (typeof this.props.callback === "function") {
      this.props.callback(arrayMove(this.state.components, oldIndex, newIndex));
    }
  }

  render() {
    return <SortableList components={this.state.components} onRemove={this._onRemove} onSortEnd={this._onSortEnd}/>;
  }
}