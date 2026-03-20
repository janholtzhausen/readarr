import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import Button from './Button';
import styles from './SpinnerButton.css';

function SpinnerButton(props) {
  const {
    className = styles.button,
    isSpinning,
    isDisabled,
    spinnerIcon = icons.SPINNER,
    children,
    ...otherProps
  } = props;

  return (
    <Button
      className={classNames(
        className,
        styles.button,
        isSpinning && styles.isSpinning
      )}
      isDisabled={isDisabled || isSpinning}
      {...otherProps}
    >
      <span className={styles.spinnerContainer}>
        <Icon
          className={styles.spinner}
          name={spinnerIcon}
          isSpinning={true}
        />
      </span>

      <span className={styles.label}>
        {children}
      </span>
    </Button>
  );
}

SpinnerButton.propTypes = {
  ...Button.Props,
  className: PropTypes.string,
  isSpinning: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool,
  spinnerIcon: PropTypes.object,
  children: PropTypes.node
};

export default SpinnerButton;
