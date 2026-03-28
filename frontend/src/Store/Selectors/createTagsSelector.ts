import AppState from 'App/State/AppState';

function createTagsSelector() {
  return (state: AppState) => state.tags.items;
}

export default createTagsSelector;
