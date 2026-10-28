import React from 'react';
import PropTypes from 'prop-types';

/**
 * BiIcon - tiny helper to render Bootstrap Icons at a normalized size
 */
export function BiIcon({ name, size = 16, className = '', style = {}, ...props }) {
  const cls = `bi bi-${name} ${className}`.trim();
  return (
    <i
      className={cls}
      style={{ fontSize: typeof size === 'number' ? `${size}px` : size, lineHeight: 1, display: 'inline-block', verticalAlign: 'middle', ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}

BiIcon.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

export default BiIcon;

