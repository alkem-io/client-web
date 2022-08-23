import React, { FC } from 'react';
import ReleaseUpdatesTopBar from './ReleaseUpdatesTopBar';

const PlatformUpdates: FC = () => {
  // const clientVersion = process.env.REACT_APP_VERSION || '';
  const releaseNotificationData = localStorage.getItem('releaseNotification');
  let showReleaseUpdatesNotification = false;

  if (releaseNotificationData == null) {
    showReleaseUpdatesNotification = true;
  }

  // Todo: previous version check will be added in the next iteration
  // if (releaseNotificationData !== null) {
  //   const { prevClientVersion } = JSON.parse(releaseNotificationData);
  //   const storageVersionNumbers = prevClientVersion.split('.');
  //   const versionNumbers = clientVersion.split('.');
  //   if (storageVersionNumbers[1] < versionNumbers[1]) {
  //     showReleaseUpdatesNotification = true;
  //   }
  // }

  return <>{showReleaseUpdatesNotification && <ReleaseUpdatesTopBar />}</>;
};

export default PlatformUpdates;
