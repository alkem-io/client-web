import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const LOCALSTORAGE_RELEASE_NOTES_KEY = 'releaseNotes';

interface ReleaseNotesData {
  lastSeenNoteId: string;
}

type NoteType = {
  id: string;
  icon: string;
  title: string;
  content: string;
};

export const useReleaseNotes = () => {
  const { t } = useTranslation();
  const notes = t('notifications.releaseUpdates', { returnObjects: true });
  // get only the value and reverse it to get the latest note first
  // json object keys are ordered in alphanumerical order
  const [latestNote, ...previousNotes]: NoteType[] = Object.entries(notes)
    .reverse()
    .map(([key, note]) => ({
      ...note,
      id: key,
      icon: t('notifications.icon'),
    }));

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

  const triggerShowDialog = () => {
    localStorage.removeItem(LOCALSTORAGE_RELEASE_NOTES_KEY);
    setIsLatestNoteViewed(false);
    const event = new StorageEvent('storage', {
      key: LOCALSTORAGE_RELEASE_NOTES_KEY,
    });
    window.dispatchEvent(event);
  };

  return {
    latestNote,
    previousNotes,
    isLatestNoteViewed,
    setIsLatestNoteViewed: _setIsLatestNoteViewed,
    triggerShowDialog,
  };
};
