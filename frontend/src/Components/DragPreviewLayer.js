import PropTypes from 'prop-types';
import React from 'react';
import styles from './DragPreviewLayer.css';

function DragPreviewLayer({ children, className = styles.dragLayer, ...otherProps }) {
  return (
    <div className={className} {...otherProps}>
      {children}
    </div>
  );
}

DragPreviewLayer.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

export default DragPreviewLayer;
