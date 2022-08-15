import React, { FC } from 'react';
import { StepComponentProps } from '../../../shared/components/Stepper/step/Step';
import { StepLayout, StepSummaryLayout } from '../step-layout/StepLayout';

interface CloseableProps {
  onClose: () => void;
}

export const CalloutStep1: FC<StepComponentProps> = ({ next, prev, definitions, activeStep }) => {
  return (
    <StepLayout
      title={'Create callout info'}
      onClose={() => {}}
      next={next}
      prev={prev}
      steps={definitions}
      activeStep={activeStep}
    >
      this is content step 1
    </StepLayout>
  );
};
CalloutStep1.displayName = 'CalloutStep1';

interface ChangeableProps {
  onChange: ({ value: string }) => void;
}

export const CalloutStep2: FC<StepComponentProps & ChangeableProps> = ({
  next,
  prev,
  definitions,
  activeStep,
  onChange,
}) => {
  const handleNext =
    next &&
    (() => {
      onChange({ value: 'set by step 2' });
      next();
    });

  return (
    <StepLayout
      title={'Create callout template'}
      onClose={() => {}}
      next={handleNext}
      prev={prev}
      steps={definitions}
      activeStep={activeStep}
    >
      this is content step 2
    </StepLayout>
  );
};
CalloutStep2.displayName = 'CalloutStep2';

export const CalloutStep3: FC<CloseableProps> = ({ onClose }) => {
  return <StepSummaryLayout onClose={onClose}>this is summary step</StepSummaryLayout>;
};
CalloutStep3.displayName = 'CalloutStep3';
