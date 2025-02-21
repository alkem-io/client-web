import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, DialogActions, DialogContent, SvgIconProps } from '@mui/material';
import React, { FC, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JourneyCreationForm, JourneyFormValues } from './JourneyCreationForm';

interface JourneyCreationDialogProps {
  open: boolean;
  icon?: ReactElement<SvgIconProps>;
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
    tags: [],
    addTutorialCallouts: false,
    collaborationTemplateId: undefined,
    visuals: {
      avatar: { file: undefined, altText: '' },
      cardBanner: { file: undefined, altText: '' },
    },
  });

  const handleChange = (value: JourneyFormValues) => setValue(value);
  const handleValidChange = (valid: boolean) => setFormInvalid(!valid);
  const handleCreate = async () => {
    setSubmitting(true);
    await onCreate(value);
    setSubmitting(false);
  };

  return (
    <DialogWithGrid open={open} maxWidth="xs" fullWidth>
      <DialogHeader onClose={onClose} icon={icon}>
        {t('journey-creation.dialog-title', { entity: journeyName })}
      </DialogHeader>
      <DialogContent>
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
          disabled={formInvalid}
          sx={{ alignSelf: 'end' }}
        >
          {t('buttons.create')}
        </LoadingButton>
      </DialogActions>
    </DialogWithGrid>
  );
};
