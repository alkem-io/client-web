import React, { FC } from 'react';
import { Box } from '@mui/material';
import { StepComponentProps } from '../../../shared/components/Stepper/step/Step';
import Button from '@mui/material/Button';

export const CalloutStep1: FC<StepComponentProps> = ({ next, prev }) => {
  return (
    <Box>
      this is step 1
      <Button onClick={next} disabled={!next}>next</Button>
      <Button onClick={prev} disabled={!prev}>prev</Button>
    </Box>
  )
};
CalloutStep1.displayName = 'CalloutStep1';

export const CalloutStep2: FC<StepComponentProps> = ({ next, prev }) => {
  return (
    <Box>
      this is step 2
      <Button onClick={next} disabled={!next}>next</Button>
      <Button onClick={prev} disabled={!prev}>prev</Button>
    </Box>
  )
};
CalloutStep2.displayName = 'CalloutStep2';


export const CalloutStep3: FC<StepComponentProps> = ({ next, prev }) => {
  return (
    <Box>
      this is step 3
      <Button onClick={next} disabled={!next}>next</Button>
      <Button onClick={prev} disabled={!prev}>prev</Button>
    </Box>
  )
};
CalloutStep3.displayName = 'CalloutStep3';
