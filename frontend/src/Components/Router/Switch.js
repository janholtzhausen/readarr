import PropTypes from 'prop-types';
import React from 'react';
import { Routes as RouterRoutes } from 'react-router-dom';

function Switch({ children }) {
  return <RouterRoutes>{children}</RouterRoutes>;
}

Switch.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Switch;
