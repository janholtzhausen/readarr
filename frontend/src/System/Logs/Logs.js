import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Switch from 'Components/Router/Switch';
import LogFilesConnector from './Files/LogFilesConnector';
import UpdateLogFilesConnector from './Updates/UpdateLogFilesConnector';

class Logs extends Component {

  //
  // Render

  render() {
    return (
      <Switch>
        <Route path="/" element={<LogFilesConnector />} />

        <Route path="update" element={<UpdateLogFilesConnector />} />
      </Switch>
    );
  }
}

export default Logs;
