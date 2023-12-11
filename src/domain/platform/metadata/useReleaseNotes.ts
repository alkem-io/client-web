import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSessionState } from '../../../core/utils/sessionState';

const LOCALSTORAGE_RELEASE_NOTES_KEY = 'releaseNotes';

const SESSION_STATE_KEY_HAS_SEEN_RELEASE_NOTES = 'hasSeenReleaseNotes';

interface ReleaseNotesData {
  lastSeenNoteId: string;
}

interface UseReleaseNotesProvided {
  note?: Note;
  open: boolean;
  onOpen: () => void;
  onClose: (dontShowAgain: boolean) => void;
  dontShowAgain: boolean;
  onDontShowAgain: () => void;
}

export interface Note {
  id: string;
  icon: string;
  title: string;
  content: string;
}

const hasViewedLatestNote = (lastNoteId: string) => {
  const data = localStorage.getItem(LOCALSTORAGE_RELEASE_NOTES_KEY);
  if (!data) {
    return false;
  }
  try {
    const { lastSeenNoteId } = JSON.parse(data) as ReleaseNotesData;
    return lastSeenNoteId === lastNoteId;
  } catch {
    return false;
  }
};

const useReleaseNotes = (): UseReleaseNotesProvided => {
  const { t } = useTranslation();
  const notes = t('notifications.releaseUpdates', { returnObjects: true });
  // get only the value and reverse it to get the latest note first
  // json object keys are ordered in alphanumerical order
  const [latestNote] = Object.entries(notes)
    .reverse()
    .map(
      ([key, note]): Note => ({
        ...note,
        id: key,
        icon: t('notifications.icon'),
      })
    );

  const dontShowAgain = useRef(hasViewedLatestNote(latestNote.id)).current;

  const [hasClosedDialog, setHasClosedDialog] = useSessionState(SESSION_STATE_KEY_HAS_SEEN_RELEASE_NOTES, false);

  const [isDialogOpen, setIsDialogOpen] = useState(!dontShowAgain && !hasClosedDialog);

  const handleOpen = useCallback(() => setIsDialogOpen(true), [setIsDialogOpen]);

  const handleClose = useCallback(
    (dontShowAgain: boolean) => {
      setIsDialogOpen(false);
      setHasClosedDialog(true);
      if (dontShowAgain) {
        handleDontShowAgain();
      }
    },
    [setIsDialogOpen]
  );

  const handleDontShowAgain = useCallback(() => {
    const data: ReleaseNotesData = {
      lastSeenNoteId: latestNote.id,
    };
    localStorage.setItem(LOCALSTORAGE_RELEASE_NOTES_KEY, JSON.stringify(data));
  }, [latestNote.id]);

  return {
    open: isDialogOpen,
    note: latestNote,
    onOpen: handleOpen,
    onClose: handleClose,
    dontShowAgain: dontShowAgain,
    onDontShowAgain: handleDontShowAgain,
  };
};

export default useReleaseNotes;
