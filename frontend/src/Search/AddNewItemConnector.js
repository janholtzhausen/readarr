import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'Components/Router/RouterContext';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { clearSearchResults, getSearchResults } from 'Store/Actions/searchActions';
import { fetchRootFolders } from 'Store/Actions/settingsActions';
import parseUrl from 'Utilities/String/parseUrl';
import AddNewItem from './AddNewItem';

function createMapStateToProps() {
  return createSelector(
    (state) => state.search,
    (state) => state.authors.items.length,
    (state, { location }) => location,
    (search, existingAuthorsCount, location) => {
      const { params } = parseUrl(location.search);

      return {
        ...search,
        term: params.term,
        hasExistingAuthors: existingAuthorsCount > 0
      };
    }
  );
}

const mapDispatchToProps = {
  getSearchResults,
  clearSearchResults,
  fetchRootFolders
};

class AddNewItemConnector extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._searchTimeout = null;
  }

  componentDidMount() {
    this.props.fetchRootFolders();
  }

  componentWillUnmount() {
    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout);
    }

    this.props.clearSearchResults();
  }

  //
  // Listeners

  onSearchChange = (term) => {
    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout);
    }

    if (term.trim() === '') {
      this.props.clearSearchResults();
    } else {
      this._searchTimeout = setTimeout(() => {
        this.props.getSearchResults({ term });
      }, 300);
    }
  };

  onClearSearch = () => {
    this.props.clearSearchResults();
  };

  //
  // Render

  render() {
    const {
      term,
      ...otherProps
    } = this.props;

    return (
      <AddNewItem
        term={term}
        {...otherProps}
        onSearchChange={this.onSearchChange}
        onClearSearch={this.onClearSearch}
      />
    );
  }
}

AddNewItemConnector.propTypes = {
  term: PropTypes.string,
  location: PropTypes.shape({ search: PropTypes.string.isRequired }).isRequired,
  getSearchResults: PropTypes.func.isRequired,
  clearSearchResults: PropTypes.func.isRequired,
  fetchRootFolders: PropTypes.func.isRequired
};

export default withRouter(connect(createMapStateToProps, mapDispatchToProps)(AddNewItemConnector));
