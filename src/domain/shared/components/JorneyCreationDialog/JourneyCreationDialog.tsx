import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import { DialogActions, DialogContent, DialogTitle } from '../../../../core/ui/dialog/deprecated';
import { JourneyCreationForm, JourneyFormValues } from './JourneyCreationForm';

interface JourneyCreationDialogProps {
  open: boolean;
  icon?: React.ReactNode;
  journeyName: string;
  onClose: () => void;
  onCreate: (value: JourneyFormValues) => Promise<void>;
  formComponent: React.ComponentType<JourneyCreationForm>;
}

export const JourneyCreationDialog: FC<JourneyCreationDialogProps> = ({
  open,
  icon,
  journeyName,
  onClose,
  onCreate,
  formComponent: FormComponent,
}) => {
  const { t } = useTranslation();
  const [formInvalid, setFormInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState<JourneyFormValues>({
    displayName: '',
    tagline: '',
    vision: '',
    tags: [],
    addTutorialCallouts: false,
    addCallouts: true,
  });

  const handleChange = (value: JourneyFormValues) => setValue(value);
  const handleValidChange = (valid: boolean) => setFormInvalid(!valid);
  const handleCreate = async () => {
    setSubmitting(true);
    await onCreate(value);
    setSubmitting(false);
  };

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle onClose={onClose}>
        <Box display="flex" gap={1}>
          {icon}
          {t('journey-creation.dialog-title', { entity: journeyName })}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <FormComponent isSubmitting={submitting} onChanged={handleChange} onValidChanged={handleValidChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text" disabled={submitting} sx={{ alignSelf: 'start' }}>
          {t('buttons.cancel')}
        </Button>
        <LoadingButton
          onClick={handleCreate}
          variant="contained"
          loading={submitting}
          loadingIndicator={`${t('buttons.create')}...`}
          disabled={formInvalid}
          sx={{ alignSelf: 'end' }}
        >
          {t('buttons.create')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
