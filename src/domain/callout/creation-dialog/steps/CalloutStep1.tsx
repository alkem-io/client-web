import React, { FC } from 'react';
import { StepComponentProps } from '../../../shared/components/Stepper/step/Step';
import { StepLayout, StepLayoutImpl, StepSummaryLayout, StepSummaryLayoutImpl } from '../step-layout/StepLayout';

export const CalloutStep1: FC<StepComponentProps> = ({ next, prev }) => {
  return (
    <StepLayoutImpl title={'Create callout info'} onClose={() => {}} next={next} prev={prev}>
      this is content step 1
    </StepLayoutImpl>
  )
};
CalloutStep1.displayName = 'CalloutStep1';

export const CalloutStep2: FC<StepComponentProps> = ({ next, prev }) => {
  return (
    <StepLayoutImpl title={'Create callout template'} onClose={() => {}} next={next} prev={prev}>
      this is content step 2
    </StepLayoutImpl>
  )
};
CalloutStep2.displayName = 'CalloutStep2';


export const CalloutStep3: FC<StepComponentProps> = ({ next, prev }) => {
  return (
    <StepSummaryLayoutImpl onClose={() => {}}>
      this is summary step
    </StepSummaryLayoutImpl>
  )
};
CalloutStep3.displayName = 'CalloutStep3';
