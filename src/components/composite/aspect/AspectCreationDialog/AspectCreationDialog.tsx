import React, { FC, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import { DialogActions, DialogContent, DialogTitle } from '../../../core/dialog';
import { Box, Button, Step } from '@mui/material';
import StepLabel from '@mui/material/StepLabel';

const steps = ['Choose an aspect type', 'Some basic info', 'Final check'];

export interface AspectCreationDialogProps {
  open: boolean;
  onCancel: () => void;
}

const AspectCreationDialog: FC<AspectCreationDialogProps> = ({ open, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedStep] = useState(new Set<number>());

  const handleNext = () => {
    setCompletedStep(completedSteps.add(activeStep));
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    // state is not updated
    completedSteps.delete(activeStep - 1);
    setCompletedStep(completedSteps);
  };

  const handleCancel = () => {
    setActiveStep(0);
    setCompletedStep(new Set<number>());
    onCancel();
  };

  const isStepFinal = (step: number) => step === steps.length - 1;
  const isStepCompleted = (step: number) => completedSteps.has(step);

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="remove-dialog-title">
      <DialogTitle id="remove-dialog-title" onClose={handleCancel}>
        Aspect creation
      </DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={activeStep}>
          {steps.map((x, i) => (
            <Step key={i} last={isStepFinal(i)} completed={isStepCompleted(i)}>
              <StepLabel>{x}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <Button onClick={handleNext}>{isStepFinal(activeStep) ? 'Finish' : 'Next'}</Button>
      </DialogActions>
    </Dialog>
  );
};
export default AspectCreationDialog;
