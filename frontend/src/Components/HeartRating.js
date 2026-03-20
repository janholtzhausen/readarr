import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import styles from './HeartRating.css';

function HeartRating({ rating, iconSize = 14 }) {
  return (
    <span className={styles.rating}>
      <Icon
        className={styles.heart}
        name={icons.HEART}
        size={iconSize}
      />

      {rating.toFixed(1)}
    </span>
  );
}

HeartRating.propTypes = {
  rating: PropTypes.number.isRequired,
  iconSize: PropTypes.number
};

export default HeartRating;
