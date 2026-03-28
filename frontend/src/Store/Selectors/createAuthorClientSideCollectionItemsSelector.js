import { createSelector } from 'reselect';
import createClientSideCollectionSelector from './createClientSideCollectionSelector';

function createUnoptimizedSelector(uiSection) {
  return createSelector(
    createClientSideCollectionSelector('authors', uiSection),
    (authors) => {
      const items = authors.items.map((s) => {
        const {
          id,
          sortName,
          sortNameLastFirst
        } = s;

        return {
          id,
          sortName,
          sortNameLastFirst
        };
      });

      return {
        ...authors,
        items
      };
    }
  );
}

function createAuthorClientSideCollectionItemsSelector(uiSection) {
  return createUnoptimizedSelector(uiSection);
}

export default createAuthorClientSideCollectionItemsSelector;
