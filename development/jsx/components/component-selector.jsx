import React from 'react';
import MakeCall from '../utilities/make-call';
import GeneralFunctions from '../utilities/general-functions';

export default class ComponentSelector extends React.Component {

	constructor(props) {
		super(props);
    
    this._toggle = this._toggle.bind(this);
    this._handlePress = this._handlePress.bind(this);

		this.state = {
      toggle: false,
			components: []
		}
	}
	
	componentDidMount() {
		if (this.state.components.length == 0) {
			MakeCall.api("components/list/").then((response) => {
				if (response.success) {
					let components = GeneralFunctions.objectInArraySort(response.list);
					this.setState({
						components
					})
				}
			});
		}
  }
  
  _toggle() {
    let toggle = (this.state.toggle?false:true);
    this.setState({toggle});
  }

  _handlePress(content) {
    if (typeof this.props.onSelect === "function") {
      delete content.data;
      this.props.onSelect(content);
    }
  }

  render() {
    return (
      <div className={"btn ui-btn ui-selector"+(this.state.toggle?" open":"")}>
        <div className="ui-selector__items">
          <button className="btn ui-btn ui-btn-white ui-selector__close-btn" onClick={() => this._toggle()}><i className="icon ion-md-close"></i></button>
          {
            this.state.components.map((component, i) => {
              return <button key={i} className="btn ui-btn ui-btn-white" onClick={() => this._handlePress(component)}>{GeneralFunctions.underscoresToSpacesAndCaps(component.slug)}</button>
            })
          }
        </div>
        <button className="btn ui-btn ui-selector__btn" onClick={() => this._toggle()}><i className="icon ion-md-add"></i> Add Component</button>
      </div>
    )
	}
}