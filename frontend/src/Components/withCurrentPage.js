import PropTypes from 'prop-types';
import React from 'react';
import { useNavigationType } from 'react-router-dom';

function withCurrentPage(WrappedComponent) {
  function CurrentPage(props) {
    const action = useNavigationType();

    return (
      <WrappedComponent
        {...props}
        useCurrentPage={action === 'POP'}
      />
    );
  }

  return CurrentPage;
}

export default withCurrentPage;
