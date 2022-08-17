import React, { FC } from 'react';
import { StepComponentProps } from '../../../shared/components/Stepper/step/Step';
import { StepLayout } from '../step-layout/StepLayout';

export const CalloutStep2: FC<StepComponentProps> = ({
  next,
  prev,
  steps,
  activeStep,
}) => {
  const handleNext = next && (() =>  next());

  return (
    <StepLayout
      dialogTitle={'Create callout template'}
      onClose={() => {}}
      next={handleNext}
      prev={prev}
      steps={steps}
      activeStep={activeStep}
    >
      this is content step 2
    </StepLayout>
  );
};
CalloutStep2.displayName = 'CalloutStep2';

export const CalloutStep3: FC<StepComponentProps> = ({ next,
                                                   prev,
                                                   steps,
                                                   activeStep, }) => {
  const handleNext = next && (() =>  next());
  //return <StepSummaryLayout onClose={onClose}>this is summary step</StepSummaryLayout>;
  return (
    <StepLayout
      dialogTitle={'Create callout template'}
      onClose={() => {}}
      next={handleNext}
      prev={prev}
      steps={steps}
      activeStep={activeStep}
    >
      this is content step 3
    </StepLayout>
  )
};
CalloutStep3.displayName = 'CalloutStep3';
