import { Box, CircularProgress, Switch, Typography } from '@mui/material';
import { ChangeEvent, useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';

export interface GuestAccessToggleProps {
  enabled: boolean;
  canToggle: boolean;
  isMutating: boolean;
  onToggle: (nextState: boolean) => Promise<void>;
  error?: { code: string; message: string };
  resetError?: () => void;
}

const GuestAccessToggle = ({ enabled, canToggle, isMutating, onToggle, error, resetError }: GuestAccessToggleProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [optimisticValue, setOptimisticValue] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setOptimisticValue(null);
  }, [enabled]);

  useEffect(() => {
    if (!error) {
      return;
    }

    const genericMessage = t('share-dialog.guestAccess.errors.generic');
    const translatedMessage =
      (error.code && t(`share-dialog.guestAccess.errors.${error.code}`, { defaultValue: genericMessage })) ||
      error.message ||
      genericMessage;

    notify(translatedMessage, 'error');
    resetError?.();
    setOptimisticValue(null);
  }, [error, notify, resetError, t]);

  const handleChange = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (!canToggle || isMutating || isPending) {
      return;
    }

    startTransition(() => {
      setOptimisticValue(checked);
    });

    onToggle(checked).catch(() => {
      setOptimisticValue(null);
    });
  };

  const displayValue = optimisticValue ?? enabled;
  const disabled = !canToggle || isMutating || isPending;

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" mt={1.5} columnGap={2}>
      <Box flex={1} mr={2} minWidth={0}>
        <Typography component="p" variant="subtitle2">
          {t('share-dialog.guestAccess.toggleLabel')}
        </Typography>
        <Typography component="p" variant="body2" color="text.secondary">
          {t('share-dialog.guestAccess.toggleDescription')}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" columnGap={1.5}>
        {(isMutating || isPending) && <CircularProgress size={16} thickness={5} />}
        <Switch
          color="primary"
          checked={displayValue}
          onChange={handleChange}
          disabled={disabled}
          inputProps={{ 'aria-label': t('share-dialog.guestAccess.toggleAriaLabel') }}
        />
      </Box>
    </Box>
  );
};

export default GuestAccessToggle;
