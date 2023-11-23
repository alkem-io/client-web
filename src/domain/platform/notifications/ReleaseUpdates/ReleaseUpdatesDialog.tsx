import React, { FC, useCallback, useState, useEffect } from 'react';
import { Box, Dialog, DialogContent, DialogActions, FormGroup, FormControlLabel, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { useReleaseNotes } from '../../metadata/useReleaseNotes';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';

const SKIP_THIS_VERSION = false; // if true the dialog is never shown
const Icon = props => <Box sx={{ display: 'inline', fontSize: '1.5em', marginRight: gutters(0.5) }} {...props} />;

const ReleaseUpdatesDialog: FC = () => {
  const { t } = useTranslation();
  // is the dialog shown is controlled by isLatestNoteViewed
  const [isNotificationVisible, setIsNotificationVisible] = useState(true);
  const [dontShowDialogSwitchValue, setDontShowDialogSwitchValue] = useState(false);

  const { latestNote, isLatestNoteViewed, setIsLatestNoteViewed } = useReleaseNotes();

  useEffect(() => setIsNotificationVisible(!isLatestNoteViewed), [isLatestNoteViewed]);

  const handleCloseNotification = useCallback(() => {
    setIsNotificationVisible(false);
    setIsLatestNoteViewed(dontShowDialogSwitchValue);
  }, [setIsNotificationVisible, setIsLatestNoteViewed, dontShowDialogSwitchValue]);

  const handleDontShowAgainSwitch = (checked: boolean) => setDontShowDialogSwitchValue(checked);

  return !SKIP_THIS_VERSION && !isLatestNoteViewed ? (
    <>
      {isNotificationVisible && (
        <Dialog open={isNotificationVisible} maxWidth="lg">
          <DialogHeader onClose={handleCloseNotification}>
            <BlockTitle>
              <Icon>{latestNote.icon}</Icon>
              {latestNote.title}
            </BlockTitle>
          </DialogHeader>
          <DialogContent>
            <WrapperMarkdown>{latestNote.content}</WrapperMarkdown>
          </DialogContent>
          <DialogActions>
            <FormGroup>
              <FormControlLabel
                control={<Switch onChange={(_, checked) => handleDontShowAgainSwitch(checked)} />}
                label={t('notifications.dont-show-notes')}
              />
            </FormGroup>
          </DialogActions>
        </Dialog>
      )}
    </>
  ) : null;
};

export default ReleaseUpdatesDialog;
