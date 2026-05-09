import { Box, Button, CircularProgress, FormHelperText, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import useResolveSpaceUrl from './useResolveSpaceUrl';

type Status = { kind: 'idle' } | { kind: 'validating' } | { kind: 'invalid' } | { kind: 'duplicate' };

interface AddSpaceByUrlDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (spaceId: string) => Promise<void>;
  existingSpaceIds: string[];
}

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const AddSpaceByUrlDialog = ({ open, onClose, onAdd, existingSpaceIds }: AddSpaceByUrlDialogProps) => {
  const { t } = useTranslation();
  const { resolve } = useResolveSpaceUrl();

  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const handleClose = () => {
    setUrl('');
    setStatus({ kind: 'idle' });
    onClose();
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    if (status.kind !== 'idle' && status.kind !== 'validating') {
      setStatus({ kind: 'idle' });
    }
  };

  const trimmedUrl = url.trim();
  const submitDisabled = trimmedUrl === '' || !isValidUrl(trimmedUrl) || status.kind === 'validating';

  const handleSubmit = async () => {
    if (submitDisabled) {
      return;
    }
    setStatus({ kind: 'validating' });
    const result = await resolve(trimmedUrl);
    if (result.kind === 'invalid') {
      setStatus({ kind: 'invalid' });
      return;
    }
    if (existingSpaceIds.includes(result.spaceId)) {
      setStatus({ kind: 'duplicate' });
      return;
    }
    try {
      await onAdd(result.spaceId);
      setUrl('');
      setStatus({ kind: 'idle' });
      onClose();
    } catch {
      setStatus({ kind: 'invalid' });
    }
  };

  const errorMessage =
    status.kind === 'invalid'
      ? t('pages.admin.innovationHub.spaceListFilter.addByUrl.invalidSpaceUrl')
      : status.kind === 'duplicate'
        ? t('pages.admin.innovationHub.spaceListFilter.addByUrl.alreadyAdded')
        : undefined;

  return (
    <DialogWithGrid columns={6} open={open} onClose={handleClose} aria-labelledby="add-space-by-url-dialog">
      <DialogHeader
        id="add-space-by-url-dialog"
        title={t('pages.admin.innovationHub.spaceListFilter.addByUrl.dialogTitle')}
        onClose={handleClose}
      />
      <Gutters>
        <Stack spacing={1}>
          <TextField
            value={url}
            onChange={handleUrlChange}
            label={t('pages.admin.innovationHub.spaceListFilter.addByUrl.urlInputLabel')}
            placeholder={t('pages.admin.innovationHub.spaceListFilter.addByUrl.urlInputPlaceholder')}
            error={Boolean(errorMessage)}
            fullWidth={true}
            autoFocus={true}
            inputProps={{ 'aria-describedby': errorMessage ? 'add-space-by-url-error' : undefined }}
          />
          {errorMessage && (
            <FormHelperText id="add-space-by-url-error" error={true} role="alert" aria-live="polite">
              {errorMessage}
            </FormHelperText>
          )}
          {status.kind === 'validating' && (
            <Box display="flex" alignItems="center" gap={1} aria-live="polite">
              <CircularProgress size={16} />
              <span>{t('pages.admin.innovationHub.spaceListFilter.addByUrl.validating')}</span>
            </Box>
          )}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" onClick={handleClose}>
              {t('pages.admin.innovationHub.spaceListFilter.addByUrl.cancel')}
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={submitDisabled}>
              {t('pages.admin.innovationHub.spaceListFilter.addByUrl.submit')}
            </Button>
          </Stack>
        </Stack>
      </Gutters>
    </DialogWithGrid>
  );
};

export default AddSpaceByUrlDialog;
