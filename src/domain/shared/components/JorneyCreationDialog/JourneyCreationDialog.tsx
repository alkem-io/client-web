import React, { useState } from 'react';

import Box from '@mui/material/Box';
import { Dialog } from '@mui/material';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import LoadingButton from '@mui/lab/LoadingButton';

import { DialogActions, DialogContent, DialogTitle } from '../../../../core/ui/dialog/deprecated';

import { type JourneyCreationForm, type JourneyFormValues } from './JourneyCreationForm';

export const JourneyCreationDialog = ({
  open,
  icon,
  journeyName,
  formComponent: FormComponent,
  onClose,
  onCreate,
}: JourneyCreationDialogProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [formInvalid, setFormInvalid] = useState(false);
  const [value, setValue] = useState<JourneyFormValues>({
    tags: [],
    vision: '',
    tagline: '',
    displayName: '',
    addCallouts: true,
    addTutorialCallouts: false,
  });

  const { t } = useTranslation();

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
          variant="contained"
          loading={submitting}
          disabled={formInvalid}
          sx={{ alignSelf: 'end' }}
          loadingIndicator={`${t('buttons.create')}...`}
          onClick={handleCreate}
        >
          {t('buttons.create')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

type JourneyCreationDialogProps = {
  open: boolean;
  journeyName: string;
  formComponent: React.ComponentType<JourneyCreationForm>;
  onClose: () => void;
  onCreate: (value: JourneyFormValues) => Promise<void>;

  icon?: React.ReactNode;
};
