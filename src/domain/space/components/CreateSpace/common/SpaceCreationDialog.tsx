import { Button, DialogActions, DialogContent, type SvgIconProps } from '@mui/material';
import type React from 'react';
import { type FC, type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import useEnsurePresence from '@/core/utils/ensurePresence';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import type { SpaceCreationForm, SpaceFormValues } from './SpaceCreationDialog.models';

interface SpaceCreationDialogProps {
  open?: boolean;
  icon?: ReactElement<SvgIconProps>;
  entityName: string;
  onClose?: () => void;
  onCreate: (value: SpaceFormValues) => Promise<unknown>;
  formComponent: React.ComponentType<SpaceCreationForm>;
  accountId?: string;
}

export const SpaceCreationDialog: FC<SpaceCreationDialogProps> = ({
  open = false,
  icon,
  entityName,
  onClose,
  onCreate,
  formComponent: FormComponent,
  accountId,
}) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();
  const [formIsValid, setFormIsValid] = useState(false);
  const [value, setValue] = useState<SpaceFormValues>();

  const handleChange = (value: SpaceFormValues) => setValue(value);
  const [handleCreate, isSubmitting] = useLoadingState(async () => {
    const formValues = ensurePresence(value);
    await onCreate(formValues);
  });

  return (
    <DialogWithGrid
      open={open}
      maxWidth="xs"
      fullWidth={true}
      aria-labelledby="space-creation-dialog-title"
      onClose={onClose}
    >
      <DialogHeader id="space-creation-dialog-title" onClose={onClose} icon={icon}>
        {t('space-creation.dialog-title', { entity: entityName })}
      </DialogHeader>
      <DialogContent>
        <FormComponent
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onValidChanged={setFormIsValid}
          accountId={accountId}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text" disabled={isSubmitting} sx={{ alignSelf: 'start' }}>
          {t('buttons.cancel')}
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          loading={isSubmitting}
          disabled={!formIsValid}
          sx={{ alignSelf: 'end' }}
        >
          {t('buttons.create')}
        </Button>
      </DialogActions>
    </DialogWithGrid>
  );
};
