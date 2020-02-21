import React from 'react';
import SortableTree from 'react-sortable-tree';
import Loader from './loader';
import Editor from './editor';
import Preview from './preview-handler';
import CustomNode from '../vendors/react-sortable-tree/react-sortable-tree-node';
import store from '../utilities/store';

export default class MenuEditor extends React.Component {

	constructor(props) {
    super(props);

    this.app_state = store.getState();

    this._editorTabs = this._editorTabs.bind(this);
    this._frontendTabs = this._frontendTabs.bind(this);
    this._handleCode = this._handleCode.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._treeChange = this._treeChange.bind(this);
    this._setABIndex = this._setABIndex.bind(this);
		this._removeABData = this._removeABData.bind(this);
		this._copyABData = this._copyABData.bind(this);
    this._update = this._update.bind(this);
    this._handleSave = this._handleSave.bind(this);

    this.state = {
      editorTabs: (this.app_state.global.preview.active ? 1 : 0),
      frontendTabs: 0,
      menu: this.props.menu
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = Object.assign({}, prevState, {
      menu: Object.assign({}, nextProps.menu)
    });
    return temp_state;
  }

  _editorTabs(index) {
		this.setState({editorTabs:index});
  }
  
  _frontendTabs(index) {
		this.setState({frontendTabs:index});
  }
  
  _handleCode(editor, value) {
    let temp_state_obj = {};
    temp_state_obj[editor] = value;

		let frontend = Array.from(this.state.menu.frontend);
    frontend[this.state.menu.frontendIndex] = Object.assign({}, this.state.menu.frontend[this.state.menu.frontendIndex], temp_state_obj);

    let menu = Object.assign({}, this.state.menu, {
      frontend
    });

		this._update(menu);
	}

  _handleChange(type, value) {
    let menu;

    switch (type) {
      case "title":
        let title = value;
        let slug = value.split(" ").join("_").toLowerCase();
        menu = Object.assign({}, this.state.menu,{
          title,
          slug
        });
      break;
      case "classWrapper":
      case "classItem":
      case "classLink":
        let temp = {};
        temp[type] = value;
        menu = Object.assign({}, this.state.menu, temp);
      break;
    }
    
		this._update(menu);
  }
  
  _treeChange(treeData) {
    let menu = Object.assign({}, this.state.menu, {
      treeData
    });

    this._update(menu);
  }

  _setABIndex(frontendIndex) {
		let menu = Object.assign({}, this.state.menu, {
			frontendIndex
    });
    
    this._update(menu);
	}

	_removeABData(index) {
		if (index > 0) {
			let frontendIndex = (this.state.menu.frontendIndex == index ? 0 : this.state.menu.frontendIndex);
			let frontend = Array.from(this.state.menu.frontend);
			frontend.splice(index,1);
			let menu = Object.assign({}, this.state.menu, {
				frontendIndex,
				frontend
      });

      this._update(menu);
		}
	}

	_copyABData(index) {
		let frontend = Array.from(this.state.menu.frontend);
		let new_item = Object.assign({}, frontend[index]);
		frontend.push(new_item);
		let frontendIndex = this.state.menu.frontendIndex + 1;
		let menu = Object.assign({}, this.state.menu, {
			frontendIndex,
			frontend
		});

    this._update(menu);
	}

  _update(menu) {
    if (typeof this.props.onUpdate === 'function') {
      this.props.onUpdate("update", menu);
    }
  }

  _handleSave() {
    // Let parent know to save changes
    if (typeof this.props.handleSave === "function") {
      this.props.handleSave();
    }
  }

  render() {

    let content = <Loader/>;

		if (this.state.menu != null) {

      let defaultProps = Object.assign({}, CustomNode.defaultProps, {
        treedata: this.state.menu.treeData,
        editor: {
          treeChange: this._treeChange
        }
      })
      CustomNode.defaultProps = defaultProps;

      content = <div className="ui-menu-editor">
        <div className="ui-menu-editor__meta">
          <div className="row">
            <div className="col-12 col-sm-6">
              <label>Name</label>
              <input type="text" className="form-control" placeholder="Menu Name" value={this.state.menu.title} onChange={(e) => this._handleChange("title", e.target.value)}/>
            </div>
            <div className="col-12 col-sm-6">
              <label>Wrapper Class</label>
              <input type="text" className="form-control" placeholder="css-class-name" value={this.state.menu.classWrapper} onChange={(e) => this._handleChange("classWrapper", e.target.value)}/>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-sm-6">
              <label>Item Class</label>
              <input type="text" className="form-control" placeholder="css-class-name" value={this.state.menu.classItem} onChange={(e) => this._handleChange("classItem", e.target.value)}/>
            </div>
            <div className="col-12 col-sm-6">
              <label>Link Class</label>
              <input type="text" className="form-control" placeholder="css-class-name" value={this.state.menu.classLink} onChange={(e) => this._handleChange("classLink", e.target.value)}/>
            </div>
          </div>
        </div>
        <div className="ui-menu-editor__tabs">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button className={"nav-link" + (this.state.editorTabs == 0 ? " active" : "")} onClick={() => this._editorTabs(0)}>Structure</button>
            </li>
            <li className="nav-item">
              <button className={"nav-link" + (this.state.editorTabs == 1 ? " active" : "")} onClick={() => this._editorTabs(1)}>Front-End</button>
            </li>
          </ul>
        </div>
        <div className="ui-menu-editor__tab-content">
          <div className={"ui-menu-editor__tab-content__item" + (this.state.editorTabs == 0 ? " ui-menu-editor__tab-content__item--active" : "")}>
            <div className="ui-menu-editor__tree">
              {(this.state.menu.treeData.length == 0 ?
                <p className="text-center"><small>Please add a menu item.</small></p>
              : 
                <SortableTree
                  treeData={this.state.menu.treeData}
                  rowHeight={50}
                  nodeContentRenderer={CustomNode}
                  onChange={this._treeChange}
                />
              )}
            </div>
          </div>
          <div className={"ui-menu-editor__tab-content__item" + (this.state.editorTabs == 1 ? " ui-menu-editor__tab-content__item--active" : "")}>
            <div className="ui-menu-editor__editors">
              {/* AB Testing */}
              <div className="ui-ab-test-menu">
                <label className="ui-ab-test-menu__title">A/B Testing</label>
                <ul className="nav nav-tabs">
                  {this.state.menu.frontend.map((data,i) => {
                    return <li key={i} className="nav-item">
                      <div className={"ui-ab-test-menu__label" + (i == this.state.menu.frontendIndex ? " ui-ab-test-menu__label--active" : "")}>
                        <button onClick={() => this._setABIndex(i)}>{(i == 0 ? "Original" : "v"+(i+1))}</button>
                        {(i != 0 ? <button onClick={() => this._removeABData(i)}><i className="icon ion-md-trash"></i></button> : null)}
                        <button onClick={() => this._copyABData(i)}><i className="icon ion-md-copy"></i></button>
                      </div>
                    </li>
                  })}
                </ul>
              </div>
              {/* Editors */}
              <div className="ui-frontend-editor ui-frontend-editor--ab-testing">
                <ul className="nav nav-tabs">
                  <li className="nav-item">
                    <button className={"nav-link" + (this.state.frontendTabs == 0 ? " active" : "")} onClick={() => this._frontendTabs(0)}>SCSS</button>
                  </li>
                  <li className="nav-item">
                    <button className={"nav-link" + (this.state.frontendTabs == 1 ? " active" : "")} onClick={() => this._frontendTabs(1)}>JS</button>
                  </li>
                  <li className="nav-item ui-frontend-editor__preview-button">
                    <Preview/>
                  </li>
                  <li className="nav-item ui-frontend-editor__preview-button">
                    <button className="btn ui-btn" onClick={() => this._handleSave()}>Save</button>
                  </li>
                </ul>
                <div className="ui-frontend-editor__tabs">
                  {/* Tab Two */}
                  <div className={"ui-frontend-editor__tab" + (this.state.frontendTabs == 0 ? " ui-frontend-editor__tab--active" : "")}>
                    <div className="row">
                      <div className="col-12 ui-frontend-editor__editor">
                        <Editor id="ComponentCSSEditor" mode="scss" width="100%" height="160px" code={this.state.menu.frontend[this.state.menu.frontendIndex].css} component={{fields:[]}} componentSlug={""} onChange={(code) => this._handleCode('css', code)} shortMenu={true}/>
                      </div>
                    </div>
                  </div>
                  {/* Tab Three */}
                  <div className={"ui-frontend-editor__tab" + (this.state.frontendTabs == 1 ? " ui-frontend-editor__tab--active" : "")}>
                    <div className="row">
                      <div className="col-12 ui-frontend-editor__editor">
                        <Editor id="ComponentJSEditor" mode="javascript" width="100%" height="160px" code={this.state.menu.frontend[this.state.menu.frontendIndex].js} component={{fields:[]}} componentSlug={""} onChange={(code) => this._handleCode('js', code)} shortMenu={true}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>;
    }

    return content;
  }
}