import PropTypes from 'prop-types';
import React, { Component } from 'react';

const isWindowDefined = () => typeof window !== 'undefined';
const getWindow = () => (isWindowDefined() ? window : null);

class WindowScrollerShim extends Component {

  static defaultProps = {
    scrollElement: getWindow(),
    onScroll: () => {},
    onResize: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      height: 0,
      width: 0,
      scrollTop: 0,
      scrollLeft: 0,
      isScrolling: false
    };

    this._child = null;
    this._scrollElement = props.scrollElement || getWindow();
    this._resizeObserver = null;
  }

  componentDidMount() {
    this.updateDimensions();
    this.attachScrollListener();
    this.attachResizeObserver();
  }

  componentWillUnmount() {
    this.detachScrollListener();
    this.detachResizeObserver();
  }

  attachScrollListener() {
    if (!this._scrollElement) {
      return;
    }

    this._scrollElement.addEventListener('scroll', this.handleScroll, {
      passive: true
    });
  }

  detachScrollListener() {
    if (!this._scrollElement) {
      return;
    }

    this._scrollElement.removeEventListener('scroll', this.handleScroll);
  }

  attachResizeObserver() {
    const scrollElement = this._scrollElement || getWindow();

    if (typeof ResizeObserver !== 'undefined' && scrollElement instanceof Element) {
      this._resizeObserver = new ResizeObserver(() => {
        this.updateDimensions();
      });
      this._resizeObserver.observe(scrollElement);
    } else if (isWindowDefined()) {
      window.addEventListener('resize', this.updateDimensions, { passive: true });
    }
  }

  detachResizeObserver() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    } else if (isWindowDefined()) {
      window.removeEventListener('resize', this.updateDimensions);
    }
  }

  updateDimensions = () => {
    const scrollElement = this._scrollElement || getWindow();

    if (!scrollElement) {
      return;
    }

    const height = scrollElement instanceof Element
      ? scrollElement.clientHeight
      : window.innerHeight;
    const width = scrollElement instanceof Element
      ? scrollElement.clientWidth
      : window.innerWidth;

    this.setState({
      height,
      width
    });

    this.props.onResize({ height, width });
  };

  handleScroll = () => {
    const scrollElement = this._scrollElement || getWindow();

    if (!scrollElement) {
      return;
    }

    const scrollTop = scrollElement instanceof Element
      ? scrollElement.scrollTop
      : window.scrollY;
    const scrollLeft = scrollElement instanceof Element
      ? scrollElement.scrollLeft
      : window.scrollX;

    this.setState({
      scrollTop,
      scrollLeft,
      isScrolling: true
    });

    this.props.onScroll({
      scrollTop,
      scrollLeft
    });

    clearTimeout(this._scrollTimeout);
    this._scrollTimeout = setTimeout(() => {
      this.setState({ isScrolling: false });
    }, 150);
  };

  registerChild = (element) => {
    this._child = element;
  };

  onChildScroll = ({ scrollTop }) => {
    const scrollElement = this._scrollElement || getWindow();

    if (!scrollElement) {
      return;
    }

    if (scrollElement instanceof Element) {
      scrollElement.scrollTop = scrollTop;
    } else {
      window.scrollTo(0, scrollTop);
    }
  };

  render() {
    const { children } = this.props;
    const { height, scrollTop, scrollLeft, isScrolling } = this.state;

    return children({
      height,
      registerChild: this.registerChild,
      onChildScroll: this.onChildScroll,
      scrollTop,
      scrollLeft,
      isScrolling
    });
  }
}

WindowScrollerShim.propTypes = {
  scrollElement: PropTypes.oneOfType([
    PropTypes.instanceOf(Element),
    PropTypes.object
  ]),
  onScroll: PropTypes.func,
  onResize: PropTypes.func,
  children: PropTypes.func.isRequired
};

export default WindowScrollerShim;
