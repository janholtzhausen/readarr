import { connect } from 'react-redux';
import AuthorIndexTableOptions from './AuthorIndexTableOptions';

function createMapStateToProps() {
  return (state) => state.authorIndex.tableOptions;
}

export default connect(createMapStateToProps)(AuthorIndexTableOptions);
