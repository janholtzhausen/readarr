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
  const valuesMap = isMultiSelect && _.keyBy(values, 'key');

  return (
    <EnhancedSelectInputSelectedValue
      className={styles.selectedValue}
      {...otherProps}
    >
      <div className={styles.valueText}>
        {
          isMultiSelect ?
            value.map((key, index) => {
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
          isMultiSelect ? null : value
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
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))]).isRequired,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  hint: PropTypes.string,
  isMultiSelect: PropTypes.bool,
  includeHint: PropTypes.bool
};

export default HintedSelectInputSelectedValue;
