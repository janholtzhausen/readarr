import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import AuthorIndexFooter from './AuthorIndexFooter';

function createUnoptimizedSelector() {
  return createSelector(
    createClientSideCollectionSelector('authors', 'authorIndex'),
    (authors) => {
      return authors.items.map((s) => {
        const {
          monitored,
          status,
          statistics
        } = s;

        return {
          monitored,
          status,
          statistics
        };
      });
    }
  );
}

function createMapStateToProps() {
  return createSelector(
    createUnoptimizedSelector(),
    (author) => {
      return {
        author
      };
    }
  );
}

export default connect(createMapStateToProps)(AuthorIndexFooter);
