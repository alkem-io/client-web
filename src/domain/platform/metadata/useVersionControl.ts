import { useEffect, useState } from 'react';

const LOCALSTORATE_VERSIONCONTROL_KEY = 'releaseNotification';

interface ReleaseNotificationData {
  prevClientVersion: string;
}

const useVersionControl = () => {
  const currentClientVersion = process.env.REACT_APP_VERSION ?? '';
  const [isCurrentVersionViewed, setCurrentVersionViewed] = useState(false);

  const saveCurrentVersionViewed = () => {
    const data: ReleaseNotificationData = {
      prevClientVersion: currentClientVersion,
    };
    localStorage.setItem(LOCALSTORATE_VERSIONCONTROL_KEY, JSON.stringify(data));
    setCurrentVersionViewed(true);
  };

  useEffect(() => {
    const data = localStorage.getItem(LOCALSTORATE_VERSIONCONTROL_KEY);
    if (!data) {
      setCurrentVersionViewed(false);
      return;
    }
    try {
      const { prevClientVersion } = JSON.parse(data) as ReleaseNotificationData;
      if (prevClientVersion === currentClientVersion) {
        setCurrentVersionViewed(true);
      } else {
        setCurrentVersionViewed(false);
      }
    } catch {
      setCurrentVersionViewed(false);
      return;
    }
  }, [process.env.REACT_APP_VERSION]);

  return {
    currentClientVersion,
    saveCurrentVersionViewed,
    isCurrentVersionViewed,
  };
};

export default useVersionControl;
