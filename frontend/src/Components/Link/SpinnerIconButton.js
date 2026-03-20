import PropTypes from 'prop-types';
import React from 'react';
import { icons } from 'Helpers/Props';
import IconButton from './IconButton';

function SpinnerIconButton(props) {
  const {
    name,
    spinningName = icons.SPINNER,
    isDisabled = false,
    isSpinning = false,
    ...otherProps
  } = props;

  return (
    <IconButton
      name={isSpinning ? (spinningName || name) : name}
      isDisabled={isDisabled || isSpinning}
      isSpinning={isSpinning}
      {...otherProps}
    />
  );
}

SpinnerIconButton.propTypes = {
  name: PropTypes.object.isRequired,
  spinningName: PropTypes.object,
  isDisabled: PropTypes.bool,
  isSpinning: PropTypes.bool
};

export default SpinnerIconButton;
