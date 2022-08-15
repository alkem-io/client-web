import React, { FC } from 'react';
import { StepComponentProps } from '../../../shared/components/Stepper/step/Step';
import { StepLayout, StepLayoutImpl, StepSummaryLayout, StepSummaryLayoutImpl } from '../step-layout/StepLayout';

interface CloseableProps {
  onClose: () => void;
}

export const CalloutStep1: FC<StepComponentProps> = ({ next, prev }) => {
  return (
    <StepLayoutImpl title={'Create callout info'} onClose={() => {}} next={next} prev={prev}>
      this is content step 1
    </StepLayoutImpl>
  )
};
CalloutStep1.displayName = 'CalloutStep1';

interface ChangeableProps {
  onChange: ({ value: string }) => void;
}

export const CalloutStep2: FC<StepComponentProps & ChangeableProps> = ({ next, prev, onChange }) => {
  const handleNext = next && (() => {
    onChange({ value: 'set by step 2' });
    next();
  });

  return (
    <StepLayoutImpl title={'Create callout template'} onClose={() => {}} next={handleNext} prev={prev}>
      this is content step 2
    </StepLayoutImpl>
  )
};
CalloutStep2.displayName = 'CalloutStep2';


export const CalloutStep3: FC<CloseableProps> = ({ onClose }) => {
  return (
    <StepSummaryLayoutImpl onClose={onClose}>
      this is summary step
    </StepSummaryLayoutImpl>
  )
};
CalloutStep3.displayName = 'CalloutStep3';
