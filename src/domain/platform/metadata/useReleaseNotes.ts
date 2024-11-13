import { useEffect, useState } from 'react';
import { error as sentryError } from '@core/logging/sentry/log';

const LOCALSTORAGE_RELEASE_NOTES_KEY = 'releaseNotes';

interface ReleaseNotesData {
  lastSeenNoteId: string;
}

const useReleaseNotes = (latestNoteUrl: string) => {
  const parseReleaseNotesData = (data: string) => {
    try {
      return JSON.parse(data) as ReleaseNotesData;
    } catch (error) {
      sentryError(new Error(`Error parsing release notes data: ${error}`));
      return null;
    }
  };

  const hasViewedLastNote = () => {
    const data = localStorage.getItem(LOCALSTORAGE_RELEASE_NOTES_KEY);
    if (!data) {
      return false;
    }
    const releaseNotesData = parseReleaseNotesData(data);
    if (!releaseNotesData) {
      return false;
    }
    return releaseNotesData.lastSeenNoteId === latestNoteUrl;
  };

  const [isOpen, setIsOpen] = useState(!hasViewedLastNote());

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(LOCALSTORAGE_RELEASE_NOTES_KEY, JSON.stringify({ lastSeenNoteId: latestNoteUrl }));
  };

  useEffect(() => {
    // Detect value changes on other tabs:
    const onStorageChange = (e: StorageEvent) => {
      if (e.key !== LOCALSTORAGE_RELEASE_NOTES_KEY || e.newValue === null) {
        return;
      }

      const releaseNotesData = parseReleaseNotesData(e.newValue);

      if (!releaseNotesData) {
        return;
      }

      setIsOpen(isOpen => isOpen && releaseNotesData.lastSeenNoteId !== latestNoteUrl);
    };

    window.addEventListener('storage', onStorageChange);

    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  return {
    open: isOpen,
    onClose: handleClose,
  };
};

export default useReleaseNotes;
