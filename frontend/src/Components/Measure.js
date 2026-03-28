import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import useMeasure from 'react-use-measure';

function Measure({ className, style, onMeasure, children, ...otherProps }) {
  const [ref, bounds] = useMeasure();

  useEffect(() => {
    if (bounds.width > 0 || bounds.height > 0) {
      onMeasure(bounds);
    }
  }, [bounds, onMeasure]);

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      {...otherProps}
    >
      {children}
    </div>
  );
}

Measure.propTypes = {
  className: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onMeasure: PropTypes.func.isRequired,
  children: PropTypes.node
};

export default Measure;
