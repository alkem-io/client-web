import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import CalloutForm, { CalloutFormOutput } from '../../../CalloutForm';
import { StepComponentProps } from '../../../../../shared/components/Steps/step/Step';
import { OneStepCreationLayout } from '../../step-layout/StepLayout';
import { CalloutStepProps } from '../CalloutStepProps';

export interface CalloutInfoStepProps extends CalloutStepProps {
  onChange?: (callout: CalloutFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  onSaveAsDraft: () => Promise<void>;
  isCreating: boolean;
}

const CalloutInfoStep: FC<StepComponentProps & CalloutInfoStepProps> = ({
  callout,
  onChange,
  onClose,
  onStatusChanged,
  isValid,
  onSaveAsDraft,
  isCreating,
}) => {
  const { t } = useTranslation();
  return (
    <OneStepCreationLayout
      dialogTitle={t('components.callout-creation.title')}
      onClose={onClose}
      isValid={isValid}
      isCreating={isCreating}
      onSaveAsDraft={onSaveAsDraft}
    >
      <Box paddingY={theme => theme.spacing(2)}>
        <CalloutForm callout={callout} onChange={onChange} onStatusChanged={onStatusChanged} />
      </Box>
    </OneStepCreationLayout>
  );
};
CalloutInfoStep.displayName = 'CalloutInfoStep';

export default CalloutInfoStep;
