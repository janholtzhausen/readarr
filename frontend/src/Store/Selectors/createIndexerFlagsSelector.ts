import AppState from 'App/State/AppState';

const createIndexerFlagsSelector = (state: AppState) =>
  state.settings.indexerFlags;

export default createIndexerFlagsSelector;
