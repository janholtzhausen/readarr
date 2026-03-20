import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { saveRootFolder, setRootFolderValue } from 'Store/Actions/settingsActions';
import createProviderSettingsSelector from 'Store/Selectors/createProviderSettingsSelector';
import EditRootFolderModalContent from './EditRootFolderModalContent';

function getDerivedRootFolderName(path) {
  if (!path) {
    return '';
  }

  const trimmedPath = path.replace(/[/\\]+$/, '');

  if (!trimmedPath) {
    return '';
  }

  const segments = trimmedPath.split(/[/\\]+/).filter(Boolean);

  return segments.length ? segments[segments.length - 1] : trimmedPath;
}

function createMapStateToProps() {
  return createSelector(
    (state, { id }) => id,
    (state) => state.settings.advancedSettings,
    (state) => state.settings.qualityProfiles,
    (state) => state.settings.metadataProfiles,
    (state) => state.settings.rootFolders,
    createProviderSettingsSelector('rootFolders'),
    (id, advancedSettings, qualityProfiles, metadataProfiles, rootFolders, rootFolderSettings) => {
      const defaultQualityProfileId = qualityProfiles.items[0]?.id ?? 0;
      const defaultMetadataProfileId = metadataProfiles.items[0]?.id ?? 0;
      const item = rootFolderSettings.item;
      const resolvedPath = item.path?.value ?? '';
      const resolvedName = item.name?.value || getDerivedRootFolderName(resolvedPath);

      return {
        advancedSettings,
        showMetadataProfile: metadataProfiles.items.length > 1,
        defaultQualityProfileId,
        defaultMetadataProfileId,
        ...rootFolderSettings,
        isFetching: rootFolders.isFetching,
        item: {
          ...item,
          name: {
            ...item.name,
            value: resolvedName
          },
          defaultQualityProfileId: {
            ...item.defaultQualityProfileId,
            value: item.defaultQualityProfileId?.value || defaultQualityProfileId
          },
          defaultMetadataProfileId: {
            ...item.defaultMetadataProfileId,
            value: item.defaultMetadataProfileId?.value || defaultMetadataProfileId
          }
        }
      };
    }
  );
}

const mapDispatchToProps = {
  setRootFolderValue,
  saveRootFolder
};

class EditRootFolderModalContentConnector extends Component {

  //
  // Lifecycle

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isSaving && !this.props.isSaving && !this.props.saveError) {
      this.props.onModalClose();
    }
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.props.setRootFolderValue({ name, value });
  };

  onSavePress = () => {
    const path = this.props.item.path?.value ?? '';
    const name = this.props.item.name?.value || getDerivedRootFolderName(path);

    this.props.saveRootFolder({
      id: this.props.id,
      name,
      defaultQualityProfileId: this.props.item.defaultQualityProfileId?.value || this.props.defaultQualityProfileId,
      defaultMetadataProfileId: this.props.item.defaultMetadataProfileId?.value || this.props.defaultMetadataProfileId
    });

    if (this.props.onRootFolderAdded) {
      this.props.onRootFolderAdded({ value: path });
    }
  };

  //
  // Render

  render() {
    return (
      <EditRootFolderModalContent
        {...this.props}
        onSavePress={this.onSavePress}
        onInputChange={this.onInputChange}
      />
    );
  }
}

EditRootFolderModalContentConnector.propTypes = {
  id: PropTypes.number,
  isFetching: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  saveError: PropTypes.object,
  item: PropTypes.object.isRequired,
  defaultQualityProfileId: PropTypes.number.isRequired,
  defaultMetadataProfileId: PropTypes.number.isRequired,
  setRootFolderValue: PropTypes.func.isRequired,
  saveRootFolder: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired,
  onRootFolderAdded: PropTypes.func
};

export default connect(createMapStateToProps, mapDispatchToProps)(EditRootFolderModalContentConnector);
