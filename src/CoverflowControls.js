/**
 * React Coverflow
 *
 * Author: andyyou
 */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import styles from './stylesheets/coverflow';
import Coverflow from './Coverflow';

@Radium
class CoverflowControls extends Component {
  /**
   * Life cycle events
   */
  constructor(props) {
    super(props);

    this.state = {
      current: this._center()
    };
  }

  updateCurrentSelection(newCurrent) {
    this.setState({ current:newCurrent });

    if (this.props.onPictureChange) {
      this.props.onPictureChange(newCurrent);
    }
  }

  render() {
    return (
      <div style={{ position:'relative' }}>
        <Coverflow {...this.props.coverflowOptions} current={this.state.current}>
          { this.props.children }
        </Coverflow>

        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={ this._handlePrevFigure.bind(this) }>Previous</button>
          <button type="button" className={styles.button} onClick={ this._handleNextFigure.bind(this) }>Next</button>
        </div>
      </div>
    );
  }

  /**
   * Private methods
   */
  _center() {
    let length = React.Children.count(this.props.children);
    return Math.floor(length / 2);
  }

  _handlePrevFigure() {
    let current = this.state.current;
    if (current - 1 >= 0) {
      this.updateCurrentSelection(current - 1);
    }
  }

  _handleNextFigure() {
    let current = this.state.current;
    if (current + 1 < this.props.children.length) {
      this.updateCurrentSelection(current + 1);
    }
  }
};

CoverflowControls.displayName = 'CoverflowControls';

export default CoverflowControls;
