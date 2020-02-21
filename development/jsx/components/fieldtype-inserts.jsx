import React from 'react';
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from 'react-sortable-hoc';
import Fieldtype from '../components/fieldtype';

const addModClass = (col_size) => {
  let className = "";

  switch (col_size) {
    case 'col-lg-3':
      className = col_size+" ui-width__quarter";
    break;
    case 'col-lg-6':
      className = col_size+" ui-width__half";
    break;
    case 'col-lg-9':
      className = col_size+" ui-width__three-fourth";
    break;
    case 'col-lg-12':
      className = col_size+" ui-width__full";
    break;
  }

  return className;
}

const SortableItem = SortableElement(({fieldType, handleMeta, onRemove}) => <div className={"col-sm-12 col-md-6 " + addModClass(fieldType.meta.ui_size)}><Fieldtype fieldType={fieldType} onMetaUpdate={handleMeta} onRemove={onRemove}/></div>);

const SortableList = SortableContainer(({inserts, handleMeta, onRemove}) => {
  return (
    <div className="row">
      {inserts.map((fieldType, index) => (
        // "key" and "index" are required props
        <SortableItem key={`item-${index}`} index={index} fieldType={fieldType} handleMeta={handleMeta} onRemove={onRemove}/>
      ))}
    </div>
  );
});

export default class FieldTypeInserts extends React.Component {

  constructor(props) {
    super(props);

    this._handleMeta = this._handleMeta.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._onSortEnd = this._onSortEnd.bind(this);

    this.state = {
      inserts: Array.from(this.props.inserts),
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.inserts = (nextProps.inserts==undefined?[]:nextProps.inserts);
    return temp_state;
  }

  _handleMeta(fieldType) {
    let inserts = this.state.inserts;
    inserts[fieldType.meta.ui_index] = fieldType;
    if (typeof this.props.callback === "function") {
      this.props.callback(inserts);
    }
  }

  _onRemove(index) {
    let new_inserts;
    if (this.state.inserts.length > 1) {
      new_inserts = Array.from(this.state.inserts);
      new_inserts.splice(index, 1);
    } else {
      new_inserts = [];
    }
    if (typeof this.props.callback === "function") {
      this.props.callback(new_inserts);
    }
  }

  _onSortEnd({oldIndex, newIndex}) {
    if (typeof this.props.callback === "function") {
      this.props.callback(arrayMove(this.state.inserts, oldIndex, newIndex));
    }
  }

  render() {
    // "onSortEnd" comes from the SortableContainer wrapper and is not a prop that passes down
    return <SortableList inserts={this.state.inserts} handleMeta={this._handleMeta} onRemove={this._onRemove} onSortEnd={this._onSortEnd}/>;
  }
}