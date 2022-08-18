import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import CalloutForm, { CalloutFormOutput } from '../../../../components/composite/aspect/AspectCreationDialog/form/CalloutForm';
import { CalloutCreationType } from '../CalloutCreationDialog';
import { StepComponentProps } from '../../../shared/components/Steps/step/Step';
import { StepLayoutImpl } from '../step-layout/StepLayout';

export interface CalloutInfoStepProps {
  callout: CalloutCreationType;
  onChange?: (callout: CalloutFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  onClose?: () => void;
}

const CalloutInfoStep: FC<StepComponentProps & CalloutInfoStepProps> = ({ callout, onChange, onClose, onStatusChanged, activeStep, isValid, steps, next, prev }) => {
  const { t } = useTranslation();
  return (
    <StepLayoutImpl
      dialogTitle={t('components.callout-creation.title')}
      onClose={onClose}
      next={next} prev={prev}
      activeStep={activeStep}
      steps={steps}
      isValid={isValid}
    >
      <Box paddingY={theme => theme.spacing(2)}>
        <CalloutForm
          callout={callout}
          onChange={onChange}
          onStatusChanged={onStatusChanged}
        />
      </Box>
    </StepLayoutImpl>
  );
};
CalloutInfoStep.displayName = 'CalloutInfoStep';

export default CalloutInfoStep;
