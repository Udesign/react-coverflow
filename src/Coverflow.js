/**
 * React Coverflow
 *
 * Author: andyyou
 */
import React from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import styles from './stylesheets/coverflow.scss';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

var TOUCH = {move: false,
  lastX: 0,
  sign: 0,
  lastMove: 0
};
var TRANSITIONS = [
  'transitionend',
  'oTransitionEnd',
  'otransitionend',
  'MSTransitionEnd',
  'webkitTransitionEnd'
];
var HandleAnimationState = function() {
  this._removePointerEvents();
};

@Radium
class Coverflow extends React.Component {
  /**
   * Life cycle events
   */
  constructor(props) {
    super(props);

    this.state = {
      move: 0,
    };
  }

  componentDidMount() {
    let length = React.Children.count(this.props.children);

    TRANSITIONS.forEach(event => {
      for (let i = 0; i < length; i++) {
        var figureID = `figure_${i}`;
        this.refs[figureID].addEventListener(event, HandleAnimationState.bind(this));
      }
    });
  }

  componentWillUnmount() {
    let length = React.Children.count(this.props.children);

    TRANSITIONS.forEach(event => {
      for (let i = 0; i < length; i++) {
        var figureID = `figure_${i}`;
        this.refs[figureID].removeEventListener(event, HandleAnimationState.bind(this));
      }
    });
  }

  render() {
    const {enableScroll} = this.props;
    const {width, height} = this.props;
    return (
      <div className={styles.container}
           style={[{width: `${width}px`, height: `${height}px`}, this.props.media]}
           onWheel={enableScroll ? this._handleWheel.bind(this) : null}
           onTouchStart={this._handleTouchStart.bind(this)}
           onTouchMove={this._handleTouchMove.bind(this)}
           >
        <div className={styles.coverflow}>
          <div className={styles.preloader}></div>
          <div className={styles.stage} ref="stage">
              {this._renderFigureNodes()}
          </div>
        </div>
      </div>
    );
  }

  _center() {
    let length = React.Children.count(this.props.children);
    return Math.floor(length / 2);
  }

  _handleFigureStyle(index, current) {
    const {displayQuantityOfSide} = this.props;
    const {width} = this.props;
    const style = {};

    const center = this._center();
    const baseWidth = width / (displayQuantityOfSide * 2 + 1);
    const distance = center - current;
    const move = distance * baseWidth;

    const length = React.Children.count(this.props.children);
    const offset = length % 2 === 0 ? -width/10 : 0;

    // Handle opacity
    const depth = displayQuantityOfSide - Math.abs(current - index);
    let opacity = depth === 1 ? 0.95 : 0.5;
    opacity = depth === 2 ? 0.92 : opacity;
    opacity = depth === 3 ? 0.9 : opacity;
    opacity = current === index ? 1 : opacity;

    // Handle translateX
    if (index === current) {
      style['width'] = `${baseWidth}px`;
      style['transform'] = `translateX(${move + offset}px) scale(1.2)`;
      style['zIndex'] = `${10 - depth}`;
      style['opacity'] = opacity;
    } else if (index < current) {
      // Left side
      style['width'] = `${baseWidth}px`;
      style['transform'] = `translateX(${move + offset}px) rotateY(40deg)`;
      style['zIndex'] = `${10 - depth}`;
      style['opacity'] = opacity;
    } else if (index > current) {
      // Right side
      style['width'] = `${baseWidth}px`;
      style['transform'] = ` translateX(${move + offset}px) rotateY(-40deg)`;
      style['zIndex'] = `${10 - depth}`;
      style['opacity'] = opacity;
    }
    return style;
  }

  _handleFigureClick(index, e) {
    e.preventDefault();
    // this.refs.stage.style['pointerEvents'] = 'none';

    this.props.onPictureChange(index);
  }

  _renderFigureNodes() {
    const {enableHeading} = this.props;

    let figureNodes = React.Children.map(this.props.children, (child, index) => {
      let figureElement = React.cloneElement(child, {className: styles.cover});
      let style = this._handleFigureStyle(index, this.props.current);
      return (
        <figure className={styles.figure}
          key={index}
          style={style}
          onClick={ this._handleFigureClick.bind(this, index) }
          ref={`figure_${index}`}
          >
          {figureElement}
          {
            enableHeading &&
            <div className={styles.text}>{figureElement.props.alt}</div>
          }
        </figure>
      );
    });
    return figureNodes;
  }

  _handleWheel(e) {
    e.preventDefault();

    let delta = e.deltaY * (-120);
    let count = Math.ceil(Math.abs(delta) / 120);

    if (count > 0) {
      const sign = Math.abs(delta) / delta;
      let func = null;

      if (sign > 0) {
        func = this._handlePrevFigure.bind(this);
      } else if (sign < 0) {
        func = this._handleNextFigure.bind(this);
      }

      if (typeof func === 'function') {
        for (let i = 0; i < count; i++) func();
      }
    }
  }

  _handleTouchStart(e) {
    TOUCH.lastX = e.nativeEvent.touches[0].clientX;
    TOUCH.lastMove = this.state.move;
  }

  _handleTouchMove(e) {
    e.preventDefault();
    const {displayQuantityOfSide} = this.props;
    const {width} = this.props;

    let clientX = e.nativeEvent.touches[0].clientX;
    let lastX = TOUCH.lastX;
    let baseWidth = width / (displayQuantityOfSide * 2 + 1);
    let move = clientX - lastX;
    let totalMove = TOUCH.lastMove - move;
    let sign = Math.abs(move) / move;

    if (Math.abs(totalMove) >= baseWidth) {
      let func = null;
      if (sign > 0) {
        func = this._handlePrevFigure.bind(this);
      } else if (sign < 0) {
        func = this._handleNextFigure.bind(this);
      }
      if (typeof func === 'function') {
        func();
      }
    }
  }

  _removePointerEvents() {
    // this.refs.stage.style['pointerEvents'] = 'auto';
  }
};

Coverflow.propTypes = {
  displayQuantityOfSide: React.PropTypes.number.isRequired,
  navigation: React.PropTypes.bool,
  enableHeading: React.PropTypes.bool,
  enableScroll: React.PropTypes.bool
};

Coverflow.defaultProps = {
  navigation: false,
  enableHeading: true,
  enableScroll: true
};

Coverflow.displayName = 'Coverflow';

export default Coverflow;
