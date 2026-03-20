import PropTypes from 'prop-types';
import React from 'react';
import styles from './VirtualTableRow.css';

function VirtualTableRow(props) {
  const {
    className = styles.row,
    children,
    style,
    ...otherProps
  } = props;

  return (
    <div
      className={className}
      style={style}
      {...otherProps}
    >
      {children}
    </div>
  );
}

VirtualTableRow.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object.isRequired,
  children: PropTypes.node
};

export default VirtualTableRow;
