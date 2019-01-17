
import React from 'react';
import styles from 'Tooltip.css'

type Props = {
  diverse: "ert"
}

type State = {
  hovered: boolean
};

export default class Tooltip extends Component<Props, State> {
  state = {
    hovered: false
  }
  onMouseEnter = () => {
    this.setState({
      hovered: true
    });
  };

  onMouseLeave = () => {
    this.setState({
      hovered: false
    });
  };
  render() {
    const tooltipClass = this.state.hovered
      ? styles.baseTooltipHover
      : styles.tooltip;
    const tooltip = list ? styles.listTooltip : styles.showTooltip;
    return (
      <div className={className} style={style} onClick={onClick}>
        <div className={cx(tooltipClass, tooltip)}>{content}</div>
        <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
          {children}
        </div>
      </div>
    );
  }
}
