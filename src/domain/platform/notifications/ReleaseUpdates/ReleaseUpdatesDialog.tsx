import React, { useCallback, useState } from 'react';
import { Box, Dialog, DialogActions, DialogContent, FormControlLabel, FormGroup, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Note } from '../../metadata/useReleaseNotes';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';

const Icon = props => <Box sx={{ display: 'inline', fontSize: '1.5em', marginRight: gutters(0.5) }} {...props} />;

interface ReleaseUpdatesDialogProps {
  note?: Note;
  open?: boolean;
  onClose: (dontShowAgain: boolean) => void;
  onDontShowAgain: () => void;
}

const ReleaseUpdatesDialog = ({ open = false, note, onClose }: ReleaseUpdatesDialogProps) => {
  const { t } = useTranslation();

  const [dontShowDialogSwitchValue, setDontShowDialogSwitchValue] = useState(false);

  const handleClose = useCallback(() => {
    onClose(dontShowDialogSwitchValue);
  }, [dontShowDialogSwitchValue]);

  return (
    <Dialog open={open} maxWidth="lg" onClose={handleClose}>
      <DialogHeader onClose={handleClose}>
        <BlockTitle>
          <Icon>{note?.icon}</Icon>
          {note?.title}
        </BlockTitle>
      </DialogHeader>
      <DialogContent>
        <WrapperMarkdown>{note?.content ?? ''}</WrapperMarkdown>
      </DialogContent>
      <DialogActions>
        <FormGroup>
          <FormControlLabel
            control={<Switch onChange={(_, checked) => setDontShowDialogSwitchValue(checked)} />}
            label={t('notifications.dont-show-notes')}
          />
        </FormGroup>
      </DialogActions>
    </Dialog>
  );
};

export default ReleaseUpdatesDialog;
