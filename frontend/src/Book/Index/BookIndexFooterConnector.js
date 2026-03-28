import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import BookIndexFooter from './BookIndexFooter';

function createUnoptimizedSelector() {
  return createSelector(
    createClientSideCollectionSelector('books', 'bookIndex'),
    (books) => {
      return books.items.map((s) => {
        const {
          authorId,
          monitored,
          status,
          statistics
        } = s;

        return {
          authorId,
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
    (book) => {
      return {
        book
      };
    }
  );
}

export default connect(createMapStateToProps)(BookIndexFooter);
