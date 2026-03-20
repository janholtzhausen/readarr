import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'Components/Router/RouterContext';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import SwipeHeader from './SwipeHeader';

function createMapStateToProps() {
  return createSelector(
    createDimensionsSelector(),
    (dimensions) => {
      return {
        isSmallScreen: dimensions.isSmallScreen
      };
    }
  );
}

class SwipeHeaderConnector extends Component {

  onGoTo = (url) => {
    this.props.history.push(`${window.Readarr.urlBase}${url}`);
  };

  //
  // Render

  render() {
    return (
      <SwipeHeader
        {...this.props}
        onGoTo={this.onGoTo}
      />
    );
  }
}

SwipeHeaderConnector.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired
};

export default withRouter(connect(createMapStateToProps)(SwipeHeaderConnector));
