import React from 'react';

export default class SizeSelector extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ui_size: (this.props.currentSize==undefined?"col-lg-12":this.props.currentSize),
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let temp_state = prevState;
    temp_state.ui_size = (nextProps.currentSize==undefined?"col-lg-12":nextProps.currentSize);
    return temp_state;
  }
  
  onSelect(ui_size) {
    this.setState({
      ui_size,
    });

    if (typeof this.props.onSelect === "function") {
      this.props.onSelect('size', ui_size);
    }
  }

  render() {
    let text;
    let className;

    switch (this.state.ui_size) {
      case 'col-lg-3':
        text = "1/4";
        className = "quarter";
      break;
      case 'col-lg-6':
        text = "1/2";
        className = (this.props.halfsOnly ? "quarter" : "half");
      break;
      case 'col-lg-9':
        text = "3/4";
        className = "three-fourth";
      break;
      case 'col-lg-12':
        text = "100%";
        className = "full";
      break;
    }

    let selections = <div className="ui-size-selector__buttons">
      <button onClick={() => this.onSelect("col-lg-3")}>25%</button>
      <button onClick={() => this.onSelect("col-lg-6")}>50%</button>
      <button onClick={() => this.onSelect("col-lg-9")}>75%</button>
      <button onClick={() => this.onSelect("col-lg-12")}>100%</button>
      <div className="ui-size-selector__text">{text}</div>
    </div>

    if (this.props.halfsOnly) {
      selections = <div className="ui-size-selector__buttons">
        <button onClick={() => this.onSelect("col-lg-6")}>50%</button>
        <button onClick={() => this.onSelect("col-lg-12")}>100%</button>
        <div className="ui-size-selector__text">{text}</div>
      </div>
    }
    
    return (
      <div className={"ui-size-selector "+className}>
        <div className="ui-size-selector__name">Field Size:</div>
        {selections}
      </div>
    )
  }
}

