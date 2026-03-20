import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import Link from './Link';
import styles from './IconButton.css';

function IconButton(props) {
  const {
    className = styles.button,
    iconClassName,
    name,
    kind,
    size = 12,
    isSpinning,
    isDisabled,
    ...otherProps
  } = props;

  return (
    <Link
      className={classNames(
        className,
        isDisabled && styles.isDisabled
      )}
      aria-label="Table Options Button"
      isDisabled={isDisabled}
      {...otherProps}
    >
      <Icon
        className={iconClassName}
        name={name}
        kind={kind}
        size={size}
        isSpinning={isSpinning}
      />
    </Link>
  );
}

IconButton.propTypes = {
  ...Link.propTypes,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  kind: PropTypes.string,
  name: PropTypes.object.isRequired,
  size: PropTypes.number,
  title: PropTypes.string,
  isSpinning: PropTypes.bool,
  isDisabled: PropTypes.bool
};

export default IconButton;
