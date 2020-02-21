import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isDescendant } from './utils/tree-data-utils';
import ChangeNodeAtPath from './utils/change-node-at-path';
import classnames from './utils/classnames';
import Modal from '../../utilities/modal';

class NodeRendererDefault extends Component {

  constructor(props) {
    super(props);

    this.buffer = null;

    this._nodeChange = this._nodeChange.bind(this);

    this.state = {
      treeData: this.props.treedata,
      treeIndex: this.props.treeIndex,
      path: this.props.path,
      node: this.props.node
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      treeData: nextProps.treedata,
      treeIndex: nextProps.treeIndex,
      path: nextProps.path,
      node: nextProps.node
    }
  }

  _toggleOptions(show, options) {
    this.props.editor.toggleCurtain(show, options);
  }

  _nodeChange(key, value) {
    let temp_obj = {};
    temp_obj[key] = value;

    let newNode = (value ? Object.assign({}, this.state.node, temp_obj) : false);

    let changeNodeObject = {
      treeData: this.state.treeData,
      path: this.state.path,
      newNode
    };

    let processedData = new ChangeNodeAtPath(changeNodeObject);
    this.props.editor.treeChange(processedData.newTreeData);
  }

  render() {

    const {
      scaffoldBlockPxWidth,
      toggleChildrenVisibility,
      connectDragPreview,
      connectDragSource,
      isDragging,
      canDrop,
      canDrag,
      node,
      title,
      subtitle,
      draggedNode,
      path,
      treeIndex,
      isSearchMatch,
      isSearchFocus,
      buttons,
      className,
      style,
      didDrop,
      treeId,
      isOver, // Not needed, but preserved for other renderers
      parentNode, // Needed for dndManager
      rowDirection,
      ...otherProps
    } = this.props;

    const rowDirectionClass = rowDirection === 'rtl' ? 'rst__rtl' : null;

    let handle;
    if (canDrag) {
      if (typeof node.children === 'function' && node.expanded) {
        // Show a loading symbol on the handle when the children are expanded
        //  and yet still defined by a function (a callback to fetch the children)
        handle = (
          <div className="rst__loadingHandle">
            <div className="rst__loadingCircle">
              {[...new Array(12)].map((_, index) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className={classnames(
                    'rst__loadingCirclePoint',
                    rowDirectionClass
                  )}
                />
              ))}
            </div>
          </div>
        );
      } else {
        // Show the handle used to initiate a drag-and-drop
        handle = connectDragSource(<div className="rst__moveHandle">
            <i className="icon ion-md-menu"></i>
          </div>, {
          dropEffect: 'copy',
        });
      }
    }

    const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node);
    const isLandingPadActive = !didDrop && isDragging;

    let buttonStyle = { left: -0.5 * scaffoldBlockPxWidth };
    if (rowDirection === 'rtl') {
      buttonStyle = { right: -0.5 * scaffoldBlockPxWidth };
    }

    let left_count = Object.keys(path).length;
    let right_padding = (left_count * 44) + 10;
    let has_children = (this.state.node.children != null ? true : false);

    let options = <div className="ui-card ui-card--options">
      <div className="row">
        <div className="col-12">
          <div className="ui-card__title">
            <h3>Menu Item Options</h3>
            <div className="ui-card__title__menu">
              <button className="btn ui-btn ui-btn-text" onClick={() => Modal.remove()}><i className="icon ion-md-remove-circle-outline"></i></button>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className={"col-12" + (has_children ? " col-sm-6" : "")}>
          <div className="form-group row">
            <label>Label</label>
            <input className="form-control" type="text" placeholder="Link Label" defaultValue={this.state.node.subtitle} onChange={(e) => this._nodeChange("subtitle", e.target.value)}/>
          </div>
        </div>
        {(has_children ? 
          <div className="col-12 col-sm-6">
            <div className="form-group row">
              <label>Wrapper Class</label>
              <input className="form-control" type="text" placeholder="Link Label" defaultValue={this.state.node.classWrapper} onChange={(e) => this._nodeChange("classWrapper", e.target.value)}/>
            </div>
          </div>
        : "")}
      </div>
      {(has_children ? 
        <div className="row">
          <div className="col-12 col-sm-6">
            <div className="form-group row">
              <label>Item Class</label>
              <input className="form-control" type="text" placeholder="Link Label" defaultValue={this.state.node.classItem} onChange={(e) => this._nodeChange("classItem", e.target.value)}/>
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="form-group row">
              <label>Link Class</label>
              <input className="form-control" type="text" placeholder="Link Label" defaultValue={this.state.node.classLink} onChange={(e) => this._nodeChange("classLink", e.target.value)}/>
            </div>
          </div>
        </div>
      : "")}
      <div className="row">
        <div className="col-12 col-sm-6">
          <div className="form-group row">
            <label>Target</label>
            <select className="form-control" defaultValue={this.state.node.target} onChange={(e) => this._nodeChange("target", e.target.value)}>
              <option value="_blank">_blank</option>
              <option value="_self">_self</option>
              <option value="_parent">_parent</option>
              <option value="_top">_top</option>
            </select>
          </div>
        </div>
        <div className="col-12 col-sm-6">
          <div className="form-group row">
            <label>Source URL</label>
            <input className="form-control" type="text" placeholder="URL" defaultValue={this.state.node.src} onChange={(e) => this._nodeChange("src", e.target.value)}/>
          </div>
        </div>
      </div>
      {(buttons.length ? 
        <div className="row">
          <div className="col-12">
            {buttons.map((btn, index) => (
              <div
                key={index} // eslint-disable-line react/no-array-index-key
                className="rst__toolbarButton"
              >
                {btn}
              </div>
            ))}
          </div>
        </div>
      : null)}
    </div>;

    return (
      <div style={{ height: '100%'}} {...otherProps}>
        {toggleChildrenVisibility &&
          node.children &&
          (node.children.length > 0 || typeof node.children === 'function') && (
            <div>
              <button
                type="button"
                aria-label={node.expanded ? 'Collapse' : 'Expand'}
                className={classnames(
                  node.expanded ? 'rst__collapseButton' : 'rst__expandButton',
                  rowDirectionClass
                )}
                style={buttonStyle}
                onClick={() =>
                  toggleChildrenVisibility({
                    node,
                    path,
                    treeIndex,
                  })
                }
              />

              {node.expanded && !isDragging && (
                <div
                  style={{ width: scaffoldBlockPxWidth }}
                  className={classnames('rst__lineChildren', rowDirectionClass)}
                />
              )}
            </div>
          )}

        <div className={classnames('rst__rowWrapper', rowDirectionClass)} style={{paddingRight:right_padding+'px'}}>
          {/* Set the row preview to be used during drag and drop */}
          {connectDragPreview(
            <div
              className={classnames(
                'rst__row',
                isLandingPadActive && 'rst__rowLandingPad',
                isLandingPadActive && !canDrop && 'rst__rowCancelPad',
                isSearchMatch && 'rst__rowSearchMatch',
                isSearchFocus && 'rst__rowSearchFocus',
                rowDirectionClass,
                className
              )}
              style={{
                opacity: isDraggedDescendant ? 0.5 : 1,
                ...style,
              }}
            >
              {handle}

              <div
                className={classnames(
                  'rst__rowContents',
                  !canDrag && 'rst__rowContentsDragDisabled',
                  rowDirectionClass
                )}
              >
                <div className={classnames('rst__rowLabel', rowDirectionClass)}>
                  <div className='rst__rowTitle'>
                    <label>{this.state.node.title} - <span>Label:</span></label>
                    <input type="text" value={this.state.node.subtitle} onChange={(e) => this._nodeChange("subtitle", e.target.value)}/>
                  </div>
                  <button onClick={() => {Modal.show(options)}}>
                    <i className="icon ion-md-build"></i>
                  </button>
                  <button onClick={() => this._nodeChange("", false)}>
                    <i className="icon ion-md-remove-circle-outline"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

NodeRendererDefault.defaultProps = {
  isSearchMatch: false,
  isSearchFocus: false,
  canDrag: false,
  toggleChildrenVisibility: null,
  buttons: [],
  className: '',
  style: {},
  parentNode: null,
  draggedNode: null,
  canDrop: false,
  title: null,
  subtitle: null,
  rowDirection: 'ltr'
};

NodeRendererDefault.propTypes = {
  node: PropTypes.shape({}).isRequired,
  title: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  path: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  treeIndex: PropTypes.number.isRequired,
  treeId: PropTypes.string.isRequired,
  isSearchMatch: PropTypes.bool,
  isSearchFocus: PropTypes.bool,
  canDrag: PropTypes.bool,
  scaffoldBlockPxWidth: PropTypes.number.isRequired,
  toggleChildrenVisibility: PropTypes.func,
  buttons: PropTypes.arrayOf(PropTypes.node),
  className: PropTypes.string,
  style: PropTypes.shape({}),

  // Drag and drop API functions
  // Drag source
  connectDragPreview: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  parentNode: PropTypes.shape({}), // Needed for dndManager
  isDragging: PropTypes.bool.isRequired,
  didDrop: PropTypes.bool.isRequired,
  draggedNode: PropTypes.shape({}),
  // Drop target
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool,

  // rtl support
  rowDirection: PropTypes.string,
};

export default NodeRendererDefault;