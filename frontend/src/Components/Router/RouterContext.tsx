import PropTypes from 'prop-types';
import React, { createContext, useContext } from 'react';
import {
  unstable_HistoryRouter as HistoryRouter,
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
} from 'react-router-dom';

const LegacyHistoryContext = createContext(null);

export function Router({ children, history }) {
  return (
    <LegacyHistoryContext.Provider value={history}>
      <HistoryRouter history={history}>{children}</HistoryRouter>
    </LegacyHistoryContext.Provider>
  );
}

Router.propTypes = {
  children: PropTypes.node.isRequired,
  history: PropTypes.object.isRequired,
};

export function useLegacyRouter() {
  const history = useContext(LegacyHistoryContext);
  const navigate = useNavigate();
  const location = useLocation();
  const action = useNavigationType();
  const params = useParams();

  return {
    history: {
      ...history,
      action,
      location,
      push: (to, state) => navigate(to, { state }),
      replace: (to, state) => navigate(to, { replace: true, state }),
      goBack: () => navigate(-1),
      goForward: () => navigate(1),
    },
    location,
    match: { params },
  };
}

export function withRouter(WrappedComponent) {
  function RouterComponent(props) {
    const routerProps = useLegacyRouter();

    return <WrappedComponent {...props} {...routerProps} />;
  }

  RouterComponent.displayName = `withRouter(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return RouterComponent;
}
