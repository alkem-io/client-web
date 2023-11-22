import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const LOCALSTORAGE_RELEASE_NOTES_KEY = 'releaseNotes';

interface ReleaseNotesData {
  lastSeenNoteId: string;
}

export const useReleaseNotes = () => {
  const { t } = useTranslation();
  const [latestNote, ...previousNotes] = t('notifications.releaseUpdates', { returnObjects: true });

  const checkLatestNoteViewed = () => {
    const data = localStorage.getItem(LOCALSTORAGE_RELEASE_NOTES_KEY);
    if (!data) {
      return false;
    }
    try {
      const { lastSeenNoteId } = JSON.parse(data) as ReleaseNotesData;
      return lastSeenNoteId === latestNote.id;
    } catch {
      return false;
    }
  };

  const [isLatestNoteViewed, setIsLatestNoteViewed] = useState(checkLatestNoteViewed());

  const _setIsLatestNoteViewed = useCallback(
    (isViewed: boolean) => {
      if (isViewed) {
        const data: ReleaseNotesData = {
          lastSeenNoteId: latestNote.id,
        };
        localStorage.setItem(LOCALSTORAGE_RELEASE_NOTES_KEY, JSON.stringify(data));
      } else {
        localStorage.removeItem(LOCALSTORAGE_RELEASE_NOTES_KEY);
      }
      setIsLatestNoteViewed(isViewed);
    },
    [setIsLatestNoteViewed]
  );

  useEffect(() => {
    // Detect value changes on other tabs:
    const onStorageChange = (e: StorageEvent) => {
      if (e.key !== LOCALSTORAGE_RELEASE_NOTES_KEY) {
        return;
      }

      setIsLatestNoteViewed(e.newValue === latestNote.id);
    };
    window.addEventListener('storage', onStorageChange);

    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  return {
    latestNote,
    previousNotes,
    isLatestNoteViewed,
    setIsLatestNoteViewed: _setIsLatestNoteViewed,
  };
};
