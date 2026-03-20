import PropTypes from 'prop-types';
import React from 'react';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import { kinds } from 'Helpers/Props';

function OAuthInput({
  label = 'Start OAuth',
  authorizing,
  error,
  onPress
}) {
  return (
    <div>
      <SpinnerErrorButton
        kind={kinds.PRIMARY}
        isSpinning={authorizing}
        error={error}
        onPress={onPress}
      >
        {label}
      </SpinnerErrorButton>
    </div>
  );
}

OAuthInput.propTypes = {
  label: PropTypes.string,
  authorizing: PropTypes.bool.isRequired,
  error: PropTypes.object,
  onPress: PropTypes.func.isRequired
};

export default OAuthInput;
