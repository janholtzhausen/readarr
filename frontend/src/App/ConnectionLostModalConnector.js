import React from 'react';
import ConnectionLostModal from './ConnectionLostModal';

function ConnectionLostModalConnector(props) {
  return (
    <ConnectionLostModal
      {...props}
      onModalClose={() => {
        location.reload();
      }}
    />
  );
}

export default ConnectionLostModalConnector;
