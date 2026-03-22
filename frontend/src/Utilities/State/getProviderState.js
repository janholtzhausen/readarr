import _ from 'lodash';
import getSectionState from 'Utilities/State/getSectionState';
import normalizeIndexerUrl from 'Settings/Indexers/Indexers/normalizeIndexerUrl';

function normalizeIndexerProviderState(providerState) {
  const implementation = providerState.implementation;

  if (!providerState.fields || typeof implementation !== 'string') {
    return providerState;
  }

  const baseUrlField = providerState.fields.find((field) => field.name === 'baseUrl');

  if (!baseUrlField) {
    return providerState;
  }

  const normalizedUrl = normalizeIndexerUrl(implementation, baseUrlField.value);

  if (!normalizedUrl) {
    return providerState;
  }

  return {
    ...providerState,
    fields: providerState.fields.map((field) => {
      if (field.name === 'baseUrl') {
        return {
          ...field,
          value: normalizedUrl.baseUrl
        };
      }

      if (field.name === 'apiPath' && normalizedUrl.apiPath) {
        return {
          ...field,
          value: normalizedUrl.apiPath
        };
      }

      if (field.name === 'apiKey' && normalizedUrl.apiKey) {
        return {
          ...field,
          value: normalizedUrl.apiKey
        };
      }

      return field;
    })
  };
}

function getProviderState(payload, getState, section, keyValueOnly=true) {
  const {
    id,
    ...otherPayload
  } = payload;

  const state = getSectionState(getState(), section, true);
  const pendingChanges = Object.assign({}, state.pendingChanges, otherPayload);
  const pendingFields = state.pendingChanges.fields || {};
  delete pendingChanges.fields;

  const item = id ? _.find(state.items, { id }) : state.selectedSchema || state.schema || {};

  if (item.fields) {
    pendingChanges.fields = _.reduce(item.fields, (result, field) => {
      const name = field.name;

      const value = pendingFields.hasOwnProperty(name) ?
        pendingFields[name] :
        field.value;

      // Only send the name and value to the server
      if (keyValueOnly) {
        result.push({
          name,
          value
        });
      } else {
        result.push({
          ...field,
          value
        });
      }

      return result;
    }, []);
  }

  let result = Object.assign({}, item, pendingChanges);

  delete result.presets;

  if (section === 'settings.indexers') {
    result = normalizeIndexerProviderState(result);
  }

  return result;
}

export default getProviderState;
