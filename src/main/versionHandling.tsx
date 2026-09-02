import { useEffect, useState } from 'react';
import { info as logInfo, warn as logWarn } from '@/core/logging/sentry/log';
import { AppVersionBanner } from '@/crd/components/common/AppVersionBanner';
import { cleanupVersionUpdateListeners, onVersionUpdate, syncClientVersion } from '@/serviceWorker';

const LAST_VERSION_MISMATCH_LS_KEY = 'lastVersionMismatch';

/**
 * Listens for service worker messages about new versions and renders the CRD update banner.
 */
export const VersionHandling = () => {
  const appVersion = import.meta.env.VITE_VERSION;
  const [open, setOpen] = useState(false);
  const [recurring, setRecurring] = useState(false);

  const buildVersionMismatchPair = (oldVersion: string, newVersion: string) => {
    return `${oldVersion}|${newVersion}`;
  };
  const setLastVersionDetected = (oldVersion: string, newVersion: string) => {
    try {
      localStorage.setItem(LAST_VERSION_MISMATCH_LS_KEY, buildVersionMismatchPair(oldVersion, newVersion));
    } catch (_e) {}
  };
  const getLastVersionDetected = () => {
    try {
      return localStorage.getItem(LAST_VERSION_MISMATCH_LS_KEY) || '';
    } catch (_error) {
      logWarn('Failed to read version mismatch info.', { label: 'VERSION_MISMATCH_STORAGE' });
      return '';
    }
  };
  const isRecurringMismatch = (oldVersion: string, newVersion: string) => {
    return getLastVersionDetected() === buildVersionMismatchPair(oldVersion, newVersion);
  };

  useEffect(() => {
    syncClientVersion(appVersion);

    onVersionUpdate(latestBuildVersion => {
      // this callback should be called only when there's a version mismatch
      // however in Sentry, there are logs with matching versions
      if (appVersion !== latestBuildVersion) {
        logInfo(`Current: ${appVersion}; New: ${latestBuildVersion};`, { label: 'VERSION_MISMATCH' });
        setRecurring(isRecurringMismatch(appVersion, latestBuildVersion));
        setOpen(true);
        setLastVersionDetected(appVersion, latestBuildVersion);
      }
    });

    return () => cleanupVersionUpdateListeners();
  }, []);

  if (!open) {
    return null;
  }

  const handleReload = () => {
    // using window to avoid redundant re-rendering
    window.location.replace(window.location.pathname + window.location.search);
  };

  return <AppVersionBanner recurring={recurring} onReload={handleReload} />;
};
