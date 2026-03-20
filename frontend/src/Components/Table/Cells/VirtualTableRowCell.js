import PropTypes from 'prop-types';
import React from 'react';
import styles from './VirtualTableRowCell.css';

function VirtualTableRowCell(props) {
  const {
    className = styles.cell,
    children
  } = props;

  return (
    <div
      className={className}
    >
      {children}
    </div>
  );
}

VirtualTableRowCell.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};

export default VirtualTableRowCell;
