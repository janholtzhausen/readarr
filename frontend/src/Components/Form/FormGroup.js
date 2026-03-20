import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { map } from 'Helpers/elementChildren';
import { sizes } from 'Helpers/Props';
import styles from './FormGroup.css';

function FormGroup({
  className = styles.group,
  children,
  size = sizes.SMALL,
  advancedSettings = false,
  isAdvanced = false,
  ...otherProps
}) {
  if (!advancedSettings && isAdvanced) {
    return null;
  }

  const childProps = isAdvanced ? { isAdvanced } : {};

  return (
    <div
      className={classNames(
        className,
        styles[size]
      )}
      {...otherProps}
    >
      {
        map(children, (child) => {
          return React.cloneElement(child, childProps);
        })
      }
    </div>
  );
}

FormGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(sizes.all),
  advancedSettings: PropTypes.bool,
  isAdvanced: PropTypes.bool
};

export default FormGroup;
