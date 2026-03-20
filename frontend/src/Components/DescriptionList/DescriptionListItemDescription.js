import PropTypes from 'prop-types';
import React from 'react';
import styles from './DescriptionListItemDescription.css';

function DescriptionListItemDescription({
  className = styles.description,
  children
}) {
  return (
    <dd className={className}>
      {children}
    </dd>
  );
}

DescriptionListItemDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node])
};

export default DescriptionListItemDescription;
