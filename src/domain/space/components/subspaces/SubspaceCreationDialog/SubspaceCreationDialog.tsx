import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { Button, DialogActions, DialogContent, SvgIconProps } from '@mui/material';
import React, { FC, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceCreationForm, SpaceFormValues } from './SubspaceCreationForm';

interface SubspaceCreationDialogProps {
  open: boolean;
  icon?: ReactElement<SvgIconProps>;
  spaceDisplayName: string;
  onClose: () => void;
  onCreate: (value: SpaceFormValues) => Promise<void>;
  formComponent: React.ComponentType<SpaceCreationForm>;
}

export const SubspaceCreationDialog: FC<SubspaceCreationDialogProps> = ({
  open,
  icon,
  spaceDisplayName,
  onClose,
  onCreate,
  formComponent: FormComponent,
}) => {
  const { t } = useTranslation();
  const [formInvalid, setFormInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState<SpaceFormValues>({
    displayName: '',
    tagline: '',
    tags: [],
    // addTutorialCallouts: false,
    addCallouts: true,
    collaborationTemplateId: undefined,
    visuals: {
      avatar: { file: undefined, altText: '' },
      cardBanner: { file: undefined, altText: '' },
    },
  });

  const handleChange = (value: SpaceFormValues) => setValue(value);
  const handleValidChange = (valid: boolean) => setFormInvalid(!valid);
  const handleCreate = async () => {
    setSubmitting(true);
    await onCreate(value);
    setSubmitting(false);
  };

  return (
    <DialogWithGrid open={open} maxWidth="xs" fullWidth>
      <DialogHeader onClose={onClose} icon={icon}>
        {t('space-creation.dialog-title', { entity: spaceDisplayName })}
      </DialogHeader>
      <DialogContent>
        <FormComponent isSubmitting={submitting} onChanged={handleChange} onValidChanged={handleValidChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text" disabled={submitting} sx={{ alignSelf: 'start' }}>
          {t('buttons.cancel')}
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          loading={submitting}
          disabled={formInvalid}
          sx={{ alignSelf: 'end' }}
        >
          {t('buttons.create')}
        </Button>
      </DialogActions>
    </DialogWithGrid>
  );
};
