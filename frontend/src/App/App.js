import PropTypes from 'prop-types';
import React from 'react';
import { Provider } from 'react-redux';
import PageConnector from 'Components/Page/PageConnector';
import { Router } from 'Components/Router/RouterContext';
import useDocumentTitle from 'Utilities/useDocumentTitle';
import ApplyTheme from './ApplyTheme';
import AppRoutes from './AppRoutes';

function App({ store, history }) {
  useDocumentTitle();

  return (
    <Provider store={store}>
      <Router history={history}>
        <ApplyTheme>
          <PageConnector>
            <AppRoutes app={App} />
          </PageConnector>
        </ApplyTheme>
      </Router>
    </Provider>
  );
}

App.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default App;
