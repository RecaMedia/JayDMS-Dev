import React from 'react';
import GeneralFunctions from '../utilities/general-functions';
import history from '../utilities/history';

export default class Component extends React.Component {

  constructor(props) {
    super(props);
    
    this._handleRemove = this._handleRemove.bind(this);

		this.state = {
      component: this.props.component,
      index: this.props.index
		}
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.component = nextProps.component;
    temp_state.index = nextProps.index;
    return temp_state;
  }
  
  _handleRemove() {
    // Let parent know to remove FieldType
    if (typeof this.props.onRemove === "function") {
      this.props.onRemove(this.state.index);
    }
  }

  render() {
    return (
      <div className={"ui-fieldtype-wrapper"}>
        <div className="row ui-component">
          <div className="ui-component__content">
            <div className="row">
              <div className="col-6">
                <button className="ui-component__title" onClick={() => {
                  history.push('/cp/developer/components/edit/'+this.state.component.slug);
                }}>{GeneralFunctions.underscoresToSpacesAndCaps(this.state.component.slug)}</button>
              </div>
              <div className="col-6 text-right">
                <button className="btn ui-btn ui-btn-text" onClick={() => this._handleRemove()}><i className="icon ion-md-remove-circle-outline"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}