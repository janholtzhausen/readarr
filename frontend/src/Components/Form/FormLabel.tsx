import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { sizes } from 'Helpers/Props';
import styles from './FormLabel.css';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
  errorClassName?: string;
  size?: string;
  name?: string;
  hasError?: boolean;
  isAdvanced?: boolean;
}

function FormLabel({
  children,
  className = styles.label,
  errorClassName = styles.hasError,
  size = sizes.LARGE,
  name,
  hasError,
  isAdvanced = false,
  ...otherProps
}: FormLabelProps) {
  return (
    <label
      {...otherProps}
      className={classNames(
        className,
        styles[size],
        hasError && errorClassName,
        isAdvanced && styles.isAdvanced
      )}
      htmlFor={name}
    >
      {children}
    </label>
  );
}

FormLabel.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
  className: PropTypes.string,
  errorClassName: PropTypes.string,
  size: PropTypes.oneOf(sizes.all),
  name: PropTypes.string,
  hasError: PropTypes.bool,
  isAdvanced: PropTypes.bool
};

export default FormLabel;
