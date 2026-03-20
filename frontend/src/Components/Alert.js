import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { kinds } from 'Helpers/Props';
import styles from './Alert.css';

function Alert(props) {
  const {
    className = styles.alert,
    kind = kinds.INFO,
    children,
    ...otherProps
  } = props;

  return (
    <div
      className={classNames(
        className,
        styles[kind]
      )}
      {...otherProps}
    >
      {children}
    </div>
  );
}

Alert.propTypes = {
  className: PropTypes.string,
  kind: PropTypes.oneOf(kinds.all),
  children: PropTypes.node.isRequired
};

export default Alert;
