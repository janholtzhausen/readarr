import PropTypes from 'prop-types';
import React from 'react';
import SpinnerIcon from 'Components/SpinnerIcon';
import { icons } from 'Helpers/Props';
import styles from './BookEditorFooterLabel.css';

function BookEditorFooterLabel({
  className = styles.label,
  label,
  isSaving
}) {
  return (
    <div className={className}>
      {label}

      {
        isSaving &&
          <SpinnerIcon
            className={styles.savingIcon}
            name={icons.SPINNER}
            isSpinning={true}
          />
      }
    </div>
  );
}

BookEditorFooterLabel.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  isSaving: PropTypes.bool.isRequired
};

export default BookEditorFooterLabel;
