import PropTypes from 'prop-types';
import React from 'react';

export const PageWrapper = ({ children }) => (
  <div className="page-wrapper">{children}</div>
);

PageWrapper.displayName = 'PageWrapper';
PageWrapper.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
export default PageWrapper;
