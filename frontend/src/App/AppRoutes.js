import PropTypes from 'prop-types';
import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import BlocklistConnector from 'Activity/Blocklist/BlocklistConnector';
import HistoryConnector from 'Activity/History/HistoryConnector';
import QueueConnector from 'Activity/Queue/QueueConnector';
import AuthorDetailsPageConnector from 'Author/Details/AuthorDetailsPageConnector';
import AuthorIndexConnector from 'Author/Index/AuthorIndexConnector';
import BookDetailsPageConnector from 'Book/Details/BookDetailsPageConnector';
import BookIndexConnector from 'Book/Index/BookIndexConnector';
import BookshelfConnector from 'Bookshelf/BookshelfConnector';
import CalendarPageConnector from 'Calendar/CalendarPageConnector';
import NotFound from 'Components/NotFound';
import Switch from 'Components/Router/Switch';
import AddNewItemConnector from 'Search/AddNewItemConnector';
import CustomFormatSettingsConnector from 'Settings/CustomFormats/CustomFormatSettingsConnector';
import DevelopmentSettingsConnector from 'Settings/Development/DevelopmentSettingsConnector';
import DownloadClientSettingsConnector from 'Settings/DownloadClients/DownloadClientSettingsConnector';
import GeneralSettingsConnector from 'Settings/General/GeneralSettingsConnector';
import ImportListSettingsConnector from 'Settings/ImportLists/ImportListSettingsConnector';
import IndexerSettingsConnector from 'Settings/Indexers/IndexerSettingsConnector';
import MediaManagementConnector from 'Settings/MediaManagement/MediaManagementConnector';
import MetadataSettings from 'Settings/Metadata/MetadataSettings';
import NotificationSettings from 'Settings/Notifications/NotificationSettings';
import Profiles from 'Settings/Profiles/Profiles';
import QualityConnector from 'Settings/Quality/QualityConnector';
import Settings from 'Settings/Settings';
import TagSettings from 'Settings/Tags/TagSettings';
import UISettingsConnector from 'Settings/UI/UISettingsConnector';
import BackupsConnector from 'System/Backup/BackupsConnector';
import LogsTableConnector from 'System/Events/LogsTableConnector';
import Logs from 'System/Logs/Logs';
import Status from 'System/Status/Status';
import Tasks from 'System/Tasks/Tasks';
import Updates from 'System/Updates/Updates';
import UnmappedFilesTableConnector from 'UnmappedFiles/UnmappedFilesTableConnector';
import getPathWithUrlBase from 'Utilities/getPathWithUrlBase';
import CutoffUnmetConnector from 'Wanted/CutoffUnmet/CutoffUnmetConnector';
import MissingConnector from 'Wanted/Missing/MissingConnector';

function AppRoutes(props) {
  return (
    <Switch>
      {/*
        Author
      */}

      <Route path="/" element={<AuthorIndexConnector />} />

      {
        window.Readarr.urlBase &&
          <Route
            path="/"
            element={<Navigate replace={true} to={getPathWithUrlBase('/')} />}
          />
      }

      <Route path="/authors" element={<AuthorIndexConnector />} />

      <Route path="/add/search" element={<AddNewItemConnector />} />

      <Route path="/shelf" element={<BookshelfConnector />} />

      <Route path="/books" element={<BookIndexConnector />} />

      <Route path="/unmapped" element={<UnmappedFilesTableConnector />} />

      <Route path="/author/:titleSlug" element={<AuthorDetailsPageConnector />} />

      <Route path="/book/:titleSlug" element={<BookDetailsPageConnector />} />

      {/*
        Calendar
      */}

      <Route path="/calendar" element={<CalendarPageConnector />} />

      {/*
        Activity
      */}

      <Route path="/activity/history" element={<HistoryConnector />} />

      <Route path="/activity/queue" element={<QueueConnector />} />

      <Route path="/activity/blocklist" element={<BlocklistConnector />} />

      {/*
        Wanted
      */}

      <Route path="/wanted/missing" element={<MissingConnector />} />

      <Route path="/wanted/cutoffunmet" element={<CutoffUnmetConnector />} />

      {/*
        Settings
      */}

      <Route path="/settings" element={<Settings />} />

      <Route path="/settings/mediamanagement" element={<MediaManagementConnector />} />

      <Route path="/settings/profiles" element={<Profiles />} />

      <Route path="/settings/quality" element={<QualityConnector />} />

      <Route path="/settings/customformats" element={<CustomFormatSettingsConnector />} />

      <Route path="/settings/indexers" element={<IndexerSettingsConnector />} />

      <Route path="/settings/downloadclients" element={<DownloadClientSettingsConnector />} />

      <Route path="/settings/importlists" element={<ImportListSettingsConnector />} />

      <Route path="/settings/connect" element={<NotificationSettings />} />

      <Route path="/settings/metadata" element={<MetadataSettings />} />

      <Route path="/settings/tags" element={<TagSettings />} />

      <Route path="/settings/general" element={<GeneralSettingsConnector />} />

      <Route path="/settings/ui" element={<UISettingsConnector />} />

      <Route path="/settings/development" element={<DevelopmentSettingsConnector />} />

      {/*
        System
      */}

      <Route path="/system/status" element={<Status />} />

      <Route path="/system/tasks" element={<Tasks />} />

      <Route path="/system/backup" element={<BackupsConnector />} />

      <Route path="/system/updates" element={<Updates />} />

      <Route path="/system/events" element={<LogsTableConnector />} />

      <Route path="/system/logs/files/*" element={<Logs />} />

      {/*
        Not Found
      */}

      <Route path="*" element={<NotFound />} />

    </Switch>
  );
}

AppRoutes.propTypes = {
  app: PropTypes.func.isRequired
};

export default AppRoutes;
