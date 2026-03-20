import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import styles from './PageToolbarButton.css';

function PageToolbarButton(props) {
  const {
    className = '',
    label,
    iconName,
    spinningName = icons.SPINNER,
    isDisabled = false,
    isSpinning = false,
    ...otherProps
  } = props;

  return (
    <Link
      className={classNames(
        className,
        styles.toolbarButton,
        isDisabled && styles.isDisabled
      )}
      isDisabled={isDisabled || isSpinning}
      {...otherProps}
    >
      <Icon
        name={isSpinning ? (spinningName || iconName) : iconName}
        isSpinning={isSpinning}
        size={21}
      />

      <div className={styles.labelContainer}>
        <div className={styles.label}>
          {label}
        </div>
      </div>
    </Link>
  );
}

PageToolbarButton.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  iconName: PropTypes.object.isRequired,
  spinningName: PropTypes.object,
  isSpinning: PropTypes.bool,
  isDisabled: PropTypes.bool
};

export default PageToolbarButton;
