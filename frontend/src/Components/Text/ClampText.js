import PropTypes from 'prop-types';
import React from 'react';

function ClampText({ className, line, text, title }) {
  return (
    <div
      className={className}
      style={{
        display: '-webkit-box',
        overflow: 'hidden',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: line
      }}
      title={title ?? text}
    >
      {text}
    </div>
  );
}

ClampText.propTypes = {
  className: PropTypes.string,
  line: PropTypes.number.isRequired,
  text: PropTypes.string,
  title: PropTypes.string
};

ClampText.defaultProps = {
  text: ''
};

export default ClampText;
