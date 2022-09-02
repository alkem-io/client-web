import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import CalloutForm, {
  CalloutFormOutput,
} from '../../../../common/components/composite/aspect/AspectCreationDialog/form/CalloutForm';
import { StepComponentProps } from '../../../shared/components/Steps/step/Step';
import { StepLayout } from '../step-layout/StepLayout';
import { CalloutStepProps } from './CalloutStepProps';

export interface CalloutInfoStepProps extends CalloutStepProps {
  onChange?: (callout: CalloutFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
}

const CalloutInfoStep: FC<StepComponentProps & CalloutInfoStepProps> = ({
  callout,
  onChange,
  onClose,
  onStatusChanged,
  activeStep,
  isValid,
  steps,
  next,
  prev,
}) => {
  const { t } = useTranslation();
  return (
    <StepLayout
      dialogTitle={t('components.callout-creation.title')}
      onClose={onClose}
      next={next}
      prev={prev}
      activeStep={activeStep}
      steps={steps}
      isValid={isValid}
    >
      <Box paddingY={theme => theme.spacing(2)}>
        <CalloutForm callout={callout} onChange={onChange} onStatusChanged={onStatusChanged} />
      </Box>
    </StepLayout>
  );
};
CalloutInfoStep.displayName = 'CalloutInfoStep';

export default CalloutInfoStep;
