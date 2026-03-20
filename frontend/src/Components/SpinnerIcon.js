import PropTypes from 'prop-types';
import React from 'react';
import { icons } from 'Helpers/Props';
import Icon from './Icon';

function SpinnerIcon({
  name,
  spinningName = icons.SPINNER,
  isSpinning,
  ...otherProps
}) {
  return (
    <Icon
      name={isSpinning ? (spinningName || name) : name}
      isSpinning={isSpinning}
      {...otherProps}
    />
  );
}

SpinnerIcon.propTypes = {
  name: PropTypes.object.isRequired,
  spinningName: PropTypes.object,
  isSpinning: PropTypes.bool.isRequired
};

export default SpinnerIcon;
