import { useEffect, useState } from 'react';

const LOCALSTORAGE_RELEASE_NOTES_KEY = 'releaseNotes';

interface ReleaseNotesData {
  lastSeenNoteId: string;
}

const useReleaseNotes = (latestNoteUrl: string) => {
  const checkLatestNoteViewed = () => {
    const data = localStorage.getItem(LOCALSTORAGE_RELEASE_NOTES_KEY);
    if (!data) {
      return false;
    }
    try {
      const { lastSeenNoteId } = JSON.parse(data) as ReleaseNotesData;
      return lastSeenNoteId === latestNoteUrl;
    } catch {
      return false;
    }
  };

  const [isOpen, setIsOpen] = useState(!checkLatestNoteViewed());

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(LOCALSTORAGE_RELEASE_NOTES_KEY, JSON.stringify({ lastSeenNoteId: latestNoteUrl }));
  };

  useEffect(() => {
    // Detect value changes on other tabs:
    const onStorageChange = (e: StorageEvent) => {
      if (e.key !== LOCALSTORAGE_RELEASE_NOTES_KEY) {
        return;
      }

      setIsOpen(e.newValue === latestNoteUrl);
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
