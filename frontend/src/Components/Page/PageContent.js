import PropTypes from 'prop-types';
import React from 'react';
import ErrorBoundary from 'Components/Error/ErrorBoundary';
import useDocumentTitle from 'Utilities/useDocumentTitle';
import PageContentError from './PageContentError';
import styles from './PageContent.css';

function PageContent(props) {
  const {
    className = styles.content,
    title,
    children
  } = props;

  useDocumentTitle(title);

  return (
    <ErrorBoundary errorComponent={PageContentError}>
      <div className={className}>
        {children}
      </div>
    </ErrorBoundary>
  );
}

PageContent.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default PageContent;
