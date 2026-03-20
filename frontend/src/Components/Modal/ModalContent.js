import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import styles from './ModalContent.css';

function ModalContent({
  className = styles.modalContent,
  children,
  showCloseButton = true,
  onModalClose,
  ...otherProps
}) {
  return (
    <div
      className={className}
      {...otherProps}
    >
      {
        showCloseButton &&
          <Link
            className={styles.closeButton}
            onPress={onModalClose}
          >
            <Icon
              name={icons.CLOSE}
              size={18}
            />
          </Link>
      }

      {children}
    </div>
  );
}

ModalContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  showCloseButton: PropTypes.bool,
  onModalClose: PropTypes.func.isRequired
};

export default ModalContent;
