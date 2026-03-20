export function createAction(type, payloadCreator) {
  const actionCreator = (...args) => {
    if (!payloadCreator) {
      return {
        type,
        payload: args[0]
      };
    }

    return {
      type,
      payload: payloadCreator(...args)
    };
  };

  actionCreator.toString = () => type;
  actionCreator.type = type;

  return actionCreator;
}

export function handleActions(handlers, defaultState) {
  return function reducer(state = defaultState, action) {
    const handler = handlers[action.type];

    if (!handler) {
      return state;
    }

    return handler(state, action);
  };
}
