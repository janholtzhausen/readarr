import { connect } from 'react-redux';
import BookIndexTableOptions from './BookIndexTableOptions';

function createMapStateToProps() {
  return (state) => state.bookIndex.tableOptions;
}

export default connect(createMapStateToProps)(BookIndexTableOptions);
