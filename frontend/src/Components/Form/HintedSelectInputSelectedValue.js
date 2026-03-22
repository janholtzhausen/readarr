import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import Label from 'Components/Label';
import EnhancedSelectInputSelectedValue from './EnhancedSelectInputSelectedValue';
import styles from './HintedSelectInputSelectedValue.css';

function HintedSelectInputSelectedValue({
  value,
  values,
  hint,
  isMultiSelect = false,
  includeHint = true,
  ...otherProps
}) {
  const selectValues = values ?? [];
  const selectedValues = isMultiSelect ? (Array.isArray(value) ? value : []) : value;
  const valuesMap = isMultiSelect ? _.keyBy(selectValues, 'key') : null;

  return (
    <EnhancedSelectInputSelectedValue
      className={styles.selectedValue}
      {...otherProps}
    >
      <div className={styles.valueText}>
        {
          isMultiSelect ?
            selectedValues.map((key) => {
              const v = valuesMap[key];
              return (
                <Label key={key}>
                  {v ? v.value : key}
                </Label>
              );
            }) :
            null
        }

        {
          isMultiSelect ? null : selectedValues
        }
      </div>

      {
        hint != null && includeHint ?
          <div className={styles.hintText}>
            {hint}
          </div> :
          null
      }
    </EnhancedSelectInputSelectedValue>
  );
}

HintedSelectInputSelectedValue.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))]),
  values: PropTypes.arrayOf(PropTypes.object),
  hint: PropTypes.string,
  isMultiSelect: PropTypes.bool,
  includeHint: PropTypes.bool
};

export default HintedSelectInputSelectedValue;
