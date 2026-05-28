import { Alert, Button, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import useResolveUserEmailDrift from './useResolveUserEmailDrift';

type ResolveEmailDriftDialogProps = {
  open: boolean;
  userId: string;
  oldEmail: string | undefined;
  newEmail: string | undefined;
  onClose: () => void;
};

const DIALOG_ID = 'resolve-email-drift-dialog';

const ResolveEmailDriftDialog = ({ open, userId, oldEmail, newEmail, onClose }: ResolveEmailDriftDialogProps) => {
  const { t } = useTranslation();
  const { resolveDrift, loading, errorMessage, clearError } = useResolveUserEmailDrift(userId);
  const [selectedEmail, setSelectedEmail] = useState('');

  const handleClose = () => {
    clearError();
    setSelectedEmail('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedEmail) {
      return;
    }
    const success = await resolveDrift(selectedEmail);
    if (success) {
      handleClose();
    }
  };

  return (
    <DialogWithGrid open={open} onClose={handleClose} aria-labelledby={DIALOG_ID}>
      <DialogHeader
        id={DIALOG_ID}
        title={t('pages.admin.users.emailChange.drift.resolveTitle')}
        onClose={handleClose}
      />
      <PageContentBlockSeamless>
        <Caption id="resolve-email-drift-description">
          {t('pages.admin.users.emailChange.drift.resolveDescription')}
        </Caption>
        <RadioGroup
          aria-labelledby="resolve-email-drift-description"
          value={selectedEmail}
          onChange={event => setSelectedEmail(event.target.value)}
        >
          {oldEmail && (
            <FormControlLabel
              value={oldEmail}
              control={<Radio />}
              disabled={loading}
              label={t('pages.admin.users.emailChange.drift.oldEmailChoice', { email: oldEmail })}
            />
          )}
          {newEmail && (
            <FormControlLabel
              value={newEmail}
              control={<Radio />}
              disabled={loading}
              label={t('pages.admin.users.emailChange.drift.newEmailChoice', { email: newEmail })}
            />
          )}
        </RadioGroup>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      </PageContentBlockSeamless>
      <Actions padding={gutters()}>
        <Button onClick={handleClose} disabled={loading}>
          {t('buttons.cancel')}
        </Button>
        <Button variant="contained" onClick={handleSubmit} loading={loading} disabled={!selectedEmail || loading}>
          {t('pages.admin.users.emailChange.drift.resolveSubmit')}
        </Button>
      </Actions>
    </DialogWithGrid>
  );
};

export default ResolveEmailDriftDialog;
