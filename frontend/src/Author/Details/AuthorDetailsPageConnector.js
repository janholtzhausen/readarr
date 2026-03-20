import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'Components/Router/RouterContext';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import NotFound from 'Components/NotFound';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import AuthorDetailsConnector from './AuthorDetailsConnector';
import styles from './AuthorDetails.css';

function createMapStateToProps() {
  return createSelector(
    (state, { match }) => match,
    (state) => state.authors,
    (match, authors) => {
      const titleSlug = match.params.titleSlug;
      const {
        isFetching,
        isPopulated,
        error,
        items
      } = authors;

      const authorIndex = _.findIndex(items, { titleSlug });

      if (authorIndex > -1) {
        return {
          isFetching,
          isPopulated,
          titleSlug
        };
      }

      return {
        isFetching,
        isPopulated,
        error
      };
    }
  );
}

class AuthorDetailsPageConnector extends Component {

  //
  // Lifecycle

  componentDidUpdate(prevProps) {
    if (!this.props.titleSlug) {
      this.props.history.push(`${window.Readarr.urlBase}/`);
      return;
    }
  }

  //
  // Render

  render() {
    const {
      titleSlug,
      isFetching,
      isPopulated,
      error
    } = this.props;

    if (isFetching && !isPopulated) {
      return (
        <PageContent title={translate('Loading')}>
          <PageContentBody>
            <LoadingIndicator />
          </PageContentBody>
        </PageContent>
      );
    }

    if (!isFetching && !!error) {
      return (
        <div className={styles.errorMessage}>
          {getErrorMessage(error, 'Failed to load author from API')}
        </div>
      );
    }

    if (!titleSlug) {
      return (
        <NotFound
          message={translate('SorryThatAuthorCannotBeFound')}
        />
      );
    }

    return (
      <AuthorDetailsConnector
        titleSlug={titleSlug}
      />
    );
  }
}

AuthorDetailsPageConnector.propTypes = {
  titleSlug: PropTypes.string,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  match: PropTypes.shape({ params: PropTypes.shape({ titleSlug: PropTypes.string.isRequired }).isRequired }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired
};

export default withRouter(connect(createMapStateToProps)(AuthorDetailsPageConnector));
