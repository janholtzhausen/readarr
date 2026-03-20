import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

function Portal(props) {
  const {
    children,
    target = document.getElementById('portal-root')
  } = props;
  return ReactDOM.createPortal(children, target);
}

Portal.propTypes = {
  children: PropTypes.node.isRequired,
  target: PropTypes.object
};

export default Portal;
