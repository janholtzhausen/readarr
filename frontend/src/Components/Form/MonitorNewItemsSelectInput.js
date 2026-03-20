import PropTypes from 'prop-types';
import React from 'react';
import monitorNewItemsOptions from 'Utilities/Author/monitorNewItemsOptions';
import translate from 'Utilities/String/translate';
import SelectInput from './SelectInput';

function MonitorNewItemsSelectInput({
  includeNoChange = false,
  includeMixed = false,
  ...otherProps
}) {
  const values = [...monitorNewItemsOptions];

  if (includeNoChange) {
    values.unshift({
      key: 'noChange',
      value: translate('NoChange'),
      isDisabled: true
    });
  }

  if (includeMixed) {
    values.unshift({
      key: 'mixed',
      value: '(Mixed)',
      isDisabled: true
    });
  }

  return (
    <SelectInput
      values={values}
      {...otherProps}
    />
  );
}

MonitorNewItemsSelectInput.propTypes = {
  includeNoChange: PropTypes.bool,
  includeMixed: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};

export default MonitorNewItemsSelectInput;
