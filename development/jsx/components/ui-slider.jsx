import React from 'react';

export default class UISlider extends React.PureComponent {

  constructor(props) {
    super(props);

    this._handleToggle = this._handleToggle.bind(this);

    this.state = {
      label: this.props.label,
      toggle: this.props.value
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.label = nextProps.label
    temp_state.toggle = nextProps.value
    return temp_state;
  }

  _handleToggle(event) {
    const target = event.target;

    if (typeof this.props.onChange === "function") {
      this.props.onChange(target.checked);
    }
  }

  render() {
    let unique_epoch_id = "slider_" + this.state.label.replace(" ", "_") + "_" + (new Date().valueOf());

    return (
      <label className="ui-input-wrapper" htmlFor={unique_epoch_id}>
        <label className="ui-switch ui-input">
          <input id={unique_epoch_id} type="checkbox" className="ui-switch__input" checked={!!this.state.toggle} onChange={this._handleToggle}/>
          <span className="ui-switch__slider ui-switch__slider--round"></span>
        </label>
        <span>{this.state.label}</span>
      </label>
    )
  }
}

