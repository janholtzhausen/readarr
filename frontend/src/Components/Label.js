import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { kinds, sizes } from 'Helpers/Props';
import styles from './Label.css';

function Label(props) {
  const {
    className = styles.label,
    kind = kinds.DEFAULT,
    size = sizes.SMALL,
    outline = false,
    children,
    ...otherProps
  } = props;

  return (
    <span
      className={classNames(
        className,
        styles[kind],
        styles[size],
        outline && styles.outline
      )}
      {...otherProps}
    >
      {children}
    </span>
  );
}

Label.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  kind: PropTypes.oneOf(kinds.all),
  size: PropTypes.oneOf(sizes.all),
  outline: PropTypes.bool,
  children: PropTypes.node.isRequired
};

export default Label;
