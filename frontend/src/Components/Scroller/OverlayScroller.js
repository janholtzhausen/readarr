import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { scrollDirections } from 'Helpers/Props';
import styles from './OverlayScroller.css';

class OverlayScroller extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._scroller = null;
    this._isScrolling = false;
  }

  componentDidMount() {
    const { scrollTop } = this.props;

    if (scrollTop != null && this._scroller) {
      this._scroller.scrollTop = scrollTop;
    }
  }

  componentDidUpdate(prevProps) {
    const { scrollTop } = this.props;

    if (
      !this._isScrolling &&
      scrollTop != null &&
      scrollTop !== prevProps.scrollTop &&
      this._scroller
    ) {
      this._scroller.scrollTop = scrollTop;
    }
  }

  //
  // Control

  _setScrollRef = (ref) => {
    this._scroller = ref;

    if (ref) {
      this.props.registerScroller(ref);
    }
  };

  //
  // Listeners

  onScroll = (event) => {
    const { scrollTop, scrollLeft } = event.currentTarget;
    const { onScroll } = this.props;

    this._isScrolling = true;

    if (onScroll) {
      onScroll({ scrollTop, scrollLeft });
    }
  };

  onWheel = () => {
    this._isScrolling = true;
  };

  onMouseUp = () => {
    this._isScrolling = false;
  };

  //
  // Render

  render() {
    const {
      className,
      scrollDirection,
      autoScroll,
      children,
      scrollTop,
      onScroll,
      registerScroller,
      trackClassName,
      autoHide,
      ...otherProps
    } = this.props;

    return (
      <div
        ref={this._setScrollRef}
        className={classNames(
          className,
          styles.scroller,
          styles[scrollDirection],
          autoScroll && styles.autoScroll
        )}
        onMouseUp={this.onMouseUp}
        onScroll={this.onScroll}
        onWheel={this.onWheel}
        tabIndex={-1}
        {...otherProps}
      >
        {children}
      </div>
    );
  }
}

OverlayScroller.propTypes = {
  className: PropTypes.string,
  trackClassName: PropTypes.string,
  scrollTop: PropTypes.number,
  scrollDirection: PropTypes.oneOf([scrollDirections.NONE, scrollDirections.HORIZONTAL, scrollDirections.VERTICAL, scrollDirections.BOTH]).isRequired,
  autoHide: PropTypes.bool.isRequired,
  autoScroll: PropTypes.bool.isRequired,
  children: PropTypes.node,
  onScroll: PropTypes.func,
  registerScroller: PropTypes.func
};

OverlayScroller.defaultProps = {
  className: styles.scroller,
  trackClassName: styles.thumb,
  scrollDirection: scrollDirections.VERTICAL,
  autoHide: false,
  autoScroll: true,
  registerScroller: () => { /* no-op */ }
};

export default OverlayScroller;
