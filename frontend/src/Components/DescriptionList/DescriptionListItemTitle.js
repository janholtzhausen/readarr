import PropTypes from 'prop-types';
import React from 'react';
import styles from './DescriptionListItemTitle.css';

function DescriptionListItemTitle({
  className = styles.title,
  children
}) {
  return (
    <dt className={className}>
      {children}
    </dt>
  );
}

DescriptionListItemTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.string
};

export default DescriptionListItemTitle;
