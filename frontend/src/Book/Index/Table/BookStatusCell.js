import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import VirtualTableRowCell from 'Components/Table/Cells/TableRowCell';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './BookStatusCell.css';

function BookStatusCell({
  className = styles.status,
  monitored,
  component: Component = VirtualTableRowCell,
  ...otherProps
}) {
  return (
    <Component
      className={className}
      {...otherProps}
    >
      <Icon
        className={styles.statusIcon}
        name={monitored ? icons.MONITORED : icons.UNMONITORED}
        title={monitored ? translate('MonitoredAuthorIsMonitored') : translate('MonitoredAuthorIsUnmonitored')}
      />
    </Component>
  );
}

BookStatusCell.propTypes = {
  className: PropTypes.string,
  monitored: PropTypes.bool.isRequired,
  component: PropTypes.elementType
};

export default BookStatusCell;
