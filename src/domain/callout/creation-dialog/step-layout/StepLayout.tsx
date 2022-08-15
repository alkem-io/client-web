import React, { FC, useMemo } from 'react';
import { Box, LinearProgress, Step, StepLabel, Stepper } from '@mui/material';
import { DialogActions, DialogContent, DialogTitle } from '../../../../components/core/dialog';
import Button from '@mui/material/Button';
import createLayoutHolder from '../../../shared/layout/LayoutHolder';
import { StepDefinition } from '../../../shared/components/Stepper/step/Step';

export interface StepLayoutProps {
  title: string;
  next?: () => void;
  prev?: () => void;
  onClose: () => void;
  steps: StepDefinition[];
  activeStep: string;
}

export const StepLayoutImpl: FC<StepLayoutProps> = ({ activeStep, steps, children, title, onClose, next, prev }) => {
  // For now, using just the active step position to determine whether the previous steps are completed.
  // It's possible to base the state of the Stepper on whether a step was "really" completed (e.g. the form was filled),
  // in this case StepLayoutImpl needs to receive something like completedSteps: { [stepName: string]: boolean }
  const activeStepIndex = useMemo(() => steps.findIndex(stepDef => stepDef.name === activeStep), [steps, activeStep]);

  return (
    <Box>
      <DialogTitle id="callout-creation-title" onClose={onClose}>
        {title}
      </DialogTitle>
      <LinearProgress value={100 * ((activeStepIndex + 1) / steps.length)} variant="determinate" />
      <Stepper activeStep={activeStepIndex}>
        {steps.map((stepDef, stepIndex) => {
          return (
            <Step key={stepDef.name} completed={stepIndex < activeStepIndex}>
              <StepLabel>{stepDef.title}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={prev} disabled={!prev}>
          prev
        </Button>
        <Button onClick={next} disabled={!next}>
          next
        </Button>
      </DialogActions>
    </Box>
  );
};

export interface StepSummaryLayoutProps {
  onClose: () => void;
}

export const StepSummaryLayoutImpl: FC<StepSummaryLayoutProps> = ({ children, onClose }) => {
  return (
    <Box>
      <DialogTitle id="callout-creation-title" onClose={onClose}>
        Summary
      </DialogTitle>
      <LinearProgress value={100} variant="determinate" />
      Congrats!
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Finish</Button>
      </DialogActions>
    </Box>
  );
};

export const { LayoutHolder: StepLayoutHolder, createLayout } = createLayoutHolder();

export const StepLayout = createLayout(StepLayoutImpl);
export const StepSummaryLayout = createLayout(StepSummaryLayoutImpl);
