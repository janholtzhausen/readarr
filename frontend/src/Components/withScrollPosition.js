import PropTypes from 'prop-types';
import React from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import scrollPositions from 'Store/scrollPositions';

function withScrollPosition(WrappedComponent, scrollPositionKey) {
  function ScrollPosition(props) {
    const location = useLocation();
    const action = useNavigationType();

    const scrollTop = action === 'POP' || (location.state && location.state.restoreScrollPosition) ?
      scrollPositions[scrollPositionKey] :
      0;

    return (
      <WrappedComponent
        {...props}
        scrollTop={scrollTop}
      />
    );
  }

  return ScrollPosition;
}

export default withScrollPosition;
