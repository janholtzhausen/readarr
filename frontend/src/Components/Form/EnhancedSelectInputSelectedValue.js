import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './EnhancedSelectInputSelectedValue.css';

function EnhancedSelectInputSelectedValue({
  className = styles.selectedValue,
  children,
  isDisabled = false
}) {
  return (
    <div className={classNames(
      className,
      isDisabled && styles.isDisabled
    )}
    >
      {children}
    </div>
  );
}

EnhancedSelectInputSelectedValue.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  isDisabled: PropTypes.bool
};

export default EnhancedSelectInputSelectedValue;
