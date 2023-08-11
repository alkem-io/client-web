import { useEffect, useState } from 'react';

const LOCALSTORAGE_VERSIONCONTROL_KEY = 'releaseNotification';

interface ReleaseNotificationData {
  prevClientVersion: string;
}

const useVersionControl = () => {
  const currentClientVersion = process.env.REACT_APP_VERSION ?? '';

  const checkLastVersionViewed = () => {
    const data = localStorage.getItem(LOCALSTORAGE_VERSIONCONTROL_KEY);
    if (!data) {
      return false;
    }
    try {
      const { prevClientVersion } = JSON.parse(data) as ReleaseNotificationData;
      return prevClientVersion === currentClientVersion;
    } catch {}
    return false;
  };

  const [isCurrentVersionViewed, setCurrentVersionViewed] = useState(checkLastVersionViewed);

  const saveCurrentVersionViewed = () => {
    const data: ReleaseNotificationData = {
      prevClientVersion: currentClientVersion,
    };
    localStorage.setItem(LOCALSTORAGE_VERSIONCONTROL_KEY, JSON.stringify(data));
    setCurrentVersionViewed(true);
  };

  useEffect(() => {
    // Detect value changes on other tabs:
    const onStorageChange = () => {
      setCurrentVersionViewed(checkLastVersionViewed());
    };
    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  return {
    currentClientVersion,
    saveCurrentVersionViewed,
    isCurrentVersionViewed,
  };
};

export default useVersionControl;
