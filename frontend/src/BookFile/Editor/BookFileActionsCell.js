import PropTypes from 'prop-types';
import React, { Component } from 'react';
import FileDetailsModal from 'BookFile/FileDetailsModal';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import { icons, kinds } from 'Helpers/Props';
import getPathWithUrlBase from 'Utilities/getPathWithUrlBase';
import translate from 'Utilities/String/translate';
import styles from './BookFileActionsCell.css';

class BookFileActionsCell extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isDetailsModalOpen: false,
      isConfirmDeleteModalOpen: false
    };
  }

  //
  // Listeners

  onDetailsPress = () => {
    this.setState({ isDetailsModalOpen: true });
  };

  onDetailsModalClose = () => {
    this.setState({ isDetailsModalOpen: false });
  };

  onDeleteFilePress = () => {
    this.setState({ isConfirmDeleteModalOpen: true });
  };

  onConfirmDelete = () => {
    this.setState({ isConfirmDeleteModalOpen: false });
    this.props.deleteBookFile({ id: this.props.id });
  };

  onConfirmDeleteModalClose = () => {
    this.setState({ isConfirmDeleteModalOpen: false });
  };

  getDownloadUrl = (format) => {
    const {
      id
    } = this.props;

    const search = new URLSearchParams({
      apikey: window.Readarr.apiKey
    });

    if (format) {
      search.set('format', format);
    }

    return getPathWithUrlBase(`/api/v1/bookfile/${id}/download?${search.toString()}`);
  };

  //
  // Render

  render() {

    const {
      id,
      path
    } = this.props;

    const {
      isDetailsModalOpen,
      isConfirmDeleteModalOpen
    } = this.state;

    return (
      <TableRowCell className={styles.TrackActionsCell}>
        {
          path &&
            <div className={styles.downloadLinks}>
              <Link
                className={styles.downloadLink}
                title="Download file"
                to={this.getDownloadUrl()}
                target="_blank"
                noRouter={true}
              >
                File
              </Link>

              <Link
                className={styles.downloadLink}
                title="Download EPUB"
                to={this.getDownloadUrl('epub')}
                target="_blank"
                noRouter={true}
              >
                <Icon
                  className={styles.downloadLinkIcon}
                  name={icons.BOOK_OPEN}
                />
                EPUB
              </Link>

              <Link
                className={styles.downloadLink}
                title="Download AZW3"
                to={this.getDownloadUrl('azw3')}
                target="_blank"
                noRouter={true}
              >
                <Icon
                  className={styles.downloadLinkIcon}
                  name={icons.TABLET}
                />
                AZW3
              </Link>
            </div>
        }
        {
          path &&
            <IconButton
              name={icons.INFO}
              onPress={this.onDetailsPress}
            />
        }
        {
          path &&
            <IconButton
              name={icons.DELETE}
              onPress={this.onDeleteFilePress}
            />
        }

        <FileDetailsModal
          isOpen={isDetailsModalOpen}
          onModalClose={this.onDetailsModalClose}
          id={id}
        />

        <ConfirmModal
          isOpen={isConfirmDeleteModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteBookFile')}
          message={translate('DeleteBookFileMessageText', [path])}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDelete}
          onCancel={this.onConfirmDeleteModalClose}
        />
      </TableRowCell>

    );
  }
}

BookFileActionsCell.propTypes = {
  id: PropTypes.number.isRequired,
  path: PropTypes.string,
  canDownloadConverted: PropTypes.bool.isRequired,
  deleteBookFile: PropTypes.func.isRequired
};

export default BookFileActionsCell;
