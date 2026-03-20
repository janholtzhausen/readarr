import React from 'react';
import useAppSelector from 'Store/Hooks/useAppSelector';
import Messages from './Messages';

function MessagesConnector() {
  const messages = useAppSelector((state) => state.app.messages.items);

  return (
    <Messages messages={messages.slice().reverse()} />
  );
}

export default MessagesConnector;
